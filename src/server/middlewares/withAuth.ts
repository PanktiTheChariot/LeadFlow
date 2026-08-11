import type { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connect";
import { HttpError, jsonError } from "@/server/http";
import type { AuthContext } from "@/types";

export type AuthedHandler<TRouteContext = unknown> = (
  request: NextRequest,
  ctx: AuthContext,
  routeContext: TRouteContext,
) => Promise<Response>;

/**
 * Verifies the session cookie and attaches the resulting AuthContext.
 * ctx.companyId/role come only from the verified JWT, never from the request -
 * this is what makes tenant scoping in the service layer trustworthy.
 * Also centralizes DB connection + unexpected-error handling for every protected route.
 */
export function withAuth<TRouteContext = unknown>(handler: AuthedHandler<TRouteContext>) {
  return async (request: NextRequest, routeContext: TRouteContext): Promise<Response> => {
    try {
      const ctx = await getAuthContext();
      if (!ctx) {
        return jsonError("Authentication required", 401);
      }

      await connectToDatabase();
      return await handler(request, ctx, routeContext);
    } catch (error) {
      if (error instanceof HttpError) {
        return jsonError(error.message, error.status);
      }
      console.error("Unhandled API error:", error);
      return jsonError("Internal server error", 500);
    }
  };
}
