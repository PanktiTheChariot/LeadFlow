"use client";

import { forwardRef } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import clsx from "clsx";
import { IconCheck, IconChevronDown } from "./icons";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  { value, onValueChange, options, placeholder, hasError, disabled, id, name, className },
  ref,
) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled} name={name}>
      <RadixSelect.Trigger
        ref={ref}
        id={id}
        className={clsx(
          "flex w-full items-center justify-between gap-2 rounded-md border bg-surface px-3 py-2 text-sm text-ink",
          "focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none",
          "data-[placeholder]:text-ink-faint disabled:cursor-not-allowed disabled:opacity-50",
          hasError ? "border-danger" : "border-border-strong",
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className="shrink-0 text-ink-soft">
          <IconChevronDown size={15} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-50 overflow-hidden rounded-md border border-border-strong bg-surface shadow-lg"
        >
          <RadixSelect.Viewport className="max-h-64 p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className={clsx(
                  "relative flex cursor-pointer items-center rounded-md py-2 pr-3 pl-8 text-sm text-ink select-none",
                  "outline-none data-[highlighted]:bg-paper data-[state=checked]:font-medium",
                )}
              >
                <RadixSelect.ItemIndicator className="absolute left-2.5 inline-flex items-center text-accent">
                  <IconCheck size={14} />
                </RadixSelect.ItemIndicator>
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
});
