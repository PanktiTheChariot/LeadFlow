"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Field, Input, Modal, PasswordInput, Select } from "@/components/common";
import { createUserSchema, type CreateUserInput } from "@/lib/validations/user";
import { apiFetch } from "@/lib/apiClient";
import { useUiStore } from "@/store/uiStore";
import { USER_ROLES } from "@/types";

export function UserFormModal({
  isOpen,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const pushToast = useUiStore((state) => state.pushToast);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({ resolver: zodResolver(createUserSchema) });

  useEffect(() => {
    if (isOpen) reset({ name: "", email: "", password: "", role: "user" });
  }, [isOpen, reset]);

  async function onSubmit(values: CreateUserInput) {
    const result = await apiFetch("/api/users", { method: "POST", body: JSON.stringify(values) });
    if (!result.ok) {
      pushToast(result.error, "error");
      return;
    }
    pushToast("User created", "success");
    onSaved();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New team member">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Name" htmlFor="user-name" error={errors.name?.message}>
          <Input id="user-name" hasError={!!errors.name} {...register("name")} />
        </Field>
        <Field label="Email" htmlFor="user-email" error={errors.email?.message}>
          <Input id="user-email" type="email" hasError={!!errors.email} {...register("email")} />
        </Field>
        <Field
          label="Temporary password"
          htmlFor="user-password"
          error={errors.password?.message}
          hint="At least 8 characters. Share this with the new team member securely."
        >
          <PasswordInput id="user-password" hasError={!!errors.password} {...register("password")} />
        </Field>
        <Field label="Role" htmlFor="user-role">
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select
                id="user-role"
                value={field.value}
                onValueChange={field.onChange}
                options={USER_ROLES.map((r) => ({ value: r, label: r[0].toUpperCase() + r.slice(1) }))}
              />
            )}
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create user
          </Button>
        </div>
      </form>
    </Modal>
  );
}
