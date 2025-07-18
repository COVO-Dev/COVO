// services/twitter.service.ts
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

        return {
            platform: 'twitter',
            postId: tweetId,
            metrics: {
                views: metrics.view_count || 0,
                likes: metrics.like_count,
                retweets: metrics.retweet_count,
                replies: metrics.reply_count,
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
            const retweets = extractNumberFromText(getTextContaining(rawHTML, 'Retweet'));
            const replies = extractNumberFromText(getTextContaining(rawHTML, 'Reply'));

            return {
                platform: 'twitter',
                postId: tweetId,
                metrics: {
                    views: 0,
                    likes,
                    retweets,
                    replies,
                    note: `Scraped fallback data. data may not be incomplete or accurate. Consider using the Facebook API for more reliable metrics.`
                }
            }
        } catch (scrapeErr) {
            console.error('❌ Twitter scraping failed:', scrapeErr.message);
            throw new Error('Twitter scraping failed');
        }
    }
};