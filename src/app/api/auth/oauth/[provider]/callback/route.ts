import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { getOAuthProvider, isOAuthProviderId } from "@/lib/oauth/providers";
import { OAUTH_COOKIE_NAME, verifyOAuthState } from "@/lib/auth/oauthState";
import { PENDING_SIGNUP_COOKIE_NAME, PENDING_SIGNUP_TTL_SECONDS, signPendingSignup } from "@/lib/auth/pendingSignup";
import { createSessionCookie } from "@/lib/auth/session";
import { OAUTH_MESSAGE_TYPE } from "@/lib/oauth/constants";
import { buildSessionFromUser } from "@/server/services/authService";
import { User } from "@/models/User";

type RouteContext = { params: Promise<{ provider: string }> };

type BridgeResult =
  | { ok: true }
  | { ok: true; needsCompanyName: true; name: string; email: string }
  | { ok: false; error: string };

/**
 * Renders a tiny bridge page instead of redirecting the window. When opened
 * as a popup (window.opener is set), it posts the result back to the tab
 * that opened it and closes itself - the opener never navigates away. If
 * there's no opener (direct visit, popup blocked and opened as a normal
 * tab instead), it falls back to a plain redirect so the flow still works.
 */
function bridgeResponse(request: NextRequest, result: BridgeResult): NextResponse {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const fallbackUrl = !result.ok
    ? `/login?error=${encodeURIComponent(result.error)}`
    : "needsCompanyName" in result
      ? "/signup"
      : "/dashboard";
  const payload = JSON.stringify({ type: OAUTH_MESSAGE_TYPE, ...result });

  const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>Signing in…</title></head>
  <body>
    <script>
      (function () {
        var payload = ${payload};
        if (window.opener) {
          window.opener.postMessage(payload, ${JSON.stringify(appUrl)});
          window.close();
        } else {
          window.location.replace(${JSON.stringify(fallbackUrl)});
        }
      })();
    </script>
  </body>
</html>`;

  const response = new NextResponse(html, { headers: { "Content-Type": "text/html" } });
  response.cookies.delete(OAUTH_COOKIE_NAME);
  return response;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { provider } = await params;
  if (!isOAuthProviderId(provider)) {
    return bridgeResponse(request, { ok: false, error: "oauth_unsupported" });
  }

  const config = getOAuthProvider(provider);
  if (!config || !config.clientId || !config.clientSecret) {
    return bridgeResponse(request, { ok: false, error: "oauth_not_configured" });
  }

  const oauthError = request.nextUrl.searchParams.get("error");
  if (oauthError) {
    return bridgeResponse(request, { ok: false, error: "oauth_denied" });
  }

  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");
  if (!code || !returnedState) {
    return bridgeResponse(request, { ok: false, error: "oauth_failed" });
  }

  const cookieToken = request.cookies.get(OAUTH_COOKIE_NAME)?.value;
  if (!cookieToken) {
    return bridgeResponse(request, { ok: false, error: "oauth_expired" });
  }

  const statePayload = await verifyOAuthState(cookieToken);
  // CSRF defense: the state Google echoes back must match the one minted into
  // this exact browser's signed cookie. An attacker can start their own flow,
  // but can't plant their state into the victim's cookie - so a mismatch here
  // means the authorization response doesn't belong to this browser's request.
  if (!statePayload || statePayload.provider !== provider || statePayload.state !== returnedState) {
    return bridgeResponse(request, { ok: false, error: "oauth_state_mismatch" });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const redirectUri = `${appUrl}/api/auth/oauth/${provider}/callback`;

  let tokenResponse: Response;
  try {
    tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        code_verifier: statePayload.codeVerifier,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
  } catch (error) {
    console.error("OAuth token exchange request failed:", error);
    return bridgeResponse(request, { ok: false, error: "oauth_failed" });
  }

  if (!tokenResponse.ok) {
    console.error("OAuth token exchange failed:", await tokenResponse.text());
    return bridgeResponse(request, { ok: false, error: "oauth_failed" });
  }

  const tokens = (await tokenResponse.json()) as { access_token?: string };
  if (!tokens.access_token) {
    return bridgeResponse(request, { ok: false, error: "oauth_failed" });
  }

  let profile: { email?: string; email_verified?: boolean; name?: string };
  try {
    const profileResponse = await fetch(config.userInfoUrl, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileResponse.ok) throw new Error(`userinfo responded ${profileResponse.status}`);
    profile = await profileResponse.json();
  } catch (error) {
    console.error("OAuth userinfo request failed:", error);
    return bridgeResponse(request, { ok: false, error: "oauth_failed" });
  }

  if (!profile.email || profile.email_verified === false) {
    return bridgeResponse(request, { ok: false, error: "oauth_unverified_email" });
  }

  await connectToDatabase();

  const email = profile.email.toLowerCase();
  const existingUser = await User.findOne({ email });

  // If an account already exists for this email, Google just proves identity
  // and logs them into it - regardless of whether the button said "sign in"
  // or "sign up".
  if (existingUser) {
    const session = await buildSessionFromUser(existingUser);
    if (!session) {
      return bridgeResponse(request, { ok: false, error: "oauth_failed" });
    }
    // Sets the same leadflow_session cookie password login sets - from here
    // on, OAuth- and password-authenticated sessions are indistinguishable.
    await createSessionCookie(session.ctx);
    return bridgeResponse(request, { ok: true });
  }

  // No account, and this was a "sign in" attempt, not "sign up" - matches the
  // "an admin must invite you" trust boundary; no self-serve provisioning.
  if (statePayload.intent !== "signup") {
    return bridgeResponse(request, { ok: false, error: "oauth_no_account" });
  }

  // No account, but intent is signup: identity is verified, but there's no
  // company name yet - Google never provides one. Stash the verified
  // {email, name} in a short-lived token and hand control back to the
  // opener to collect it, rather than guessing a name like "X's Company".
  const name = profile.name ?? email.split("@")[0];
  const pendingToken = await signPendingSignup({ email, name });

  const response = bridgeResponse(request, { ok: true, needsCompanyName: true, name, email });
  response.cookies.set(PENDING_SIGNUP_COOKIE_NAME, pendingToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_SIGNUP_TTL_SECONDS,
  });
  return response;
}
