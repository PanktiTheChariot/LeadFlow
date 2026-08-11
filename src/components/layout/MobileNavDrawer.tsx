"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/lib/apiClient";
import { Badge, BrandMark } from "@/components/common";
import { IconClose, IconSearch, IconLogout } from "@/components/common/icons";
import { NAV_ITEMS } from "./navItems";

export function MobileNavDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && query.trim()) {
      onClose();
      router.push(`/leads?search=${encodeURIComponent(query.trim())}`);
    }
  }

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    onClose();
    router.push("/login");
  }

  // AnimatePresence needs to keep rendering through the exit animation, so
  // the portal itself can't be gated behind `isOpen` - only behind having a
  // document to portal into (absent during SSR).
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative flex h-full w-64 flex-col border-r border-border bg-surface px-3 py-4 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-ink">
                <BrandMark size={24} />
                <span className="font-brand text-base">LeadFlow</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-ink-soft hover:bg-paper hover:text-ink"
              >
                <IconClose size={18} />
              </button>
            </div>

            <div className="relative mb-4">
              <IconSearch
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search leads..."
                className="w-full rounded-lg border border-border-strong bg-paper py-1.5 pr-3 pl-9 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:bg-surface focus:outline-none"
              />
            </div>

            <nav className="flex flex-1 flex-col gap-1">
              {NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "admin").map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={clsx(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive ? "bg-accent-soft text-accent-hover" : "text-ink-soft hover:bg-paper hover:text-ink",
                    )}
                  >
                    <Icon size={18} strokeWidth={1.9} className="shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {user && (
              <div className="rounded-lg bg-paper p-3">
                <p className="truncate text-xs font-semibold tracking-wide text-ink-faint uppercase">
                  {user.companyName}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-ink">{user.name}</p>
                  <Badge tone="accent" className="shrink-0 capitalize">
                    {user.role}
                  </Badge>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-3 flex w-full items-center gap-2 rounded-md bg-danger px-2 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                  <IconLogout size={14} />
                  Log out
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
