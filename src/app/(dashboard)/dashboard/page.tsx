"use client";

import { IconTeam, IconNew, IconQualified, IconConverted, IconLost } from "@/components/common/icons";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Card, PageHeader, Spinner, StatCard } from "@/components/common";
import { StatusChart } from "@/components/dashboard/StatusChart";
import { LeadPreviewList } from "@/components/dashboard/LeadPreviewList";
import { LeadsTrendChart } from "@/components/dashboard/LeadsTrendChart";
import { ConversionGauge } from "@/components/dashboard/ConversionGauge";

function computeDeltaPercent(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardStats();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" subtitle="Overview of your pipeline performance." />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size={24} />
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <StatCard
              label="Total leads"
              value={data.total}
              icon={IconTeam}
              tone="total"
              delta={computeDeltaPercent(data.newLast7Days, data.newPrevious7Days)}
            />
            <StatCard label="New" value={data.byStatus.New} icon={IconNew} tone="new" />
            <StatCard label="Qualified" value={data.byStatus.Qualified} icon={IconQualified} tone="qualified" />
            <StatCard label="Converted" value={data.byStatus.Converted} icon={IconConverted} tone="converted" />
            <StatCard label="Lost" value={data.byStatus.Lost} icon={IconLost} tone="lost" />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-base text-ink">Leads created</h2>
                <span className="text-xs text-ink-faint">Last 14 days</span>
              </div>
              <LeadsTrendChart data={data.leadsPerDay} />
            </Card>

            <Card className="p-5 lg:col-span-1">
              <h2 className="font-heading mb-4 text-base text-ink">Leads by status</h2>
              <StatusChart byStatus={data.byStatus} />
            </Card>

            <Card className="p-5 lg:col-span-1">
              <h2 className="font-heading text-base text-ink">Conversion rate</h2>
              <ConversionGauge converted={data.byStatus.Converted} total={data.total} />
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="font-heading mb-2 text-base text-ink">Recent leads</h2>
              <LeadPreviewList leads={data.recentLeads} emptyMessage="No leads yet." />
            </Card>

            <Card className="p-5">
              <h2 className="font-heading mb-2 text-base text-ink">Assigned to you</h2>
              <LeadPreviewList leads={data.assignedLeads} emptyMessage="No leads assigned to you." />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
