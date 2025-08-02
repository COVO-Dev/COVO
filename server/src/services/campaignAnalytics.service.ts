import { CampaignPerformances } from '../models/campaignAnalytics.models';
import { CovoSurvey } from '../models/covoSurverSchema.model';

export const generateCampaignAnalytics = async (campaignId: string) => {

    try {
        const performances = await CampaignPerformances.find({ campaignId });

        const totalMetrics = {
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            impressions: 0,
            engagement: 0,
            conversions: 0,
            contentQualityScore: 0,
            startFollowers: 0,
            endFollowers: 0,
        };

        performances.forEach((perf) => {
            const m = perf.metrics || {};
            totalMetrics.views += m.views || 0;
            totalMetrics.likes += m.likes || 0;
            totalMetrics.comments += m.comments || 0;
            totalMetrics.shares += m.shares || 0;
            totalMetrics.impressions += m.impressions || 0;
            totalMetrics.engagement += m.engagement || 0;
            totalMetrics.conversions += perf.conversions || 0;
            totalMetrics.contentQualityScore += perf.contentQualityScore || 0;
            totalMetrics.startFollowers += perf.startFollowers || 0;
            totalMetrics.endFollowers += perf.endFollowers || 0;
        });

        const count = performances.length;
        return {
            ...totalMetrics,
            avgEngagementRate: totalMetrics.engagement / (totalMetrics.impressions || 1),
            avgContentQualityScore: totalMetrics.contentQualityScore / (count || 1),
            avgFollowerGrowth: (totalMetrics.endFollowers - totalMetrics.startFollowers) / (count || 1),
            influencerCount: count,
        };
    } catch (error) {
        console.error('Error generating campaign analytics:', error);
        throw new Error('Failed to generate campaign analytics');
    }
};

export const calculateContentQualityScore = async (influencerId: string, campaignId: string) => {
    const result = await CovoSurvey.aggregate([
        { $match: { influencerId, campaignId } },
        { $group: { _id: null, avg: { $avg: "$deliveryConsistency" } } }
    ]);

    const avgScore = result[0]?.avg || 0;

    await CampaignPerformances.findOneAndUpdate(
        { influencer: influencerId, campaign: campaignId },
        { contentQualityScore: avgScore }
    );
};

