import { z } from "zod";

// Individual field schemas for validation
export const emailSchema = z.string().email({message: "Please enter a valid email address (e.g., user@example.com)"}).min(1, {message: "Email is required"});
export const passwordSchema = z.string().min(6, {message: "Password must be at least 6 characters long"});

export const loginSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
});

export type ILogin = z.infer<typeof loginSchema>;
