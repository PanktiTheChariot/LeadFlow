"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { CommandPalette } from "./CommandPalette";
import { Spinner } from "@/components/common";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const hydrate = useAuthStore((state) => state.hydrate);
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (status === "idle") hydrate();
  }, [status, hydrate]);

  useEffect(() => {
    // Proxy already guards this route server-side; this only covers a session
    // that expires mid-visit while the tab stays open.
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Both metaKey (Mac) and ctrlKey (Windows/Linux) trigger it, regardless
      // of which symbol the trigger UI displays.
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleMenuClick() {
    // Below the md breakpoint the sidebar isn't rendered at all, so the same
    // button opens the slide-over drawer instead of toggling it.
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsMobileNavOpen(true);
    } else {
      setIsSidebarOpen((open) => !open);
    }
  }

  if (status === "idle" || status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <MobileNavDrawer isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} role={user?.role ?? "user"} />
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((open) => !open)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={handleMenuClick} />
        <main className="flex-1 overflow-y-auto bg-paper px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
