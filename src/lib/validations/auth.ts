import { z } from "zod";

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    companyName: z.string().trim().min(2, "Company name is required").max(150),
    name: z.string().trim().min(2, "Your name is required").max(200),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(200),
  })
  .strict();

export type SignupInput = z.infer<typeof signupSchema>;

export const completeGoogleSignupSchema = z
  .object({
    companyName: z.string().trim().min(2, "Company name is required").max(150),
  })
  .strict();

export type CompleteGoogleSignupInput = z.infer<typeof completeGoogleSignupSchema>;
