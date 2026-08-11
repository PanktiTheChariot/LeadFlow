import type { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { completeGoogleSignupSchema } from "@/lib/validations/auth";
import { completeGoogleSignup } from "@/server/services/authService";
import { HttpError, jsonError, jsonOk, parseJsonBody } from "@/server/http";
import { createSessionCookie } from "@/lib/auth/session";
import { PENDING_SIGNUP_COOKIE_NAME, verifyPendingSignup } from "@/lib/auth/pendingSignup";

export async function POST(request: NextRequest) {
  const pendingToken = request.cookies.get(PENDING_SIGNUP_COOKIE_NAME)?.value;
  if (!pendingToken) {
    return jsonError("Your sign-in expired. Please try Sign up with Google again.", 401);
  }

  const pending = await verifyPendingSignup(pendingToken);
  if (!pending) {
    return jsonError("Your sign-in expired. Please try Sign up with Google again.", 401);
  }

  const parsed = await parseJsonBody(request, completeGoogleSignupSchema);
  if (!parsed.success) return parsed.response;

  try {
    await connectToDatabase();
    const result = await completeGoogleSignup({
      email: pending.email,
      name: pending.name,
      companyName: parsed.data.companyName,
    });
    await createSessionCookie(result.ctx);

    const response = jsonOk({ user: result.sessionUser }, { status: 201 });
    response.cookies.delete(PENDING_SIGNUP_COOKIE_NAME);
    return response;
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.message, error.status);
    }
    console.error("Complete Google signup error:", error);
    return jsonError("Internal server error", 500);
  }
}
