"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { apiFetch } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useGoogleOAuthPopup } from "@/hooks/useGoogleOAuthPopup";
import { OAUTH_ERROR_MESSAGES } from "@/lib/oauth/errorMessages";
import { Button, Field, Input, PasswordInput } from "@/components/common";
import { IconGoogle } from "@/components/common/icons";
import type { SessionUser } from "@/types";

export function LoginForm({ oauthError }: { oauthError?: string }) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const hydrate = useAuthStore((state) => state.hydrate);
  const pushToast = useUiStore((state) => state.pushToast);
  const [formError, setFormError] = useState<string | null>(null);
  const { start: startGoogle, isLoading: isGoogleLoading } = useGoogleOAuthPopup();

  function handleGoogleSignIn() {
    startGoogle("login", {
      onSuccess: () => {
        hydrate().then(() => {
          pushToast("Signed in with Google", "success");
          router.push("/dashboard");
        });
      },
      onError: (code) => {
        pushToast(OAUTH_ERROR_MESSAGES[code] ?? "Google sign-in failed. Please try again.", "error");
      },
    });
  }

  // Guards against StrictMode's double effect-invocation in dev, and against
  // re-showing the toast if this component ever re-renders for another
  // reason while `oauthError` is still set.
  const shownOauthError = useRef<string | null>(null);
  useEffect(() => {
    if (!oauthError || shownOauthError.current === oauthError) return;
    shownOauthError.current = oauthError;
    pushToast(OAUTH_ERROR_MESSAGES[oauthError] ?? "Google sign-in failed. Please try again.", "error");
    router.replace("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oauthError]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const result = await apiFetch<{ user: SessionUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(values),
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setUser(result.data.user);
    pushToast(`Welcome back, ${result.data.user.name.split(" ")[0]}`, "success");
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Button
        type="button"
        variant="secondary"
        onClick={handleGoogleSignIn}
        isLoading={isGoogleLoading}
        className="w-full"
      >
        <IconGoogle size={16} />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-ink-faint">or continue with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

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
          autoComplete="current-password"
          placeholder="Enter password"
          hasError={!!errors.password}
          {...register("password")}
        />
      </Field>
      {formError && <p className="text-sm text-danger">{formError}</p>}
      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Sign in
      </Button>
    </form>
  );
}
