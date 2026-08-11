import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const OAUTH_COOKIE_NAME = "leadflow_oauth";
const OAUTH_STATE_TTL_SECONDS = 5 * 60;

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export type OAuthIntent = "login" | "signup";

interface OAuthStatePayload extends JWTPayload {
  provider: string;
  state: string;
  codeVerifier: string;
  intent: OAuthIntent;
}

/**
 * Carries the PKCE verifier + CSRF state in a signed, httpOnly, short-lived
 * cookie rather than Redis - this keeps password login and OAuth login
 * independent of whether Redis is configured, and reuses the same JWT_SECRET
 * infra as the session cookie instead of adding a second trust mechanism.
 * `intent` rides along too, so the callback knows whether "no matching user"
 * should provision a new company (signup) or just fail (login).
 */
export async function signOAuthState(payload: {
  provider: string;
  state: string;
  codeVerifier: string;
  intent: OAuthIntent;
}): Promise<string> {
  return new SignJWT({ ...payload } satisfies Omit<OAuthStatePayload, keyof JWTPayload>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${OAUTH_STATE_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyOAuthState(
  token: string,
): Promise<{ provider: string; state: string; codeVerifier: string; intent: OAuthIntent } | null> {
  try {
    const { payload } = await jwtVerify<OAuthStatePayload>(token, getSecretKey());
    if (!payload.provider || !payload.state || !payload.codeVerifier) return null;
    return {
      provider: payload.provider,
      state: payload.state,
      codeVerifier: payload.codeVerifier,
      intent: payload.intent === "signup" ? "signup" : "login",
    };
  } catch {
    return null;
  }
}

export { OAUTH_COOKIE_NAME, OAUTH_STATE_TTL_SECONDS };
