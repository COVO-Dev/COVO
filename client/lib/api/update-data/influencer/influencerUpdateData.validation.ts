import { z } from "zod";

const platformMetricsSchema = z.object({
  followers: z.number().min(1),
  likes: z.number().min(1).optional(),
  comments: z.number().min(1).optional(),
  shares: z.number().min(1).optional(),
  views: z.number().min(1),
  engagementRate: z.number().min(1),
})

const platformDataSchema = z.object({
  metrics: platformMetricsSchema.optional(),
  demographics: z.object({
    age: z.number().min(1),
    gender: z.string().min(1),
    location: z.string().min(1),
  }),
  platformUsername: z.string().min(1),
  platformId: z.string().min(1).optional(),
})

// old influencer schema:
// export const influencerFormDataSchema = z.object({
//   firstName: z.string().min(1, "First name is required"),
//   lastName: z.string().min(1, "Last name is required"),
//   email: z.string().email("Invalid email address"),
//   phoneNumber: z.string().min(1, "Phone number is required"),
//   username: z.string().min(1, "Username is required"),
//   socialMediaProfiles: z.object({
//     instagramHandle: z.string().optional(),
//     youtubeChannelLink: z.string().optional(),
//     tiktokHandle: z.string().optional(),
//     twitterHandle: z.string().optional(),
//     facebookPageLink: z.string().optional(),
//     linkedInProfile: z.string().optional(),
//     otherPlatforms: z
//       .array(
//         z.object({
//           platformName: z.string().min(1, "Platform name is required"),
//           link: z.string().min(1, "Link is required"),
//         })
//       )
//       .optional(),
//   }),
//   contentAndAudience: z.object({
//     primaryNiche: z.string().min(1, "Primary niche is required"),
//     secondaryNiche: z.string().optional(),
//     contentSpecialisation: z.string().min(1, "Content specialisation is required"),
//     brandGifting: z.boolean(),
//     paidCollaborationsOnly: z.boolean(),
//     rateCardUpload: z.string().optional(),
//     mediaKitUpload: z.string().optional(),
//   }),
//   profilePicture: z.string().optional(),
//   location: z.object({
//     country: z.string().min(1, "Country is required"),
//     city: z.string().min(1, "City is required"),
//   }),
//   personalBio: z.string().optional(),
//   referralSource: z.string().optional(),
//   consentAndAgreements: z.object({
//     termsAccepted: z.boolean(),
//     marketingOptIn: z.boolean(),
//     dataComplianceConsent: z.boolean(),
//   }),
// });

// Back-end moreInformationSchema:
// export const influencerMoreInformationSchema = z.object({
// 	platforms: platformDataSchema.optional(),
// 	selectedPlatforms: z.array(z.string().min(1)).min(1),
// 	contentAndAudience: z.object({
// 			primaryNiche: z.string(),
// 			secondaryNiche: z.string().optional(),
// 			contentSpecialisation: z.string(),
// 			rateCardUpload: z.string().optional(),
// 			brandGifting: z.boolean(),
// 			paidCollaborationsOnly: z.boolean(),
// 			mediaKitUpload: z.string().optional(),
// 	}),
// 	personalBio: z.string().min(1).optional(),
// 	location: z.object({
// 			country: z.string(),
// 			city: z.string(),
// 	}),
// 	profilePicture: z.string().optional(),
// 	phoneNumber: z.string().regex(/^\+?[0-9]\d{1,14}$/, "Invalid phone number"),
// 	referralSource: z.string().optional(),
// });


export const influencerFormDataSchema = z.object({

  // platforms: z.object({
  //   youtube: platformDataSchema.optional(),
  //   tiktok: platformDataSchema.optional(),
  //   instagram: platformDataSchema.optional(),
  //   facebook: platformDataSchema.optional(),
  //   twitter: platformDataSchema.optional(),
  // }),

  // selectedPlatforms: z.array(z.enum(['youtube', 'tiktok', 'instagram', 'facebook', 'twitter'])).min(1, { message: "Please select at least one platform" }),
  contentAndAudience: z.object({
    primaryNiche: z.string().min(1),
    secondaryNiche: z.string().optional(),
    contentSpecialisation: z.string().min(1),
    brandGifting: z.boolean(),
    paidCollaborationsOnly: z.boolean(),
  }),
  personalBio: z.string().min(1).optional(),

  location: z.object({
    country: z.string().min(1),
    city: z.string().min(1),
  }),
  // profilePicture: z.string().url().optional(),
  referralSource: z.string().optional(),
  phoneNumber: z.string().regex(/^\+?[0-9]\d{1,14}$/, "Invalid phone number"),

});

export type IInfluencerUpdateData = z.infer<typeof influencerFormDataSchema>;