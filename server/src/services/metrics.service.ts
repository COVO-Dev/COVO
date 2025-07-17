import { detectPlatform } from '../utils/platform.util';
import { getYouTubeMetrics } from './youtube/youtube.service';
import { getInstagramMetrics } from './instagram/instagram.service';
import { getTwitterMetrics } from './twitter/twitter.service';
import { getFacebookMetrics } from './facebook/facebook.service';

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
                        views: fbResult.metrics.impressions ?? 'N/A',
                        likes: fbResult.metrics.likes ?? 'N/A',
                        comments: fbResult.metrics.comments ?? 'N/A',
                        shares: fbResult.metrics.shares ?? 'N/A',
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
                views: 'N/A',
                likes: 'N/A',
            },
            note: `⚠️ Failed to fetch metrics: ${err.message || err}`,
        };
    }
};
