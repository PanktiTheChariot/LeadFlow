"use client";

import { Input, Select } from "@/components/common";
import { IconSearch } from "@/components/common/icons";
import { LEAD_STATUSES } from "@/types";
import type { UserSummaryDTO } from "@/server/services/userService";

const ALL_STATUSES_VALUE = "all";
const EVERYONE_VALUE = "everyone";

export function LeadFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  assignedUserId,
  onAssignedUserChange,
  users,
  canFilterByAssignee,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  assignedUserId: string;
  onAssignedUserChange: (value: string) => void;
  users: UserSummaryDTO[];
  canFilterByAssignee: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1 sm:max-w-sm">
        <IconSearch
          size={15}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
        />
        <Input
          placeholder="Search name, email, or company..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="py-2.5 pl-9"
        />
      </div>
      <Select
        value={status || ALL_STATUSES_VALUE}
        onValueChange={(v) => onStatusChange(v === ALL_STATUSES_VALUE ? "" : v)}
        options={[
          { value: ALL_STATUSES_VALUE, label: "All statuses" },
          ...LEAD_STATUSES.map((s) => ({ value: s, label: s })),
        ]}
        className="sm:max-w-[9rem]"
      />
      {canFilterByAssignee && (
        <Select
          value={assignedUserId || EVERYONE_VALUE}
          onValueChange={(v) => onAssignedUserChange(v === EVERYONE_VALUE ? "" : v)}
          options={[
            { value: EVERYONE_VALUE, label: "Everyone" },
            ...users.map((u) => ({ value: u.id, label: u.name })),
          ]}
          className="sm:max-w-[10rem]"
        />
      )}
    </div>
  );
}
