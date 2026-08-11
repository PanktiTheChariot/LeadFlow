import { withAuth } from "@/server/middlewares/withAuth";
import { withRole } from "@/server/middlewares/withRole";
import { jsonOk, parseJsonBody, parseQuery } from "@/server/http";
import { createLeadSchema, leadListQuerySchema } from "@/lib/validations/lead";
import { createLead, listLeads } from "@/server/services/leadService";
import { getCachedLeadsList, setCachedLeadsList } from "@/lib/redis";

export const GET = withAuth(async (request, ctx) => {
  const parsed = parseQuery(request, leadListQuerySchema);
  if (!parsed.success) return parsed.response;

  // Scope the cache key by role/user too - an admin's full-tenant result must
  // never be served back to a `user` role whose effective filter is narrower.
  const cacheKeySuffix = [
    `q=${JSON.stringify(parsed.data)}`,
    `role=${ctx.role}`,
    ctx.role === "user" ? `uid=${ctx.userId}` : "",
  ].join("|");

  const cached = await getCachedLeadsList(ctx.companyId, cacheKeySuffix);
  if (cached) {
    return jsonOk(JSON.parse(cached), { headers: { "X-Cache": "HIT" } });
  }

  const result = await listLeads(ctx, parsed.data);
  await setCachedLeadsList(ctx.companyId, cacheKeySuffix, JSON.stringify(result));

  return jsonOk(result, { headers: { "X-Cache": "MISS" } });
});

export const POST = withAuth(
  withRole(["admin", "manager"], async (request, ctx) => {
    const parsed = await parseJsonBody(request, createLeadSchema);
    if (!parsed.success) return parsed.response;

    const lead = await createLead(ctx, parsed.data);
    return jsonOk({ lead }, { status: 201 });
  }),
);
