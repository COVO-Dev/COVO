import { z } from "zod";

export const influencerRegisterSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(6),
	username: z
		.string()
		.min(3, {
			message: "Please make sure that username is no shorter than 3 characters",
		})
		.regex(/^[a-zA-Z0-9_-]+$/, {
			message:
				"Allowed characters are letters, numbers and underscore(_) and dash(-)",
		}),
	yearOfBirth: z.string().refine((val) => {
		const year = parseInt(val);
		const currentYear = new Date().getFullYear();
		return !isNaN(year) && year >= 1900 && year <= currentYear - 13;
	}, {
		message: "Please enter a valid year of birth. You must be at least 13 years old.",
	}),
	consentAndAgreements: z.object({
		termsAccepted: z.boolean(),
		marketingOptIn: z.boolean(),
		dataComplianceConsent: z.boolean(),
	}).optional(),
});

export type IinfluencerRegister = z.infer<typeof influencerRegisterSchema>;
