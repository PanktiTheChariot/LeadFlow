"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { BrandMark } from "@/components/common";
import { IconMenu } from "@/components/common/icons";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="flex items-center justify-between bg-brand-panel-bg px-4 py-3 md:px-5">
      <div className="flex items-center gap-1">
        {/* Mobile: always a hamburger - it opens the slide-over drawer, unrelated to desktop's collapse state. */}
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="-ml-1.5 mr-1 rounded-md p-1.5 text-brand-panel-text-soft hover:bg-brand-panel-surface hover:text-brand-panel-text md:hidden"
        >
          <IconMenu size={20} />
        </button>

        {/* Mobile: logo links home; the hamburger above handles the drawer. */}
        <Link href="/dashboard" className="flex items-center gap-2 text-brand-panel-text md:hidden">
          <BrandMark size={24} />
          <span className="font-heading text-lg">LeadFlow</span>
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs text-brand-panel-text-soft">Welcome back</p>
            <p className="-mt-0.5 text-sm font-semibold text-brand-panel-text">{user.name}</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-saffron text-sm font-semibold text-white">
            {getInitials(user.name)}
          </div>
        </div>
      )}
    </header>
  );
}
