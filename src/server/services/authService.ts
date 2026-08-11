import { randomBytes } from "crypto";
import { Company } from "@/models/Company";
import { User, type UserDocument } from "@/models/User";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { HttpError } from "@/server/http";
import type { AuthContext, SessionUser, UserRole } from "@/types";
import type { SignupInput } from "@/lib/validations/auth";

export async function authenticate(
  email: string,
  password: string,
): Promise<{ ctx: AuthContext; sessionUser: SessionUser } | null> {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user) return null;

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  const company = await Company.findById(user.companyId);
  if (!company) return null;

  const ctx: AuthContext = {
    userId: user._id.toString(),
    companyId: company._id.toString(),
    role: user.role as UserRole,
    name: user.name,
    email: user.email,
  };

  const sessionUser: SessionUser = {
    id: ctx.userId,
    companyId: ctx.companyId,
    companyName: company.name,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
  };

  return { ctx, sessionUser };
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "company";
}

async function generateUniqueSlug(companyName: string): Promise<string> {
  const base = slugify(companyName);
  let slug = base;
  let suffix = 1;
  // Collisions are rare (company names aren't usually identical) so this
  // rarely loops more than once - a full uniqueness reservation scheme would
  // be overkill for what's effectively a display-only identifier.
  while (await Company.exists({ slug })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

/** Shared by both signup paths: creates the Company, its first (admin) user, and the resulting session shapes. */
async function provisionCompanyWithAdmin(params: {
  companyName: string;
  name: string;
  email: string;
  passwordHash: string;
}): Promise<{ ctx: AuthContext; sessionUser: SessionUser }> {
  const slug = await generateUniqueSlug(params.companyName);
  const company = await Company.create({ name: params.companyName, slug });

  const user = await User.create({
    companyId: company._id,
    name: params.name,
    email: params.email,
    passwordHash: params.passwordHash,
    role: "admin",
  });

  const ctx: AuthContext = {
    userId: user._id.toString(),
    companyId: company._id.toString(),
    role: "admin",
    name: user.name,
    email: user.email,
  };

  const sessionUser: SessionUser = {
    id: ctx.userId,
    companyId: ctx.companyId,
    companyName: company.name,
    name: user.name,
    email: user.email,
    role: "admin",
  };

  return { ctx, sessionUser };
}

/**
 * Creates a brand-new tenant and its first user (always `admin`) in one step -
 * distinct from `createCompanyUser`, which adds a teammate to an *existing*
 * company. This is the only place (along with `signUpWithGoogle`) a new
 * Company document gets created.
 */
export async function signUp(
  input: SignupInput,
): Promise<{ ctx: AuthContext; sessionUser: SessionUser }> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new HttpError(409, "An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  return provisionCompanyWithAdmin({
    companyName: input.companyName,
    name: input.name,
    email: input.email,
    passwordHash,
  });
}

/**
 * Google-signup counterpart of `signUp` - the OAuth callback verifies
 * identity (email, name) and stashes it in a short-lived pending-signup
 * token; this runs once the user submits the company name that token can't
 * provide on its own. Always creates a brand-new company (never joins/guesses
 * an existing one from the email domain) with the Google account as its
 * admin. There's no password step in this flow, so a random, never-revealed
 * password hash is stored just to satisfy the schema; the account can only
 * ever sign in via Google afterward.
 */
export async function completeGoogleSignup(input: {
  name: string;
  email: string;
  companyName: string;
}): Promise<{ ctx: AuthContext; sessionUser: SessionUser }> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new HttpError(409, "An account with this email already exists");
  }

  const passwordHash = await hashPassword(randomBytes(32).toString("hex"));
  return provisionCompanyWithAdmin({
    companyName: input.companyName,
    name: input.name,
    email: input.email,
    passwordHash,
  });
}

/** Builds the ctx/sessionUser pair for an already-resolved user + their company - shared by the two OAuth outcomes. */
export async function buildSessionFromUser(
  user: UserDocument,
): Promise<{ ctx: AuthContext; sessionUser: SessionUser } | null> {
  const company = await Company.findById(user.companyId);
  if (!company) return null;

  const ctx: AuthContext = {
    userId: user._id.toString(),
    companyId: company._id.toString(),
    role: user.role as UserRole,
    name: user.name,
    email: user.email,
  };

  const sessionUser: SessionUser = {
    id: ctx.userId,
    companyId: ctx.companyId,
    companyName: company.name,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
  };

  return { ctx, sessionUser };
}

export async function getSessionUser(ctx: AuthContext): Promise<SessionUser | null> {
  const company = await Company.findById(ctx.companyId);
  if (!company) return null;

  return {
    id: ctx.userId,
    companyId: ctx.companyId,
    companyName: company.name,
    name: ctx.name,
    email: ctx.email,
    role: ctx.role,
  };
}
