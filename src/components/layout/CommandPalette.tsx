"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { Spinner } from "@/components/common";
import { StatusBadge } from "@/components/leads/StatusBadge";
import { IconSearch } from "@/components/common/icons";
import { NAV_ITEMS } from "./navItems";
import { apiFetch } from "@/lib/apiClient";
import { useDebounce } from "@/hooks/useDebounce";
import type { LeadDTO, PaginatedResult, UserRole } from "@/types";
import type { UserSummaryDTO } from "@/server/services/userService";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="flex h-5 min-w-5 items-center justify-center rounded border border-border-strong bg-paper px-1 font-sans text-[10px] font-medium text-ink-soft">
      {children}
    </kbd>
  );
}

/**
 * Global search reachable via Cmd/Ctrl+K from anywhere in the dashboard, not
 * just a per-page filter - searches leads always, and people too when the
 * signed-in role is allowed to list the company roster (GET /api/users is
 * admin/manager only, so a `user` role only ever sees lead results here).
 * Before anything is typed, it shows quick nav links plus the most recent
 * leads instead of an empty state - a command palette with nothing in it
 * until you type isn't as useful as one with sensible defaults.
 */
export function CommandPalette({
  isOpen,
  onClose,
  role,
}: {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
}) {
  const router = useRouter();
  const canSearchPeople = role === "admin" || role === "manager";
  const visibleNavItems = NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin");

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);
  const [leads, setLeads] = useState<LeadDTO[]>([]);
  const [people, setPeople] = useState<UserSummaryDTO[]>([]);
  const [recentLeads, setRecentLeads] = useState<LeadDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecents, setIsLoadingRecents] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  // Reset when the palette closes, or when the query empties out - tracked
  // during render (this codebase's convention for "reset state when a
  // dependency changes") rather than as a synchronous setState in an effect.
  const [trackedOpenQueryKey, setTrackedOpenQueryKey] = useState(`${isOpen}|${debouncedQuery}`);
  const openQueryKey = `${isOpen}|${debouncedQuery}`;
  if (trackedOpenQueryKey !== openQueryKey) {
    setTrackedOpenQueryKey(openQueryKey);
    setHighlighted(0);
    if (!isOpen) {
      setQuery("");
      setLeads([]);
      setPeople([]);
      setIsLoading(false);
    } else if (!debouncedQuery.trim()) {
      setLeads([]);
      setPeople([]);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }

  // Recent leads are fetched once each time the palette opens (not on every
  // keystroke) so there's something useful to show before typing anything.
  const [trackedIsOpenForRecents, setTrackedIsOpenForRecents] = useState(isOpen);
  if (trackedIsOpenForRecents !== isOpen) {
    setTrackedIsOpenForRecents(isOpen);
    if (isOpen) {
      setIsLoadingRecents(true);
    } else {
      setRecentLeads([]);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    apiFetch<PaginatedResult<LeadDTO>>("/api/leads?pageSize=5").then((result) => {
      if (cancelled) return;
      if (result.ok) setRecentLeads(result.data.items);
      setIsLoadingRecents(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !debouncedQuery.trim()) return;

    let cancelled = false;

    const tasks: Promise<void>[] = [
      apiFetch<PaginatedResult<LeadDTO>>(
        `/api/leads?search=${encodeURIComponent(debouncedQuery)}&pageSize=5`,
      ).then((result) => {
        if (cancelled || !result.ok) return;
        setLeads(result.data.items);
        setHighlighted(0);
      }),
    ];

    if (canSearchPeople) {
      tasks.push(
        apiFetch<{ users: UserSummaryDTO[] }>("/api/users").then((result) => {
          if (cancelled || !result.ok) return;
          const q = debouncedQuery.toLowerCase();
          setPeople(
            result.data.users
              .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
              .slice(0, 5),
          );
          setHighlighted(0);
        }),
      );
    }

    Promise.all(tasks).finally(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, isOpen, canSearchPeople]);

  function selectLead(lead: LeadDTO) {
    onClose();
    router.push(`/leads?open=${lead.id}`);
  }

  function selectPerson() {
    onClose();
    router.push("/users");
  }

  const resultCount = leads.length + people.length;

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((h) => Math.min(h + 1, resultCount - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (highlighted < leads.length) {
        const lead = leads[highlighted];
        if (lead) selectLead(lead);
      } else if (people[highlighted - leads.length]) {
        selectPerson();
      }
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-ink/50 backdrop-blur-[2px]" />
        <Dialog.Content
          onKeyDown={handleKeyDown}
          className="fixed top-[10%] left-1/2 z-[70] flex max-h-[min(34rem,80vh)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl ring-1 ring-black/5 focus:outline-none"
        >
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          <div className="relative flex shrink-0 items-center border-b border-border">
            <IconSearch size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-faint" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={canSearchPeople ? "Search leads, people..." : "Search leads..."}
              className="w-full bg-transparent py-4 pr-4 pl-11 text-base text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {!query.trim() ? (
              <>
                <div className="mb-1">
                  <p className="px-3 py-1.5 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                    Quick links
                  </p>
                  {visibleNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        onClick={() => {
                          onClose();
                          router.push(item.href);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-paper"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                          <Icon size={16} strokeWidth={1.9} />
                        </span>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <div>
                  <p className="px-3 py-1.5 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                    Recent leads
                  </p>
                  {isLoadingRecents ? (
                    <div className="flex justify-center py-4">
                      <Spinner size={18} />
                    </div>
                  ) : recentLeads.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-ink-faint">No leads yet.</p>
                  ) : (
                    recentLeads.map((lead) => (
                      <button
                        key={lead.id}
                        onClick={() => selectLead(lead)}
                        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-paper"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-saffron text-xs font-semibold text-white">
                          {getInitials(lead.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-ink">{lead.name}</span>
                          <span className="block truncate text-xs text-ink-soft">{lead.company}</span>
                        </span>
                        <StatusBadge status={lead.status} className="shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : isLoading ? (
              <div className="flex justify-center py-6">
                <Spinner size={20} />
              </div>
            ) : resultCount === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-ink-faint">No results for &ldquo;{query}&rdquo;</p>
            ) : (
              <>
                {leads.length > 0 && (
                  <div className="mb-1">
                    <p className="px-3 py-1.5 text-xs font-semibold tracking-wide text-ink-faint uppercase">Leads</p>
                    {leads.map((lead, i) => (
                      <button
                        key={lead.id}
                        onClick={() => selectLead(lead)}
                        onMouseEnter={() => setHighlighted(i)}
                        className={clsx(
                          "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm",
                          highlighted === i ? "bg-accent-soft" : "hover:bg-paper",
                        )}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-saffron text-xs font-semibold text-white">
                          {getInitials(lead.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-ink">{lead.name}</span>
                          <span className="block truncate text-xs text-ink-soft">{lead.company}</span>
                        </span>
                        <StatusBadge status={lead.status} className="shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
                {people.length > 0 && (
                  <div>
                    <p className="px-3 py-1.5 text-xs font-semibold tracking-wide text-ink-faint uppercase">People</p>
                    {people.map((person, i) => {
                      const idx = leads.length + i;
                      return (
                        <button
                          key={person.id}
                          onClick={selectPerson}
                          onMouseEnter={() => setHighlighted(idx)}
                          className={clsx(
                            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm",
                            highlighted === idx ? "bg-accent-soft" : "hover:bg-paper",
                          )}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                            {getInitials(person.name)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-ink">{person.name}</span>
                            <span className="block truncate text-xs text-ink-soft">{person.email}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-border bg-paper px-4 py-2.5">
            <div className="flex items-center gap-3 text-xs text-ink-faint">
              <span className="flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <Kbd>↵</Kbd> Select
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs text-ink-faint">
              <Kbd>esc</Kbd> Close
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
