import { z } from "zod";
import { LEAD_STATUSES } from "@/types";

const objectIdPattern = /^[a-f\d]{24}$/i;

export const leadStatusSchema = z.enum(LEAD_STATUSES as [string, ...string[]]);

export const createLeadSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(200),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    phone: z.string().trim().min(1, "Phone is required").max(40),
    company: z.string().trim().min(1, "Company is required").max(200),
    status: leadStatusSchema.optional(),
    assignedUserId: z.union([z.string().regex(objectIdPattern, "Invalid user id"), z.null()]).optional(),
    notes: z.string().trim().max(5000).optional(),
  })
  .strict();

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = createLeadSchema.partial().strict();

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const leadListQuerySchema = z
  .object({
    search: z.string().trim().max(200).optional(),
    status: leadStatusSchema.optional(),
    assignedUserId: z.string().regex(objectIdPattern, "Invalid user id").optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
  })
  .strict();

export type LeadListQuery = z.infer<typeof leadListQuerySchema>;

export const aiReplySchema = z
  .object({
    message: z.string().trim().min(1, "Message is required").max(4000),
  })
  .strict();

export type AiReplyInput = z.infer<typeof aiReplySchema>;

export const objectIdSchema = z.string().regex(objectIdPattern, "Invalid id");

export const saveReplySchema = z
  .object({
    text: z.string().trim().min(1, "Reply text is required").max(4000),
  })
  .strict();

export type SaveReplyInput = z.infer<typeof saveReplySchema>;
