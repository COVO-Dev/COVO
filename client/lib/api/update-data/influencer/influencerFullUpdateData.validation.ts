import { z } from "zod";

// Enhanced phone number validation that accepts international formats
const phoneNumberSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine(
    (value) => {
      // Remove all non-digit characters except + at the beginning
      const cleaned = value.replace(/[^\d+]/g, '');
      // Check if it's a valid international phone number format
      // Allows: +1234567890, +12 345 678 9012, (123) 456-7890, etc.
      const phoneRegex = /^\+?[1-9]\d{6,14}$/;
      return phoneRegex.test(cleaned);
    },
    {
      message: "Please enter a valid phone number (e.g., +1234567890 or 1234567890)"
    }
  );

export const influencerFullUpdateDataSchema = z.object({
  // profilePicture: z.string().optional(),
  // referralSource: z.string().optional(),
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string()
    .email("Please enter a valid email address (e.g., user@example.com)")
    .min(1, "Email is required"),
  username: z.string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  phoneNumber: phoneNumberSchema,
  location: z.object({
    country: z.string().min(1, "Please select your country"),
    city: z.string().min(1, "Please select your city/state"),
  }),
  personalBio: z.string().optional(),

  contentAndAudience: z.object({
    primaryNiche: z.string().min(1, "Please select your primary niche"),
    secondaryNiche: z.string().optional(),
    contentSpecialisation: z
      .string()
      .min(1, "Please select your content specialisation"),
    brandGifting: z.boolean(),
    paidCollaborationsOnly: z.boolean(),
    // rateCardUpload: z.string().optional(),
    // mediaKitUpload: z.string().optional(),
  }),
  consentAndAgreements: z.object({
    termsAccepted: z.boolean(),
    marketingOptIn: z.boolean(),
    dataComplianceConsent: z.boolean(),
  }),

  // selectedPlatforms: z.array(z.enum(['youtube', 'tiktok', 'instagram', 'facebook', 'twitter'])).min(1, { message: "Please select at least one platform" }),
  // socialMediaProfiles: z.object({
  //   instagramHandle: z.string().optional(),
  //   youtubeChannelLink: z.string().optional(),
  //   tiktokHandle: z.string().optional(),
  //   twitterHandle: z.string().optional(),
  //   facebookPageLink: z.string().optional(),
  //   linkedInProfile: z.string().optional(),
  //   otherPlatforms: z
  //     .array(
  //       z.object({
  //         platformName: z.string().min(1, "Platform name is required"),
  //         link: z.string().min(1, "Link is required"),
  //       })
  //     )
  //     .optional(),
  // }),
});

export type IInfluencerFullUpdateData = z.infer<
  typeof influencerFullUpdateDataSchema
>;
