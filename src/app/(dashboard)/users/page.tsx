"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/common";
import { IconPlus, IconTrash } from "@/components/common/icons";
import { UserFormModal } from "@/components/users/UserFormModal";
import { useAuthStore } from "@/store/authStore";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { useUiStore } from "@/store/uiStore";
import { apiFetch } from "@/lib/apiClient";
import type { UserSummaryDTO } from "@/server/services/userService";

export default function UsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const role = currentUser?.role;
  const { users, isLoading, refetch } = useCompanyUsers(role === "admin");
  const pushToast = useUiStore((state) => state.pushToast);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserSummaryDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (role && role !== "admin") {
    return (
      <EmptyState
        title="Admins only"
        description="Team management is restricted to admins on your account."
      />
    );
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await apiFetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
    setIsDeleting(false);

    if (!result.ok) {
      pushToast(result.error, "error");
      return;
    }
    pushToast("Team member removed", "success");
    setDeleteTarget(null);
    refetch();
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Team"
        subtitle="Manage who has access to your workspace."
        actions={
          <Button onClick={() => setIsFormOpen(true)}>
            <IconPlus size={16} strokeWidth={2.25} />
            New team member
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={24} />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-ink">{user.name}</TableCell>
                <TableCell className="text-ink-soft">{user.email}</TableCell>
                <TableCell>
                  <Badge tone="accent" className="capitalize">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {user.id !== currentUser?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2 text-ink-faint hover:bg-danger-soft hover:text-danger"
                      onClick={() => setDeleteTarget(user)}
                      aria-label={`Remove ${user.name}`}
                      title={`Remove ${user.name}`}
                    >
                      <IconTrash size={16} />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <UserFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSaved={refetch} />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove team member"
        description={`Are you sure you want to remove ${deleteTarget?.name}? Any leads assigned to them will become unassigned. This cannot be undone.`}
        confirmLabel="Remove"
        isLoading={isDeleting}
        danger
      />
    </div>
  );
}
