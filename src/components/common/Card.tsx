import type { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(28,35,51,0.06)]", className)}
      {...props}
    />
  );
}
