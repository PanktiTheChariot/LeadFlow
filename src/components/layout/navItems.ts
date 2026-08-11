import { IconDashboard, IconLeads, IconTeam } from "@/components/common/icons";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard, adminOnly: false },
  { href: "/leads", label: "Leads", icon: IconLeads, adminOnly: false },
  { href: "/users", label: "Team", icon: IconTeam, adminOnly: true },
] as const;
