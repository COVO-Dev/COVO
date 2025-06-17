import { z } from "zod";

export const influencerFullUpdateDataSchema = z.object({
  // profilePicture: z.string().optional(),
  // referralSource: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(1, "Username is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  location: z.object({
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
  }),
  personalBio: z.string().optional(),

  contentAndAudience: z.object({
    primaryNiche: z.string().min(1, "Primary niche is required"),
    secondaryNiche: z.string().optional(),
    contentSpecialisation: z
      .string()
      .min(1, "Content specialisation is required"),
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
