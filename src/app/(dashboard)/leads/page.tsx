"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, ConfirmDialog, PageHeader, Pagination } from "@/components/common";
import { IconPlus } from "@/components/common/icons";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadFormModal } from "@/components/leads/LeadFormModal";
import { LeadDetailDrawer } from "@/components/leads/LeadDetailDrawer";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useLeads } from "@/hooks/useLeads";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { apiFetch } from "@/lib/apiClient";
import type { LeadDTO } from "@/types";

const PAGE_SIZE = 10;

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = useAuthStore((state) => state.user?.role);
  const pushToast = useUiStore((state) => state.pushToast);

  const canManage = role === "admin" || role === "manager";

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const debouncedSearch = useDebounce(searchInput, 350);
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [assignedUserId, setAssignedUserId] = useState(searchParams.get("assignedUserId") ?? "");
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));

  const [openLeadId, setOpenLeadId] = useState<string | null>(searchParams.get("open"));
  const [formLead, setFormLead] = useState<LeadDTO | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<LeadDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset to page 1 whenever a filter changes - adjusted during render (React's
  // recommended pattern for "reset state when a prop changes") rather than in
  // an effect, so it takes effect in the same render instead of a follow-up one.
  const filterKey = `${debouncedSearch}|${status}|${assignedUserId}`;
  const [trackedFilterKey, setTrackedFilterKey] = useState(filterKey);
  if (trackedFilterKey !== filterKey) {
    setTrackedFilterKey(filterKey);
    setPage(1);
  }

  const query = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: status || undefined,
      assignedUserId: assignedUserId || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [debouncedSearch, status, assignedUserId, page],
  );

  const { data, isLoading, refetch } = useLeads(query);
  const { users } = useCompanyUsers(canManage);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await apiFetch(`/api/leads/${deleteTarget.id}`, { method: "DELETE" });
    setIsDeleting(false);

    if (!result.ok) {
      pushToast(result.error, "error");
      return;
    }
    pushToast("Lead deleted", "success");
    setDeleteTarget(null);
    refetch();
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Leads"
        subtitle="Manage and track leads across your pipeline."
        actions={
          canManage && (
            <Button onClick={() => setFormLead("new")}>
              <IconPlus size={16} strokeWidth={2.25} />
              New Lead
            </Button>
          )
        }
      />

      <LeadFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        status={status}
        onStatusChange={setStatus}
        assignedUserId={assignedUserId}
        onAssignedUserChange={setAssignedUserId}
        users={users}
        canFilterByAssignee={canManage}
      />

      <LeadTable
        leads={data?.items ?? []}
        isLoading={isLoading}
        canManage={canManage}
        onRowClick={(lead) => setOpenLeadId(lead.id)}
        onEdit={(lead) => setFormLead(lead)}
        onDelete={(lead) => setDeleteTarget(lead)}
      />

      {data && data.total > 0 && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          pageSize={data.pageSize}
          onPageChange={setPage}
        />
      )}

      <LeadDetailDrawer
        isOpen={!!openLeadId}
        onClose={() => {
          setOpenLeadId(null);
          router.replace("/leads");
        }}
        leadId={openLeadId}
        role={role ?? "user"}
        canManage={canManage}
        onUpdated={refetch}
        onEditFull={(lead) => setFormLead(lead)}
      />

      {canManage && (
        <LeadFormModal
          isOpen={formLead !== null}
          onClose={() => setFormLead(null)}
          onSaved={refetch}
          lead={formLead === "new" ? null : formLead}
          users={users}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete lead"
        description={`Are you sure you want to delete ${deleteTarget?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        danger
      />
    </div>
  );
}
