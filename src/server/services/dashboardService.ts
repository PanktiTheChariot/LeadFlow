import { Types } from "mongoose";
import { Lead } from "@/models/Lead";
import { toDTO } from "@/server/services/leadService";
import { LEAD_STATUSES } from "@/types";
import type { AuthContext, DashboardStats, LeadStatus, LeadsPerDayPoint } from "@/types";

const TREND_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getDashboardStats(ctx: AuthContext): Promise<DashboardStats> {
  const companyId = new Types.ObjectId(ctx.companyId);

  // A `user` role's dashboard reflects only what they're allowed to see elsewhere:
  // leads assigned to them. Admin/manager see the whole tenant.
  const scopeFilter =
    ctx.role === "user" ? { companyId, assignedUserId: new Types.ObjectId(ctx.userId) } : { companyId };

  const now = new Date();
  const trendStart = new Date(now.getTime() - (TREND_DAYS - 1) * MS_PER_DAY);
  trendStart.setUTCHours(0, 0, 0, 0);
  const previousPeriodStart = new Date(now.getTime() - 14 * MS_PER_DAY);
  const lastPeriodStart = new Date(now.getTime() - 7 * MS_PER_DAY);

  const [statusCounts, recentDocs, assignedDocs, total, trendCounts, newLast7Days, newPrevious7Days] =
    await Promise.all([
      Lead.aggregate<{ _id: LeadStatus; count: number }>([
        { $match: scopeFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Lead.find(scopeFilter).sort({ createdAt: -1 }).limit(5),
      Lead.find({ companyId, assignedUserId: new Types.ObjectId(ctx.userId) })
        .sort({ createdAt: -1 })
        .limit(5),
      Lead.countDocuments(scopeFilter),
      Lead.aggregate<{ _id: string; count: number }>([
        { $match: { ...scopeFilter, createdAt: { $gte: trendStart } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
      Lead.countDocuments({ ...scopeFilter, createdAt: { $gte: lastPeriodStart } }),
      Lead.countDocuments({ ...scopeFilter, createdAt: { $gte: previousPeriodStart, $lt: lastPeriodStart } }),
    ]);

  const byStatus = LEAD_STATUSES.reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<LeadStatus, number>,
  );
  for (const entry of statusCounts) {
    byStatus[entry._id] = entry.count;
  }

  const countByDate = new Map(trendCounts.map((entry) => [entry._id, entry.count]));
  const leadsPerDay: LeadsPerDayPoint[] = [];
  for (let i = 0; i < TREND_DAYS; i++) {
    const day = new Date(trendStart.getTime() + i * MS_PER_DAY);
    const key = dateKey(day);
    leadsPerDay.push({ date: key, count: countByDate.get(key) ?? 0 });
  }

  const [recentLeads, assignedLeads] = await Promise.all([
    Promise.all(recentDocs.map(toDTO)),
    Promise.all(assignedDocs.map(toDTO)),
  ]);

  return { total, byStatus, recentLeads, assignedLeads, leadsPerDay, newLast7Days, newPrevious7Days };
}
