import type { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { checkRateLimit } from "@/lib/rateLimit";
import { loginSchema } from "@/lib/validations/auth";
import { authenticate } from "@/server/services/authService";
import { jsonError, jsonOk, parseJsonBody } from "@/server/http";
import { createSessionCookie } from "@/lib/auth/session";

const LOGIN_ATTEMPT_LIMIT = 10;
const LOGIN_WINDOW_MS = 60_000;

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get("x-forwarded-for") ?? "unknown";
  const rateLimit = checkRateLimit(`login:${clientIp}`, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_MS);
  if (!rateLimit.allowed) {
    return jsonError("Too many login attempts. Please try again shortly.", 429);
  }

  const parsed = await parseJsonBody(request, loginSchema);
  if (!parsed.success) return parsed.response;

  try {
    await connectToDatabase();
    const result = await authenticate(parsed.data.email, parsed.data.password);
    if (!result) {
      return jsonError("Invalid email or password", 401);
    }

    await createSessionCookie(result.ctx);
    return jsonOk({ user: result.sessionUser });
  } catch (error) {
    console.error("Login error:", error);
    return jsonError("Internal server error", 500);
  }
}
