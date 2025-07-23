import { z } from "zod";

export const brandFormDataSchema = z.object({
	firstName: z.string().min(1, "First name is required").optional(),
	lastName: z.string().min(1, "Last name is required").optional(),
	username: z.string().min(1, "Username is required").optional(),
	companyName: z.string().min(1, "Company name is required").optional(),
	companyWebsite: z.string().url("Invalid company website URL").optional().or(z.literal("")),
	email: z.string().email("Invalid email address").optional(),
	password: z.string().min(8, "Password must be at least 8 characters").optional(),
	position: z.string().min(1, "Position is required").optional(),
	logo: z.string().optional(),
	industry: z.string().optional(),
	phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional().or(z.literal("")),
	campaigns: z.array(z.string()).optional(),
	businessType: z.string().min(1, "Business type is required").optional(),
	socialMedia: z.object({
		instagram: z.string().optional(),
		facebook: z.string().optional(),
		linkedin: z.string().optional(),
		twitter: z.string().optional(),
	}).optional(),
	paymentDetails: z.object({
		method: z.string().optional(),
		billingInfo: z.string().optional(),
	}).optional(),
	bio: z.string().optional(),
});

export type IBrandUpdateData = z.infer<typeof brandFormDataSchema>;
