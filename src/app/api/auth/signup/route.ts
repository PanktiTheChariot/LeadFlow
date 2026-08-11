import type { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { checkRateLimit } from "@/lib/rateLimit";
import { signupSchema } from "@/lib/validations/auth";
import { signUp } from "@/server/services/authService";
import { HttpError, jsonError, jsonOk, parseJsonBody } from "@/server/http";
import { createSessionCookie } from "@/lib/auth/session";

const SIGNUP_ATTEMPT_LIMIT = 5;
const SIGNUP_WINDOW_MS = 60_000;

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get("x-forwarded-for") ?? "unknown";
  const rateLimit = checkRateLimit(`signup:${clientIp}`, SIGNUP_ATTEMPT_LIMIT, SIGNUP_WINDOW_MS);
  if (!rateLimit.allowed) {
    return jsonError("Too many signup attempts. Please try again shortly.", 429);
  }

  const parsed = await parseJsonBody(request, signupSchema);
  if (!parsed.success) return parsed.response;

  try {
    await connectToDatabase();
    const result = await signUp(parsed.data);
    await createSessionCookie(result.ctx);
    return jsonOk({ user: result.sessionUser }, { status: 201 });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.message, error.status);
    }
    console.error("Signup error:", error);
    return jsonError("Internal server error", 500);
  }
}
