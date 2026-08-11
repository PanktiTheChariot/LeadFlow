import { User, type UserDocument } from "@/models/User";
import { Lead } from "@/models/Lead";
import { hashPassword } from "@/lib/auth/password";
import { forbidden, notFound, HttpError } from "@/server/http";
import { invalidateLeadsCache } from "@/lib/redis";
import type { AuthContext, UserRole } from "@/types";
import type { CreateUserInput } from "@/lib/validations/user";

export interface UserSummaryDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

function toDTO(user: UserDocument): UserSummaryDTO {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    createdAt: (user.createdAt as Date).toISOString(),
  };
}

export async function listCompanyUsers(ctx: AuthContext): Promise<UserSummaryDTO[]> {
  const users = await User.find({ companyId: ctx.companyId }).sort({ name: 1 });
  return users.map(toDTO);
}

export async function createCompanyUser(ctx: AuthContext, input: CreateUserInput): Promise<UserSummaryDTO> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new HttpError(409, "A user with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    companyId: ctx.companyId,
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role,
  });

  return toDTO(user);
}

export async function deleteCompanyUser(ctx: AuthContext, userId: string): Promise<void> {
  if (userId === ctx.userId) {
    throw forbidden("You cannot delete your own account");
  }

  const target = await User.findOne({ _id: userId, companyId: ctx.companyId });
  if (!target) throw notFound("User not found");

  if (target.role === "admin") {
    const adminCount = await User.countDocuments({ companyId: ctx.companyId, role: "admin" });
    if (adminCount <= 1) {
      throw forbidden("Cannot delete the last admin. Promote another user to admin first.");
    }
  }

  // Leads assigned to this user shouldn't vanish or point at a deleted
  // account - they fall back to unassigned, same as if no one had claimed them.
  await Lead.updateMany(
    { companyId: ctx.companyId, assignedUserId: target._id },
    { $set: { assignedUserId: null } },
  );

  await target.deleteOne();
  await invalidateLeadsCache(ctx.companyId);
}
