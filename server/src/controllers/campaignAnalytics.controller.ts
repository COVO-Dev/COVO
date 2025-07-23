// campaignAnalytics.controller.ts
import { Request, Response } from 'express';
import { generateCampaignAnalytics } from '../services/campaignAnalytics.service';
import { sendJsonResponse, asyncHandler } from '../middleware/helper';

export const getCampaignAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { campaignId } = req.params;
    const analytics = await generateCampaignAnalytics(campaignId);
    sendJsonResponse(res, 200, "Campaign analytics retrieved successfully", analytics);
});