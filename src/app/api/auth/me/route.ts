import { withAuth } from "@/server/middlewares/withAuth";
import { getSessionUser } from "@/server/services/authService";
import { jsonError, jsonOk } from "@/server/http";

export const GET = withAuth(async (_request, ctx) => {
  const sessionUser = await getSessionUser(ctx);
  if (!sessionUser) {
    return jsonError("Session is no longer valid", 401);
  }
  return jsonOk({ user: sessionUser });
});
