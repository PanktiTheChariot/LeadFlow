import { withAuth } from "@/server/middlewares/withAuth";
import { jsonOk } from "@/server/http";
import { getDashboardStats } from "@/server/services/dashboardService";

export const GET = withAuth(async (_request, ctx) => {
  const stats = await getDashboardStats(ctx);
  return jsonOk(stats);
});
