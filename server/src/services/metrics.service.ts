import { detectPlatform } from '../utils/platform.util';
import { getYouTubeMetrics } from './youtube/youtube.service';
import { getInstagramMetrics } from './instagram/instagram.service';
import { getTwitterMetrics } from './twitter/twitter.service';
import { getFacebookMetrics } from './facebook/facebook.service';
import { CampaignPerformances } from '../models/campaignAnalytics.models';

type MetricsResult = {
    platform: string;
    postId: string;
    metrics: {
        views: number | string;
        likes: number | string;
        comments?: number | string;
        shares?: number | string;
        replies?: number | string;
        retweets?: number | string;
        [key: string]: any;
    };
    note?: string;
};

export const getMetricsFromUrl = async (url: string): Promise<MetricsResult> => {
    const platform = detectPlatform(url);
    if (!platform) {
        throw new Error('Unsupported platform URL');
    }

    try {
        switch (platform) {
            case 'youtube':
                return await getYouTubeMetrics(url);

            case 'instagram':
                return await getInstagramMetrics(url);

            case 'twitter':
                return await getTwitterMetrics(url);

            case 'facebook': {
                const fbResult = await getFacebookMetrics(url);
                return {
                    ...fbResult,
                    metrics: {
                        views: fbResult.metrics.impressions ?? 0,
                        likes: fbResult.metrics.likes ?? 0,
                        comments: fbResult.metrics.comments ?? 0,
                        shares: fbResult.metrics.shares ?? 0,
                        ...fbResult.metrics,
                    },
                };
            }

            default:
                throw new Error('No handler for this platform yet');
        }
    } catch (err) {
        return {
            platform,
            postId: 'unknown',
            metrics: {
                views: 0,
                likes: 0,
            },
            note: `⚠️ Failed to fetch metrics: ${err.message || err}`,
        };
    }
};

export const saveMetricsToCampaignPerformance = async ({
    url,
    campaignId,
    influencerId,
    startFollowers,
    endFollowers,
}: {
    url: string;
    campaignId: string;
    influencerId: string;
    startFollowers?: number;
    endFollowers?: number;
}) => {
    const result = await getMetricsFromUrl(url);

    const existing = await CampaignPerformances.findOne({
        campaignId,
        influencerId,
        postId: result.postId,
    });

    if (existing) {
        existing.metrics = Object.fromEntries(
            Object.entries(result.metrics).map(([key, value]) => [
                key,
                typeof value === 'string' ? Number(value) : value,
            ])
        );
        existing.lastUpdated = new Date();
        existing.startFollowers = startFollowers ?? existing.startFollowers;
        existing.endFollowers = endFollowers ?? existing.endFollowers;
        await existing.save();
        return existing;
    } else {
        const newPerf = await CampaignPerformances.create({
            campaignId,
            influencerId,
            postUrl: url,
            platform: result.platform,
            postId: result.postId,
            metrics: result.metrics,
            submittedAt: new Date(),
        });
        return newPerf;
    }
};


