import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { hasError, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={clsx(
        "w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint",
        "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
        hasError ? "border-danger" : "border-border-strong",
        className,
      )}
      {...props}
    />
  );
});
