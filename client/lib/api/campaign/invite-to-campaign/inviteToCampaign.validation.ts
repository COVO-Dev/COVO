import { z } from "zod";

export const inviteToCampaignSchema = z.object({
  message: z.string().optional(),
});

export type IInviteToCampaign = z.infer<typeof inviteToCampaignSchema>;
