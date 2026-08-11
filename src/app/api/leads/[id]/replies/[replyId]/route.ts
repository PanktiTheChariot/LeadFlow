import { withAuth } from "@/server/middlewares/withAuth";
import { jsonError, jsonOk } from "@/server/http";
import { objectIdSchema } from "@/lib/validations/lead";
import { deleteReply } from "@/server/services/leadService";

type RouteContext = { params: Promise<{ id: string; replyId: string }> };

export const DELETE = withAuth<RouteContext>(async (_request, ctx, { params }) => {
  const { id, replyId } = await params;
  const idCheck = objectIdSchema.safeParse(id);
  if (!idCheck.success) return jsonError("Invalid lead id", 400);
  const replyIdCheck = objectIdSchema.safeParse(replyId);
  if (!replyIdCheck.success) return jsonError("Invalid reply id", 400);

  const lead = await deleteReply(ctx, idCheck.data, replyIdCheck.data);
  return jsonOk({ lead });
});
