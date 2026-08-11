"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import clsx from "clsx";
import { IconEye, IconEyeOff } from "./icons";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  hasError?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { hasError, className, ...props },
  ref,
) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        type={isVisible ? "text" : "password"}
        className={clsx(
          "w-full rounded-md border bg-surface py-2 pr-10 pl-3 text-sm text-ink placeholder:text-ink-faint",
          "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
          hasError ? "border-danger" : "border-border-strong",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setIsVisible((v) => !v)}
        tabIndex={-1}
        aria-label={isVisible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-faint hover:text-ink-soft"
      >
        {isVisible ? <IconEyeOff size={17} /> : <IconEye size={17} />}
      </button>
    </div>
  );
});
