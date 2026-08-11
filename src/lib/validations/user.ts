import { z } from "zod";
import { USER_ROLES } from "@/types";

export const createUserSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(200),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(200),
    role: z.enum(USER_ROLES as [string, ...string[]]),
  })
  .strict();

export type CreateUserInput = z.infer<typeof createUserSchema>;
