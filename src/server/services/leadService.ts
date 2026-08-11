import { FilterQuery, Types, type HydratedDocument } from "mongoose";
import { Lead, type LeadDocument } from "@/models/Lead";
import { User } from "@/models/User";
import { forbidden, notFound } from "@/server/http";
import { invalidateLeadsCache } from "@/lib/redis";
import type { AuthContext, LeadDTO, PaginatedResult } from "@/types";
import type { CreateLeadInput, LeadListQuery, UpdateLeadInput } from "@/lib/validations/lead";

/** Fields a `user`-role member is allowed to change on a lead assigned to them. */
const USER_EDITABLE_FIELDS = new Set(["status", "notes"]);

export async function toDTO(lead: LeadDocument): Promise<LeadDTO> {
  let assignedUser: LeadDTO["assignedUser"] = null;
  if (lead.assignedUserId) {
    const user = await User.findById(lead.assignedUserId).select("name email");
    if (user) {
      assignedUser = { id: user._id.toString(), name: user.name, email: user.email };
    }
  }

  return {
    id: lead._id.toString(),
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    status: lead.status as LeadDTO["status"],
    notes: lead.notes ?? "",
    savedReplies: (lead.savedReplies ?? []).map((reply) => ({
      id: reply._id!.toString(),
      text: reply.text,
      createdAt: (reply.createdAt as Date).toISOString(),
    })),
    assignedUser,
    createdAt: (lead.createdAt as Date).toISOString(),
    updatedAt: (lead.updatedAt as Date).toISOString(),
  };
}

/** Shared by every lead-scoped operation: tenant + `user`-role assignment check in one place. */
async function findAccessibleLead(ctx: AuthContext, id: string): Promise<HydratedDocument<LeadDocument>> {
  const lead = await Lead.findOne({ _id: id, companyId: ctx.companyId });
  if (!lead) throw notFound("Lead not found");

  if (ctx.role === "user" && lead.assignedUserId?.toString() !== ctx.userId) {
    // 404 rather than 403 - do not confirm a Company-B (or unassigned) lead even exists.
    throw notFound("Lead not found");
  }

  return lead;
}

function buildScopedFilter(
  ctx: AuthContext,
  query: Pick<LeadListQuery, "status" | "assignedUserId" | "search">,
) {
  const filter: FilterQuery<LeadDocument> = { companyId: new Types.ObjectId(ctx.companyId) };

  // `user` role only ever sees leads assigned to them, regardless of what's requested.
  if (ctx.role === "user") {
    filter.assignedUserId = new Types.ObjectId(ctx.userId);
  } else if (query.assignedUserId) {
    filter.assignedUserId = new Types.ObjectId(query.assignedUserId);
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const pattern = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: pattern }, { email: pattern }, { company: pattern }];
  }

  return filter;
}

export async function listLeads(ctx: AuthContext, query: LeadListQuery): Promise<PaginatedResult<LeadDTO>> {
  const filter = buildScopedFilter(ctx, query);
  const skip = (query.page - 1) * query.pageSize;

  const [documents, total] = await Promise.all([
    Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.pageSize),
    Lead.countDocuments(filter),
  ]);

  const items = await Promise.all(documents.map(toDTO));

  return {
    items,
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getLeadById(ctx: AuthContext, id: string): Promise<LeadDTO> {
  const lead = await findAccessibleLead(ctx, id);
  return toDTO(lead);
}

/** Appends a saved reply - same access rule as reading the lead (tenant + assigned-only for `user`). */
export async function saveReply(ctx: AuthContext, id: string, text: string): Promise<LeadDTO> {
  const lead = await findAccessibleLead(ctx, id);
  lead.savedReplies.push({ text });
  await lead.save();
  return toDTO(lead);
}

export async function deleteReply(ctx: AuthContext, id: string, replyId: string): Promise<LeadDTO> {
  const lead = await findAccessibleLead(ctx, id);
  const before = lead.savedReplies.length;
  lead.savedReplies = lead.savedReplies.filter((reply) => reply._id?.toString() !== replyId) as typeof lead.savedReplies;
  if (lead.savedReplies.length === before) throw notFound("Saved reply not found");
  await lead.save();
  return toDTO(lead);
}

export async function createLead(ctx: AuthContext, input: CreateLeadInput): Promise<LeadDTO> {
  if (ctx.role === "user") {
    throw forbidden("Users cannot create leads");
  }

  if (input.assignedUserId) {
    await assertUserBelongsToTenant(ctx, input.assignedUserId);
  }

  const lead = await Lead.create({
    companyId: ctx.companyId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    company: input.company,
    status: input.status ?? "New",
    assignedUserId: input.assignedUserId ?? null,
    notes: input.notes ?? "",
  });

  await invalidateLeadsCache(ctx.companyId);
  return toDTO(lead);
}

export async function updateLead(ctx: AuthContext, id: string, input: UpdateLeadInput): Promise<LeadDTO> {
  const lead = await Lead.findOne({ _id: id, companyId: ctx.companyId });
  if (!lead) throw notFound("Lead not found");

  if (ctx.role === "user") {
    if (lead.assignedUserId?.toString() !== ctx.userId) {
      throw notFound("Lead not found");
    }
    const attemptedFields = Object.keys(input);
    const disallowed = attemptedFields.filter((field) => !USER_EDITABLE_FIELDS.has(field));
    if (disallowed.length > 0) {
      throw forbidden(`Users may only update: ${Array.from(USER_EDITABLE_FIELDS).join(", ")}`);
    }
  }

  if (input.assignedUserId) {
    await assertUserBelongsToTenant(ctx, input.assignedUserId);
  }

  Object.assign(lead, input);
  await lead.save();

  await invalidateLeadsCache(ctx.companyId);
  return toDTO(lead);
}

export async function deleteLead(ctx: AuthContext, id: string): Promise<void> {
  if (ctx.role === "user") {
    throw forbidden("Users cannot delete leads");
  }

  const result = await Lead.deleteOne({ _id: id, companyId: ctx.companyId });
  if (result.deletedCount === 0) throw notFound("Lead not found");

  await invalidateLeadsCache(ctx.companyId);
}

async function assertUserBelongsToTenant(ctx: AuthContext, userId: string): Promise<void> {
  const assignee = await User.findOne({ _id: userId, companyId: ctx.companyId });
  if (!assignee) {
    throw notFound("Assigned user not found in this company");
  }
}
