import { NextResponse, type NextRequest } from "next/server";
import { getOAuthProvider, isOAuthProviderId } from "@/lib/oauth/providers";
import { generateCodeChallenge, generateCodeVerifier, generateState } from "@/lib/oauth/pkce";
import { OAUTH_COOKIE_NAME, OAUTH_STATE_TTL_SECONDS, signOAuthState } from "@/lib/auth/oauthState";

type RouteContext = { params: Promise<{ provider: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { provider } = await params;

  if (!isOAuthProviderId(provider)) {
    return NextResponse.redirect(new URL("/login?error=oauth_unsupported", request.url));
  }

  const config = getOAuthProvider(provider);
  if (!config || !config.clientId) {
    return NextResponse.redirect(new URL("/login?error=oauth_not_configured", request.url));
  }

  const intent = request.nextUrl.searchParams.get("intent") === "signup" ? "signup" : "login";

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const redirectUri = `${appUrl}/api/auth/oauth/${provider}/callback`;

  const authorizeUrl = new URL(config.authUrl);
  authorizeUrl.searchParams.set("client_id", config.clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", config.scope);
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("access_type", "online");
  authorizeUrl.searchParams.set("prompt", "select_account");

  const cookieValue = await signOAuthState({ provider, state, codeVerifier, intent });

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(OAUTH_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // must survive the top-level cross-site redirect back from the provider
    path: "/",
    maxAge: OAUTH_STATE_TTL_SECONDS,
  });
  return response;
}
