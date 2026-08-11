import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const companySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type CompanyDocument = InferSchemaType<typeof companySchema> & { _id: Schema.Types.ObjectId };

export const Company: Model<CompanyDocument> =
  (models.Company as Model<CompanyDocument>) ?? model<CompanyDocument>("Company", companySchema);
