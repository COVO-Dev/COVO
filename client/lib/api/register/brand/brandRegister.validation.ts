import { z } from "zod";

/**
 * Full Name (First and Last Name)
 * Email Address (for communication and account access)
 * Company Name (as registered)
 * Position/Role (e.g., Marketing Manager, Brand Owner)
 * Password (with confirmation)
 * Phone Number (optional for two-factor authentication or alternative contact)
 */

export const brandRegisterSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z
    .string()
    .min(1, "Phone number should be no longer than 18 numbers")
    .optional(),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyName: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  username: z.string().min(1, "Username is required"),
  consentAndAgreements: z.object({
    termsAccepted: z.boolean(),
    marketingOptIn: z.boolean(),
    dataComplianceConsent: z.boolean(),
  }),
});

export type IbrandRegister = z.infer<typeof brandRegisterSchema>;
