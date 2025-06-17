import { z } from "zod";

// Schema for forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Type for forgot password
export interface IForgotPassword {
  email: string;
}
