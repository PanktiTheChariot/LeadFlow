import { withAuth } from "@/server/middlewares/withAuth";
import { jsonError, jsonOk, parseJsonBody } from "@/server/http";
import { aiReplySchema, objectIdSchema } from "@/lib/validations/lead";
import { getLeadById } from "@/server/services/leadService";
import { getAIProvider } from "@/lib/ai";

type RouteContext = { params: Promise<{ id: string }> };

export const POST = withAuth<RouteContext>(async (request, ctx, { params }) => {
  const { id } = await params;
  const idCheck = objectIdSchema.safeParse(id);
  if (!idCheck.success) return jsonError("Invalid lead id", 400);

  const parsed = await parseJsonBody(request, aiReplySchema);
  if (!parsed.success) return parsed.response;

  // Reuses the same tenant + RBAC rules as reading a lead: a `user` role can only
  // generate a reply for a lead assigned to them, never someone else's.
  const lead = await getLeadById(ctx, idCheck.data);

  try {
    const provider = getAIProvider();
    const reply = await provider.generateReply(parsed.data.message, {
      leadName: lead.name,
      leadCompany: lead.company,
      leadStatus: lead.status,
    });
    return jsonOk({ reply });
  } catch (error) {
    console.error("AI provider error:", error);
    return jsonError("The AI assistant is temporarily unavailable. Please try again.", 502);
  }
});
