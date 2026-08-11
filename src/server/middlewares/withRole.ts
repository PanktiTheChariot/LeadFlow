import { jsonError } from "@/server/http";
import type { UserRole } from "@/types";
import type { AuthedHandler } from "./withAuth";

/** Compose after withAuth: withAuth(withRole(['admin', 'manager'], handler)). */
export function withRole<TRouteContext = unknown>(
  allowedRoles: UserRole[],
  handler: AuthedHandler<TRouteContext>,
): AuthedHandler<TRouteContext> {
  return async (request, ctx, routeContext) => {
    if (!allowedRoles.includes(ctx.role)) {
      return jsonError("Insufficient permissions for this action", 403);
    }
    return handler(request, ctx, routeContext);
  };
}
