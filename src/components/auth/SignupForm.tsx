"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { apiFetch } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useGoogleOAuthPopup } from "@/hooks/useGoogleOAuthPopup";
import { OAUTH_ERROR_MESSAGES } from "@/lib/oauth/errorMessages";
import { Button, Field, Input, PasswordInput } from "@/components/common";
import { IconGoogle } from "@/components/common/icons";
import type { SessionUser } from "@/types";

export function SignupForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const hydrate = useAuthStore((state) => state.hydrate);
  const pushToast = useUiStore((state) => state.pushToast);
  const [formError, setFormError] = useState<string | null>(null);
  const { start: startGoogle, isLoading: isGoogleLoading } = useGoogleOAuthPopup();

  function handleGoogleSignUp() {
    startGoogle("signup", {
      onSuccess: () => {
        hydrate().then(() => {
          pushToast("Company created with Google", "success");
          router.push("/dashboard");
        });
      },
      onError: (code) => {
        pushToast(OAUTH_ERROR_MESSAGES[code] ?? "Google sign-up failed. Please try again.", "error");
      },
    });
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupInput) {
    setFormError(null);
    const result = await apiFetch<{ user: SessionUser }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(values),
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setUser(result.data.user);
    pushToast(`Welcome to LeadFlow, ${result.data.user.name.split(" ")[0]}`, "success");
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Button
        type="button"
        variant="secondary"
        onClick={handleGoogleSignUp}
        isLoading={isGoogleLoading}
        className="w-full"
      >
        <IconGoogle size={16} />
        Sign up with Google
      </Button>

      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-ink-faint">or fill in the details</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Field label="Company name" htmlFor="companyName" error={errors.companyName?.message}>
        <Input
          id="companyName"
          autoComplete="organization"
          placeholder="Acme Robotics"
          hasError={!!errors.companyName}
          {...register("companyName")}
        />
      </Field>
      <Field label="Your name" htmlFor="name" error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Enter your name"
          hasError={!!errors.name}
          {...register("name")}
        />
      </Field>
      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Enter email"
          hasError={!!errors.email}
          {...register("email")}
        />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="Create a password"
          hasError={!!errors.password}
          {...register("password")}
        />
      </Field>
      {formError && <p className="text-sm text-danger">{formError}</p>}
      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Create company
      </Button>
    </form>
  );
}
