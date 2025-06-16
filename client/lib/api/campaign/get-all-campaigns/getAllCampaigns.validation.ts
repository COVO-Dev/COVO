
import { z } from "zod";

export const getAllCampaignsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type IAllCampaigns = z.infer<typeof getAllCampaignsSchema>;
