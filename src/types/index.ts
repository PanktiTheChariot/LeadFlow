export type UserRole = "admin" | "manager" | "user";

export const USER_ROLES: UserRole[] = ["admin", "manager", "user"];

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted" | "Lost";

export const LEAD_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Converted", "Lost"];

/** Identity derived from a verified JWT - never from client-supplied ids. */
export interface AuthContext {
  userId: string;
  companyId: string;
  role: UserRole;
  name: string;
  email: string;
}

export interface SessionUser {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AssignedUserSummary {
  id: string;
  name: string;
  email: string;
}

export interface SavedReplyDTO {
  id: string;
  text: string;
  createdAt: string;
}

export interface LeadDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  notes: string;
  savedReplies: SavedReplyDTO[];
  assignedUser: AssignedUserSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface LeadsPerDayPoint {
  date: string;
  count: number;
}

export interface DashboardStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  recentLeads: LeadDTO[];
  assignedLeads: LeadDTO[];
  leadsPerDay: LeadsPerDayPoint[];
  newLast7Days: number;
  newPrevious7Days: number;
}

/** Discriminated-union style API envelope so the client never has to guess the shape. */
export type ApiResult<T> =
  { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };
