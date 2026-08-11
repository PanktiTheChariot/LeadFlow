import { withAuth } from "@/server/middlewares/withAuth";
import { withRole } from "@/server/middlewares/withRole";
import { jsonError, jsonOk, parseJsonBody } from "@/server/http";
import { objectIdSchema, updateLeadSchema } from "@/lib/validations/lead";
import { deleteLead, getLeadById, updateLead } from "@/server/services/leadService";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withAuth<RouteContext>(async (_request, ctx, { params }) => {
  const { id } = await params;
  const idCheck = objectIdSchema.safeParse(id);
  if (!idCheck.success) return jsonError("Invalid lead id", 400);

  const lead = await getLeadById(ctx, idCheck.data);
  return jsonOk({ lead });
});

export const PUT = withAuth<RouteContext>(async (request, ctx, { params }) => {
  const { id } = await params;
  const idCheck = objectIdSchema.safeParse(id);
  if (!idCheck.success) return jsonError("Invalid lead id", 400);

  const parsed = await parseJsonBody(request, updateLeadSchema);
  if (!parsed.success) return parsed.response;

  const lead = await updateLead(ctx, idCheck.data, parsed.data);
  return jsonOk({ lead });
});

export const DELETE = withAuth<RouteContext>(
  withRole<RouteContext>(["admin", "manager"], async (_request, ctx, { params }) => {
    const { id } = await params;
    const idCheck = objectIdSchema.safeParse(id);
    if (!idCheck.success) return jsonError("Invalid lead id", 400);

    await deleteLead(ctx, idCheck.data);
    return jsonOk({ success: true });
  }),
);
