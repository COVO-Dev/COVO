import { z } from "zod";

// Individual field schemas for validation
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    { message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" }
  );

export const confirmPasswordSchema = z.string().min(1, { message: "Please confirm your password" });

export const tokenSchema = z.string().min(1, { message: "Reset token is required" });

// Main reset password schema
export const resetPasswordSchema = z.object({
  token: tokenSchema,
  newPassword: passwordSchema,
  confirmPassword: confirmPasswordSchema,
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type IResetPassword = z.infer<typeof resetPasswordSchema>;
