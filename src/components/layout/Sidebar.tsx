"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/lib/apiClient";
import { BrandMark } from "@/components/common";
import { IconLogout, IconMenu, IconSearch } from "@/components/common/icons";
import { NAV_ITEMS } from "./navItems";

const WIDTH_TRANSITION = { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const };
const FADE_TRANSITION = { duration: 0.15 };

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * A single persistent element whose width animates between the collapsed
 * rail and the expanded panel - not two components swapped on toggle - so
 * Framer can smoothly interpolate the slide instead of snapping instantly.
 * Content that only exists in one state (labels, search, the hamburger)
 * crossfades via AnimatePresence rather than popping in/out.
 */
export function Sidebar({
  isOpen,
  onToggle,
  onOpenSearch,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onOpenSearch: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "admin");

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 56 }}
      transition={WIDTH_TRANSITION}
      className="hidden h-full shrink-0 flex-col overflow-hidden bg-brand-panel-bg py-4 md:flex"
    >
      <div className={clsx("mb-4 flex shrink-0 items-center", isOpen ? "justify-between px-3" : "justify-center")}>
        {isOpen ? (
          <div className="flex items-center gap-2">
            <BrandMark size={28} />
            <span className="font-brand text-lg whitespace-nowrap text-brand-panel-text">LeadFlow</span>
          </div>
        ) : (
          <button onClick={onToggle} aria-label="Expand sidebar">
            <BrandMark size={36} rounded="full" />
          </button>
        )}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.button
              key="collapse-toggle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE_TRANSITION}
              onClick={onToggle}
              aria-label="Collapse sidebar"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-brand-panel-text-soft hover:bg-brand-panel-surface hover:text-brand-panel-text"
            >
              <IconMenu size={18} strokeWidth={1.9} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="search"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={FADE_TRANSITION}
            className="shrink-0 overflow-hidden px-3"
          >
            <button
              type="button"
              onClick={onOpenSearch}
              className="relative mb-4 flex w-full items-center rounded-lg border border-white/10 bg-brand-panel-surface py-1.5 pr-2 pl-9 text-left text-sm text-brand-panel-text-soft transition-colors hover:border-white/20"
            >
              <IconSearch
                size={15}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-panel-text-soft"
              />
              <span className="flex-1 truncate">Search...</span>
              <kbd className="shrink-0 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-sans text-[10px] text-brand-panel-text-soft">
                ⌘K
              </kbd>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="flex flex-1 flex-col gap-1.5 overflow-x-hidden overflow-y-auto px-3">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isOpen ? undefined : item.label}
              className={clsx(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                isOpen ? "gap-3 px-3 py-2.5" : "h-9 w-9 justify-center self-center",
                isActive
                  ? "bg-saffron text-white"
                  : "text-brand-panel-text-soft hover:bg-brand-panel-surface hover:text-brand-panel-text",
              )}
            >
              <Icon size={isOpen ? 18 : 16} strokeWidth={1.9} className="shrink-0" />
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={FADE_TRANSITION}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className={clsx("mt-3 shrink-0", isOpen ? "px-3" : "flex justify-center")}>
          <AnimatePresence initial={false} mode="wait">
            {isOpen ? (
              <motion.div
                key="account-expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={FADE_TRANSITION}
                className="w-full rounded-lg bg-brand-panel-surface p-3"
              >
                <p className="truncate text-xs font-semibold tracking-wide text-brand-panel-text-soft uppercase">
                  {user.companyName}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-brand-panel-text">{user.name}</p>
                    <span className="text-xs font-medium text-saffron capitalize">{user.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    aria-label="Log out"
                    title="Log out"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-danger text-white transition-opacity hover:opacity-90"
                  >
                    <IconLogout size={15} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="account-collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={FADE_TRANSITION}
                className="flex flex-col items-center gap-2"
              >
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger text-white transition-opacity hover:opacity-90"
                >
                  <IconLogout size={16} />
                </button>
                <div
                  title={`${user.name} (${user.role})`}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-saffron text-[10px] font-semibold text-white"
                >
                  {getInitials(user.name)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.aside>
  );
}
