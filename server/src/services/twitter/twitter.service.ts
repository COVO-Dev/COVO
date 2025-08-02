import axios from 'axios';
import cheerio from 'cheerio';
import { Twitter } from '../../models/twitter.model';
import { extractNumberFromText, getTextContaining, extractTweetId } from '../../utils/platform.util';

export const getTwitterMetrics = async (url: string) => {
    const tweetId = extractTweetId(url);
    if (!tweetId) throw new Error('Invalid Twitter URL');

    try {
        const twitterAuth = await Twitter.findOne({ connected: true }).sort({ lastConnected: -1 });
        const token = twitterAuth?.accessToken;
        if (!token) throw new Error('Twitter access token not found');

        const response = await axios.get(`https://api.twitter.com/2/tweets/${tweetId}`, {
            params: {
                'tweet.fields': 'public_metrics,created_at',
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const tweet = response.data?.data;
        if (!tweet || !tweet.public_metrics) throw new Error('Tweet data missing');

        const metrics = tweet.public_metrics;

        const likes = metrics.like_count || 0;
        const comments = metrics.reply_count || 0;
        const shares = metrics.retweet_count || 0;
        const views = metrics.view_count || 0;
        const engagement = likes + comments + shares;

        return {
            platform: 'twitter',
            postId: tweetId,
            metrics: {
                impressions: views, // Twitter treats views as impressions
                engagement,
                likes,
                comments,
                shares,
                views,
            },
        };
    } catch (err) {
        console.warn('⚠️ Twitter API failed, attempting scraping fallback:', err.message);

        // 🔁 Scraping fallback
        try {
            const { data: html } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                },
            });

            const $ = cheerio.load(html);
            const rawHTML = $.html();

            const likes = extractNumberFromText(getTextContaining(rawHTML, 'Like'));
            const shares = extractNumberFromText(getTextContaining(rawHTML, 'Retweet'));
            const comments = extractNumberFromText(getTextContaining(rawHTML, 'Reply'));
            const engagement = likes + shares + comments;

            return {
                platform: 'twitter',
                postId: tweetId,
                metrics: {
                    impressions: 0,
                    engagement,
                    likes,
                    comments,
                    shares,
                    views: 0,
                },
                note: '⚠️ Scraped fallback data. Impressions and views not available — may be incomplete or inaccurate.',
            };
        } catch (scrapeErr) {
            console.error('❌ Twitter scraping failed:', scrapeErr.message);
            throw new Error('Twitter scraping failed');
        }
    }
};
