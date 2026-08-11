import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { LEAD_STATUSES } from "@/types";

/** One saved AI-generated reply. Kept as its own list rather than appended into `notes` - a lead can accumulate many of these over time, and mashing them into one free-text field makes each one hard to find. */
const savedReplySchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const leadSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    status: { type: String, enum: LEAD_STATUSES, required: true, default: "New" },
    assignedUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, default: "", trim: true },
    savedReplies: { type: [savedReplySchema], default: [] },
  },
  { timestamps: true },
);

leadSchema.index({ companyId: 1, status: 1 });
leadSchema.index({ companyId: 1, assignedUserId: 1 });
leadSchema.index({ companyId: 1, createdAt: -1 });

export type LeadDocument = InferSchemaType<typeof leadSchema> & { _id: Schema.Types.ObjectId };

export const Lead: Model<LeadDocument> =
  (models.Lead as Model<LeadDocument>) ?? model<LeadDocument>("Lead", leadSchema);
