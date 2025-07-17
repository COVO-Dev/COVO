import axios from 'axios';
import cheerio from 'cheerio';
import { Facebook } from '../../models/facebook.model';
import { extractNumberFromText, getTextContaining, extractFacebookVideoId } from '../../utils/platform.util';


export const getFacebookMetrics = async (url: string) => {
    const postId = extractFacebookVideoId(url);
    if (!postId) throw new Error('Invalid Facebook post URL');

    const facebookAuth = await Facebook.findOne({ connected: true }).sort({ lastConnected: -1 });
    const pageAccessToken = facebookAuth?.pageAccessToken;
    try {
        if (!pageAccessToken) throw new Error('Missing Facebook Page Access Token');

        const response = await axios.get(`https://graph.facebook.com/v19.0/${postId}/insights`, {
            headers: {
                Authorization: `Bearer ${pageAccessToken}`,
            },
            params: {
                metric: 'post_impressions,post_engaged_users,post_reactions_by_type_total,post_comments,post_shares',
            },
        });

        const metrics = response.data?.data;
        const result: Record<string, number> = {};

        metrics.forEach((m: any) => {
            result[m.name] = m.values?.[0]?.value || 0;
        });

        return {
            platform: 'facebook',
            postId,
            metrics: {
                impressions: result['post_impressions'],
                engagement: result['post_engaged_users'],
                likes: result['post_reactions_by_type_total'] || 0,
                comments: result['post_comments'],
                shares: result['post_shares'],
                views: result['post_views']
            },
        };
    } catch (err) {
        console.warn('Facebook API failed, falling back to scraping:', err.message);

        try {
            const { data: html } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                },
            });

            const $ = cheerio.load(html);
            const rawHTML = $.html();

            const views = extractNumberFromText(getTextContaining(rawHTML, 'Views'));
            const likes = extractNumberFromText(getTextContaining(rawHTML, 'Like'));
            const comments = extractNumberFromText(getTextContaining(rawHTML, 'Comment'));
            const shares = extractNumberFromText(getTextContaining(rawHTML, 'Share'));
            const impressions = extractNumberFromText(getTextContaining(rawHTML, 'Impressions'));

            return {
                platform: 'facebook',
                postId,
                metrics: {
                    impressions,
                    engagement: views || 0,
                    likes,
                    comments,
                    shares,
                    note: `Scraped fallback data. data may not be incomplete or accurate. Consider using the Facebook API for more reliable metrics.`,
                },
            };
        } catch {
            throw new Error('Facebook scraping failed');
        }
    }
};
