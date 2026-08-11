import clsx from "clsx";
import { IconLink } from "./icons";

/** The LeadFlow logomark - a colored badge rather than a bare icon, so it reads as an owned mark, not a stock icon. */
export function BrandMark({
  size = 28,
  rounded = "square",
  className,
}: {
  size?: number;
  rounded?: "square" | "full";
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center justify-center bg-saffron text-white",
        rounded === "full" ? "rounded-full" : "rounded-lg",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <IconLink size={size * 0.58} strokeWidth={2.25} />
    </span>
  );
}
