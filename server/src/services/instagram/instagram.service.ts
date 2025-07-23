import axios from 'axios';
import cheerio from 'cheerio';
import { Instagram } from '../../models/instagram.model';

export const getInstagramMetrics = async (url: string) => {
    const postId = url.split('/').filter(Boolean).pop();
    if (!postId) throw new Error('Invalid Instagram URL');

    try {
        // STEP 1 — Try using API with stored page access token
        const igAuth = await Instagram.findOne({ 'topPosts.content': { $regex: postId, $options: 'i' } });
        const accessToken = igAuth?.pageAccessToken;

        if (accessToken) {
            const mediaIdRes = await axios.get(`https://graph.facebook.com/v19.0/ig_shortcode/${postId}?fields=id&access_token=${accessToken}`);
            const mediaId = mediaIdRes.data?.id;

            if (mediaId) {
                const metricsRes = await axios.get(`https://graph.facebook.com/v19.0/${mediaId}`, {
                    params: {
                        fields: [
                            'like_count',
                            'comments_count',
                            'video_views',
                            'impressions',
                            'engagement',
                            'shares_count' // this may not be available depending on post type
                        ].join(','),
                        access_token: accessToken,
                    },
                });

                const metrics = metricsRes.data;
                return {
                    platform: 'instagram',
                    postId,
                    metrics: {
                        impressions: metrics.impressions || 0,
                        engagement: metrics.engagement || 0,
                        likes: metrics.like_count || 0,
                        comments: metrics.comments_count || 0,
                        shares: metrics.shares_count || 0, // may be 0 or undefined
                        views: metrics.video_views || 0,
                    },
                };
            }
        }

        throw new Error('API fallback triggered');
    } catch (err) {
        // STEP 2 — Fallback scraping if API fails
        return await scrapeInstagramMetrics(url, postId);
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

const scrapeInstagramMetrics = async (url: string, postId: string) => {
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
        });

        const $ = cheerio.load(html);
        const scriptTag = $('script[type="application/ld+json"]').html();
        const json = scriptTag ? JSON.parse(scriptTag) : null;

        if (!json || !json.interactionStatistic) {
            throw new Error('Could not extract metrics');
        }

        const likes = extractNumberFromText(
            json.interactionStatistic.find((s: any) => s.interactionType.includes('Like'))?.userInteractionCount || '0'
        );

        const comments = extractNumberFromText(json.commentCount || '0');
        const views = extractNumberFromText(json.video?.interactionCount || '0');

        // Scraped data cannot provide impressions, engagement, or shares reliably
        return {
            platform: 'instagram',
            postId,
            metrics: {
                impressions: 0,
                engagement: 0,
                likes,
                comments,
                shares: 0,
                views,
            },
            note: '⚠️ Scraped fallback — limited data (impressions, engagement, shares not available).',
        };
    } catch (err) {
        throw new Error('Instagram scraping failed');
    }
};
