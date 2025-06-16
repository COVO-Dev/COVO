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
	consentAndAgreements: z.object({
		termsAccepted: z.boolean(),
		marketingOptIn: z.boolean(),
		dataComplianceConsent: z.boolean(),
	}).optional(),
});

export type IinfluencerRegister = z.infer<typeof influencerRegisterSchema>;
