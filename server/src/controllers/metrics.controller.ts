import { Request, Response } from 'express';
import { saveMetricsToCampaignPerformance } from '../services/metrics.service';
import { sendJsonResponse, asyncHandler } from '../middleware/helper';
import { CampaignPerformances } from '../models/campaignAnalytics.models';

export const extractMetrics = asyncHandler(async (req: Request, res: Response) => {
    const { url, campaignId, influencerId, startFollowers, endFollowers } = req.body;

    if (!url || !campaignId || !influencerId) {
        return res.status(400).json({ error: 'Missing required fields: url, campaignId, influencerId' });
    }

    const result = await saveMetricsToCampaignPerformance({
        url,
        campaignId,
        influencerId,
        startFollowers,
        endFollowers,
    });

    sendJsonResponse(res, 200, 'Metrics extracted and saved successfully', result);
});


