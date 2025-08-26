import { z } from "zod";

export const brandFormDataSchema = z.object({
	firstName: z.string().min(1, "First name is required").optional(),
	lastName: z.string().min(1, "Last name is required").optional(),
	username: z.string().min(1, "Username is required").optional(),
	companyName: z.string().min(1, "company name is required").optional(),
	companyWebsite: z.string().url("Invalid company website URL").optional(),
	email: z.string().email("Invalid email address").optional(),
	password: z.string().min(8, "Password must be at least 8 characters").optional(),
	position: z.string().min(1, "Position is required").optional(),
	// logo: z.string().url("Invalid logo URL").optional(),
	industry: z.string().optional(),
	phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional(),
	campaigns: z.array(z.string()).optional(),
	businessType: z.string().min(1, "Business type is required").optional(),
	// socialMedia: z.object({
	// 		instagram: z.string().url("Invalid Instagram URL").optional(),
	// 		facebook: z.string().url("Invalid Facebook URL").optional(),
	// 		linkedin: z.string().url("Invalid LinkedIn URL").optional(),
	// 		twitter: z.string().url("Invalid Twitter URL").optional(),
	// 	}).optional(),
	// paymentDetails: z.object({
	// 		method: z.string().min(1, "Payment method is required").optional(),
	// 		billingInfo: z.string().min(1, "Billing information is required").optional(),
	// 	}).optional(),
	bio: z.string().min(1, "Bio is required").optional(),
});

export type IBrandUpdateData = z.infer<typeof brandFormDataSchema>;
