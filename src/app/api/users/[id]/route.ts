import { withAuth } from "@/server/middlewares/withAuth";
import { withRole } from "@/server/middlewares/withRole";
import { jsonError, jsonOk } from "@/server/http";
import { objectIdSchema } from "@/lib/validations/lead";
import { deleteCompanyUser } from "@/server/services/userService";

type RouteContext = { params: Promise<{ id: string }> };

export const DELETE = withAuth<RouteContext>(
  withRole<RouteContext>(["admin"], async (_request, ctx, { params }) => {
    const { id } = await params;
    const idCheck = objectIdSchema.safeParse(id);
    if (!idCheck.success) return jsonError("Invalid user id", 400);

    await deleteCompanyUser(ctx, idCheck.data);
    return jsonOk({ success: true });
  }),
);
