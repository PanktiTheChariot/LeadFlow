import { withAuth } from "@/server/middlewares/withAuth";
import { jsonError, jsonOk, parseJsonBody } from "@/server/http";
import { objectIdSchema, saveReplySchema } from "@/lib/validations/lead";
import { saveReply } from "@/server/services/leadService";

type RouteContext = { params: Promise<{ id: string }> };

// Same access rule as GET /api/leads/:id - any role that can view the lead
// can save a reply to it (a `user` role only for a lead assigned to them).
export const POST = withAuth<RouteContext>(async (request, ctx, { params }) => {
  const { id } = await params;
  const idCheck = objectIdSchema.safeParse(id);
  if (!idCheck.success) return jsonError("Invalid lead id", 400);

  const parsed = await parseJsonBody(request, saveReplySchema);
  if (!parsed.success) return parsed.response;

  const lead = await saveReply(ctx, idCheck.data, parsed.data.text);
  return jsonOk({ lead }, { status: 201 });
});
