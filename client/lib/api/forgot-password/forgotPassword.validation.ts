import { z } from "zod";

// Schema for forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email format"),
});

// Type for forgot password
export interface IForgotPassword {
  email: string;
}
