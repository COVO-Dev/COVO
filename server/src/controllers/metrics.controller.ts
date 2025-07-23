import { Request, Response } from 'express';
import { saveMetricsToCampaignPerformance } from '../services/metrics.service';
import { sendJsonResponse, asyncHandler } from '../middleware/helper';
import { CampaignPerformances } from '../models/campaignAnalytics.models';
import { Parser } from 'json2csv';

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


export const downloadReferralReport = asyncHandler(async (req: Request, res: Response) => {
    const { campaignId } = req.params;

    const records = await CampaignPerformances.find({ campaign: campaignId })
        .populate('influencerId', 'firstName lastName')
        .lean();

    const data = records.map((record) => {
        const influencer = record.influencerId as unknown as { firstName: string; lastName: string };

        return {
            firstName: influencer?.firstName || '',
            lastName: influencer?.lastName || '',
            platform: record.platform,
            postUrl: record.postUrl,
            views: record.metrics?.views || 0,
            likes: record.metrics?.likes || 0,
            comments: record.metrics?.comments || 0,
            shares: record.metrics?.shares || 0,
            impressions: record.metrics?.impressions || 0,
            engagement: record.metrics?.engagement || 0,
            startFollowers: record.startFollowers,
            endFollowers: record.endFollowers,
            conversions: record.conversions,
            contentQualityScore: record.contentQualityScore,
            submittedAt: record.submittedAt,
        };
    });

    const fields = [
        'firstName',
        'lastName',
        'platform',
        'postUrl',
        'views',
        'likes',
        'comments',
        'shares',
        'impressions',
        'engagement',
        'startFollowers',
        'endFollowers',
        'conversions',
        'contentQualityScore',
        'submittedAt',
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`referral_report_${campaignId}.csv`);
    return res.send(csv);
});
