"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Field, Input, Modal, Select, Textarea } from "@/components/common";
import { createLeadSchema, type CreateLeadInput } from "@/lib/validations/lead";
import { apiFetch } from "@/lib/apiClient";
import { useUiStore } from "@/store/uiStore";
import { LEAD_STATUSES } from "@/types";
import type { LeadDTO } from "@/types";
import type { UserSummaryDTO } from "@/server/services/userService";

const UNASSIGNED_VALUE = "unassigned";

export function LeadFormModal({
  isOpen,
  onClose,
  onSaved,
  lead,
  users,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  lead: LeadDTO | null;
  users: UserSummaryDTO[];
}) {
  const pushToast = useUiStore((state) => state.pushToast);
  const isEditMode = !!lead;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateLeadInput>({ resolver: zodResolver(createLeadSchema) });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      lead
        ? {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            status: lead.status,
            assignedUserId: lead.assignedUser?.id ?? null,
            notes: lead.notes,
          }
        : { name: "", email: "", phone: "", company: "", status: "New", assignedUserId: null, notes: "" },
    );
  }, [isOpen, lead, reset]);

  async function onSubmit(values: CreateLeadInput) {
    const payload = { ...values, assignedUserId: values.assignedUserId || null };
    const result = isEditMode
      ? await apiFetch(`/api/leads/${lead!.id}`, { method: "PUT", body: JSON.stringify(payload) })
      : await apiFetch("/api/leads", { method: "POST", body: JSON.stringify(payload) });

    if (!result.ok) {
      pushToast(result.error, "error");
      return;
    }

    pushToast(isEditMode ? "Lead updated" : "Lead created", "success");
    onSaved();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit lead" : "New lead"} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" hasError={!!errors.name} {...register("name")} />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" hasError={!!errors.email} {...register("email")} />
          </Field>
          <Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" hasError={!!errors.phone} {...register("phone")} />
          </Field>
          <Field label="Company" htmlFor="company" error={errors.company?.message}>
            <Input id="company" hasError={!!errors.company} {...register("company")} />
          </Field>
          <Field label="Status" htmlFor="status">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  id="status"
                  value={field.value ?? "New"}
                  onValueChange={field.onChange}
                  options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))}
                />
              )}
            />
          </Field>
          <Field label="Assigned to" htmlFor="assignedUserId">
            <Controller
              control={control}
              name="assignedUserId"
              render={({ field }) => (
                <Select
                  id="assignedUserId"
                  value={field.value || UNASSIGNED_VALUE}
                  onValueChange={(v) => field.onChange(v === UNASSIGNED_VALUE ? null : v)}
                  options={[
                    { value: UNASSIGNED_VALUE, label: "Unassigned" },
                    ...users.map((u) => ({ value: u.id, label: u.name })),
                  ]}
                />
              )}
            />
          </Field>
        </div>
        <Field label="Notes" htmlFor="notes" error={errors.notes?.message}>
          <Textarea id="notes" rows={4} {...register("notes")} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditMode ? "Save changes" : "Create lead"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
