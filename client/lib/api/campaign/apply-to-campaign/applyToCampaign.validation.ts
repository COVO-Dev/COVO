import { z } from "zod";

export const applyToCampaignSchema = z.object({
	offer: z.number().min(0),
	message: z.string().min(1, "Please enter a message"),
});

export type IApplyToCampaign = z.infer<typeof applyToCampaignSchema>;
