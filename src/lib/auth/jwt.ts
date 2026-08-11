import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { AuthContext, UserRole } from "@/types";

const SESSION_COOKIE_NAME = "leadflow_session";
const SESSION_TTL_SECONDS = 60 * 60 * 2; // 2 hours

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

interface SessionTokenPayload extends JWTPayload {
  companyId: string;
  role: UserRole;
  name: string;
  email: string;
}

export async function signSessionToken(ctx: AuthContext): Promise<string> {
  return new SignJWT({
    companyId: ctx.companyId,
    role: ctx.role,
    name: ctx.name,
    email: ctx.email,
  } satisfies Omit<SessionTokenPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(ctx.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

/** Returns null instead of throwing so callers can treat any failure as "unauthenticated". */
export async function verifySessionToken(token: string): Promise<AuthContext | null> {
  try {
    const { payload } = await jwtVerify<SessionTokenPayload>(token, getSecretKey());
    if (!payload.sub || !payload.companyId || !payload.role) return null;
    return {
      userId: payload.sub,
      companyId: payload.companyId,
      role: payload.role,
      name: payload.name,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS };
