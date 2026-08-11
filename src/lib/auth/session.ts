import { cookies } from "next/headers";
import type { AuthContext } from "@/types";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS, signSessionToken, verifySessionToken } from "./jwt";

const isProduction = process.env.NODE_ENV === "production";

/** Reads and verifies the session cookie for the current request. Null if absent/invalid/expired. */
export async function getAuthContext(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function createSessionCookie(ctx: AuthContext): Promise<void> {
  const token = await signSessionToken(ctx);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
