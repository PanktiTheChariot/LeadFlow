import { withAuth } from "@/server/middlewares/withAuth";
import { withRole } from "@/server/middlewares/withRole";
import { jsonOk, parseJsonBody } from "@/server/http";
import { createUserSchema } from "@/lib/validations/user";
import { createCompanyUser, listCompanyUsers } from "@/server/services/userService";

// Admin + manager can view the roster (needed to assign leads); only admin can create users.
export const GET = withAuth(
  withRole(["admin", "manager"], async (_request, ctx) => {
    const users = await listCompanyUsers(ctx);
    return jsonOk({ users });
  }),
);

export const POST = withAuth(
  withRole(["admin"], async (request, ctx) => {
    const parsed = await parseJsonBody(request, createUserSchema);
    if (!parsed.success) return parsed.response;

    const user = await createCompanyUser(ctx, parsed.data);
    return jsonOk({ user }, { status: 201 });
  }),
);
