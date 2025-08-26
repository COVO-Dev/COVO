import { z } from "zod";

const collaborationPreferencesSchema = z.object({
  hasWorkedWithInfluencers: z.boolean(),
  exclusiveCollaborations: z.boolean(),
  type: z.string().min(1, "Collaboration type is required"),
  styles: z.array(z.string()).min(1, "At least one character for style").min(1, "At least one style"),
});

const trackingAndAnalyticsSchema = z.object({
  // metrics: z.array(z.string()).min(1, "At least one character for a metric is required").min(1, "At least one metric is required"),
  reportFrequency: z.string().min(1, "Report frequency is required"),
  performanceTracking: z.boolean(),
})

// export const campaignSchema = z.object({
//   // step 1
//   title: z.string().min(1, "Title is required"),
//   startDate: z.string(),
//   endDate: z.string(),
//   budgetRange: z.string(),
//   targetAudience: z.string().min(1, "Target audience is required"),

//   // step 2
//   primaryGoals: z.array(z.string()).min(1, "At least one character for goal").min(1, "At least one Goal"),
//   influencerType: z.string().min(1, "Influencer type is required"),
//   geographicFocus: z.string().min(1, "Geographic focus is required"),
//   collaborationPreferences: collaborationPreferencesSchema,

//   // step 3
//   trackingAndAnalytics: trackingAndAnalyticsSchema,
//   status: z.string().min(1, "Status is required"),
// });


export const campaignSchema = z.object({
  // step 1
  title: z.string().min(1, "Title is required"),
  startDate: z.date(),
  endDate: z.date().min(new Date()),
  budgetRange: z.number().min(1, "Budget range must be a positive number").max(1000000, "Budget range must be less than 1,000,000"),
  targetAudience: z.string().min(1, "Target audience is required"),

  // step 2
  primaryGoals: z.array(z.string()).min(1, "Goal should have at least one character").min(1, "Make sure to add at least one goal and press enter"),
  influencerType: z.string().min(1, "Influencer type is required"),
  geographicFocus: z.string().min(1, "Geographic focus is required"),
  collaborationPreferences: collaborationPreferencesSchema,

  // step 3
  trackingAndAnalytics: trackingAndAnalyticsSchema,
  status: z.string().min(1, "Status is required"),
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