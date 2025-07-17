import axios from 'axios';
import { load } from 'cheerio';
import { extractYouTubeVideoId } from '../../utils/platform.util';
import { Youtube } from '../../models/youtube.model';

export const getYouTubeMetrics = async (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    try {
        // 1. Use stored access token for YouTube API (if authenticated)
        const youtubeAuth = await Youtube.findOne({ 'videoPerformance.videoId': videoId });
        const accessToken = youtubeAuth?.accessToken;

        if (accessToken) {
            const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/videos`,
                {
                    params: {
                        part: 'statistics',
                        id: videoId,
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const stats = response.data.items?.[0]?.statistics;

            if (stats) {
                return {
                    platform: 'youtube',
                    postId: videoId,
                    metrics: {
                        views: Number(stats.viewCount),
                        likes: Number(stats.likeCount || 0),
                        comments: Number(stats.commentCount || 0),
                    },
                };
            }
        }

        throw new Error('API fallback triggered');
    } catch (err) {
        return await scrapeYouTubeMetrics(url, videoId);
    }
};

const extractNumberFromText = (text: string): number => {
    const match = text.replace(/,/g, '').match(/(\d+(\.\d+)?)([KM]?)\b/i);
    if (!match) return 0;
    const [, num, , suffix] = match;
    const value = parseFloat(num);
    switch (suffix?.toUpperCase()) {
        case 'K': return Math.round(value * 1_000);
        case 'M': return Math.round(value * 1_000_000);
        default: return Math.round(value);
    }
};

const scrapeYouTubeMetrics = async (url: string, videoId: string) => {
    try {
        const { data: html } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
        });

        const $ = load(html);
        const rawHTML = $.html();

        const getMetaValue = (prop: string) =>
            $(`meta[itemprop="${prop}"]`).attr('content') || '0';

        const views = extractNumberFromText(getMetaValue('interactionCount'));
        const likes = extractNumberFromText(getMetaValue('likeCount') || '0');
        const comments = extractNumberFromText(getMetaValue('commentCount') || '0');


        return {
            platform: 'youtube',
            postId: videoId,
            metrics: {
                views,
                likes: likes || 'N/A',
                comments: comments || 'N/A',
            },
            note: '⚠️ Scraped fallback, may be less accurate.',
        };
    } catch (err) {
        throw new Error('YouTube scraping failed');
    }
};
