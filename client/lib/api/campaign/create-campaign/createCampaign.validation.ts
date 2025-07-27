import { z } from "zod";

const collaborationPreferencesSchema = z.object({
  hasWorkedWithInfluencers: z.boolean(),
  exclusiveCollaborations: z.boolean(),
  type: z.string().min(1, "Collaboration type is required"),
  styles: z
    .array(z.string())
    .min(1, "At least one collaboration style is required"),
});

const trackingAndAnalyticsSchema = z.object({
  metrics: z.array(z.string()).optional(), // This field is not currently active in the form
  reportFrequency: z.string().min(1, "Report frequency is required"),
  performanceTracking: z.boolean(),
});

const targetAudienceSchema = z.object({
  ageGroups: z.string().min(1, "Age group is required"),
  gender: z.string().min(1, "Gender is required"),
  incomeLevel: z.string().min(1, "Income level is required"),
  lifeStage: z.string().min(1, "Life stage is required"),
  lifestyle: z.string().min(1, "Lifestyle is required"),
  engagementLevel: z.string().min(1, "Engagement level is required"),
  platform: z.string().min(1, "Platform is required"),
});

const geographicFocusSchema = z.object({
  country: z.string().min(1, "Country is required"),
  city: z.string().optional(),
});

export const campaignSchema = z.object({
  brandId: z.string().optional(),
  // step 1
  title: z.string().min(1, "Title is required"),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
  budgetRange: z.string().min(1, "Budget range is required"),
  targetAudience: targetAudienceSchema,

  // step 2
  primaryGoals: z.string().min(1, "Primary goal is required"),
  influencerType: z.string().min(1, "Influencer type is required"),
  geographicFocus: geographicFocusSchema,
  collaborationPreferences: collaborationPreferencesSchema,

  // Fields moved from step 3
  trackingAndAnalytics: trackingAndAnalyticsSchema,
  status: z.string().optional(), // Status is often set by the system, making it optional on creation
  is_deleted: z.boolean().optional(),
});

export type ICampaign = z.infer<typeof campaignSchema>;

// title: string;
// startDate: Date;
// endDate: Date;
// budgetRange: number;
// targetAudience: string;
// primaryGoals: string[];
// influencerType: string;
// geographicFocus: string;
// collaborationPreferences: {
//   hasWorkedWithInfluencers: boolean;
//   exclusiveCollaborations: boolean;
//   type: string;
//   styles: string[];
// };
// trackingAndAnalytics: {
//   performanceTracking: boolean;
//   metrics: string[];
//   reportFrequency: string;
// };
// status: "active" | "completed" | "pending";
// is_deleted: boolean;

// {
//   schema: z.object({
//     title: z.string().min(1, "Title is required"),
//     startDate: z.date(),
//     endDate: z.date(),
//     budgetRange: z.string().min(1),
//     targetAudience: z.string().min(1, "Target audience is required"),
//   })
// },
// {
//   schema: z.object({
//     primaryGoals: z.array(z.string()).min(1, "At least one character for goal").min(1, "At least one Goal"),
//     influencerType: z.string().min(1, "Influencer type is required"),
//     geographicFocus: z.string().min(1, "Geographic focus is required"),
//     hasWorkedWithInfluencers: z.boolean(),
//     exclusiveCollaborations: z.boolean(),
//     type: z.string().min(1, "Collaboration type is required"),
//     styles: z.array(z.string()).min(1, "At least one character for style").min(1, "At least one style"),
//   })
// },
// {
//   schema: z.object({
//     metrics: z.array(z.string()).min(1, "At least one matrix is required"),
//     reportFrequency: z.string().min(1, "Report frequency is required"),
//     performanceTracking: z.boolean(),
//     status: z.string().min(1, "Status is required"),
//   })
// },
