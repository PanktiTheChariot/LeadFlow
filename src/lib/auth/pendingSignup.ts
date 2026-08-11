import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const PENDING_SIGNUP_COOKIE_NAME = "leadflow_pending_signup";
const PENDING_SIGNUP_TTL_SECONDS = 10 * 60;

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

interface PendingSignupPayload extends JWTPayload {
  email: string;
  name: string;
}

/**
 * Carries a Google-verified {email, name} across the gap between "identity
 * confirmed by the OAuth callback" and "company name collected from the
 * user" - signup isn't complete until both exist, so nothing is provisioned
 * (no Company, no User) until the second step reads this back.
 */
export async function signPendingSignup(payload: { email: string; name: string }): Promise<string> {
  return new SignJWT({ ...payload } satisfies Omit<PendingSignupPayload, keyof JWTPayload>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PENDING_SIGNUP_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyPendingSignup(token: string): Promise<{ email: string; name: string } | null> {
  try {
    const { payload } = await jwtVerify<PendingSignupPayload>(token, getSecretKey());
    if (!payload.email || !payload.name) return null;
    return { email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export { PENDING_SIGNUP_COOKIE_NAME, PENDING_SIGNUP_TTL_SECONDS };
