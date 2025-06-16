import axios from 'axios';
import { validateTwitterAccessToken } from './authTwitter.service';
import { Twitter } from '../models/twitter.model';
import { Influencer } from '../models/influencers.models';
import ISO6391 from 'iso-639-1';
import get from 'lodash/get';

const getLanguageName = (code: string) => ISO6391.getName(code) || "Unknown";

const initializeTwitterApi = (accessToken: string) => {
  return {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    baseURL: 'https://api.twitter.com/2'
  };
};

const getEngagementMetrics = async (api: any, userId: string, userData: any) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const response = await axios.get(
      `${api.baseURL}/users/${userId}/tweets`, {
      headers: api.headers,
      params: {
        max_results: 100,
        'tweet.fields': 'public_metrics,created_at',
        start_time: oneMonthAgo.toISOString(),
        end_time: new Date().toISOString()
      }
    });

    const tweets = response.data.data || [];
    return {
      engagementRate: calculateEngagementRate(tweets, userData.public_metrics.followers_count),
      tweetMetrics: calculateTweetMetrics(tweets),
      peakEngagement: calculatePeakEngagementTimes(tweets),
      tweets
    };
  } catch (error) {
    console.error('Error in getEngagementMetrics:', error.response?.data || error);
    throw error;
  }
};

export const updateTwitterMetrics = async (influencerId: string) => {
  try {

    const accessToken = await validateTwitterAccessToken(influencerId);
    if (!accessToken) {
      throw new Error('No valid access token found');
    }

    const api = initializeTwitterApi(accessToken);

    const userResponse = await axios.get(`${api.baseURL}/users/me`, {
      headers: api.headers,
      params: {
        'user.fields': 'public_metrics,description,location,profile_image_url,username'
      }
    });

    const userData = userResponse.data.data;
    const userId = userData.id;

    const [
      engagementMetrics,
      demographics,
      topTweets,
      interests,
      mentionsData
    ] = await Promise.all([
      getEngagementMetrics(api, userId, userData),
      getDemographics(api, userId),
      getTopTweets(api, userId),
      getInterests(api, userId),
      getMentionsAndInteractions(api, userId)
    ]);

    await updateMissingFields(influencerId, userData);
    
    await Twitter.findByIdAndUpdate(influencerId, {
      $set: {
        "metrics.followers": userData.public_metrics.followers_count,
        "metrics.impressions": userData.public_metrics.tweet_count,
        "metrics.engagementRate": engagementMetrics.engagementRate,
        "metrics.likes": engagementMetrics.tweetMetrics.likes,
        "metrics.retweets": engagementMetrics.tweetMetrics.retweets,
        "metrics.replies": engagementMetrics.tweetMetrics.replies,
        "metrics.followerGrowth": [
          { date: new Date(), count: userData.public_metrics.followers_count }
        ],
        "metrics.lastUpdated": new Date(),
        interests: interests,
        peakEngagement: engagementMetrics.peakEngagement,
        topTweets: topTweets.map(tweet => ({
          content: tweet.text,
          likes: tweet.public_metrics.like_count,
          retweets: tweet.public_metrics.retweet_count,
          replies: tweet.public_metrics.reply_count,
          views: tweet.public_metrics.view_count,
          postDate: tweet.created_at
        })),
        lastConnected: new Date(),
        connected: true,
        mentionsAndInteractions: mentionsData
      }
    });

    return {
      userData,
      engagementMetrics,
      demographics,
      topTweets,
      interests,
      mentionsData
    };
  } catch (error) {
    console.error('Error updating Twitter metrics:', error.response?.data || error);
    throw error;
  }
};


const updateMissingFields = async (influencerId: string, userData) => {
  const influencer = await Influencer.findById(influencerId);
  if (!influencer) throw new Error("Influencer not found");

  const updates = Object.fromEntries(
    Object.entries({
      profilePicture: userData.profile_image_url,
      PersonalBio: userData.description,
      location: userData.location,
      username: userData.username
    }).filter(([key, value]) => value && !get(influencer, key))
  );

  if (Object.keys(updates).length > 0) {
    await Influencer.findByIdAndUpdate(influencerId, { $set: updates });
  }
};

const estimateTimezone = (hour: number) => {
  if (hour >= 0 && hour < 6) return "UTC+8 to UTC+12 (Asia-Pacific)";
  if (hour >= 6 && hour < 12) return "UTC-1 to UTC+3 (Europe/Africa)";
  if (hour >= 12 && hour < 18) return "UTC-5 to UTC-8 (North America)";
  return "UTC-3 to UTC-5 (South America)";
};

const getDemographics = async (
  api: any, 
  userId: string, 
  maxFollowers: number = 1000, 
  maxTweets: number = 100
): Promise<any> => {
  try {
    const followersResponse = await axios.get(
      `${api.baseURL}/users/${userId}/followers`,
      {
        headers: api.headers,
        params: {
          max_results: maxFollowers,
          "user.fields": "location,created_at"
        }
      }
    );
    const followers = followersResponse.data.data || [];
    
    const locations = new Map<string, number>();
    followers.forEach(follower => {
      if (follower.location) {
        const normalizedLocation = follower.location.trim().toLowerCase();
        locations.set(
          normalizedLocation,
          (locations.get(normalizedLocation) || 0) + 1
        );
      }
    });

    const tweetsResponse = await axios.get(
      `${api.baseURL}/users/${userId}/tweets`,
      {
        headers: api.headers,
        params: {
          "tweet.fields": "lang,created_at",
          max_results: maxTweets
        }
      }
    );
    const tweets = tweetsResponse.data.data || [];

    const languageCount = new Map<string, number>();
    tweets.forEach(tweet => {
      if (tweet.lang) {
        languageCount.set(
          tweet.lang,
          (languageCount.get(tweet.lang) || 0) + 1
        );
      }
    });

    // Determine most common language
    const mostCommonLanguage = tweets.length > 0 
      ? getLanguageName([...languageCount.entries()].reduce(
          (max, entry) => (entry[1] > max[1] ? entry : max),
          ["unknown", 0]
        )[0])
      : "unknown";

    // Estimate timezone from tweet timestamps
    const timezones = new Map<number, number>();
    tweets.forEach(tweet => {
      const hourUTC = new Date(tweet.created_at).getUTCHours();
      timezones.set(hourUTC, (timezones.get(hourUTC) || 0) + 1);
    });

    // Most active posting hour in UTC
    const mostActiveHourUTC = tweets.length > 0
      ? [...timezones.entries()].reduce(
          (max, entry) => (entry[1] > max[1] ? entry : max),
          [0, 0]
        )[0]
      : 0;

    const estimatedTimezone = estimateTimezone(mostActiveHourUTC);

    return {
      location: Object.fromEntries(locations), // Most common locations of followers
      language: mostCommonLanguage, // User's most used language
      timezone: `UTC${mostActiveHourUTC >= 12 ? "+" : "-"}${Math.abs(12 - mostActiveHourUTC)}` // Estimated timezone
    };
  } catch (error) {
    console.error("Error fetching demographics:", error);
    return {};
  }
};

const getTopTweets = async (api: any, userId: string) => {
  try {
    const response = await axios.get(
      `${api.baseURL}/users/${userId}/tweets`, {
      headers: api.headers,
      params: {
        max_results: 100,
        'tweet.fields': 'public_metrics,created_at',
        exclude: 'retweets,replies'
      }
    });

    const tweets = response.data.data || [];
    return tweets
      .sort((a, b) =>
        (b.public_metrics.like_count + b.public_metrics.retweet_count) -
        (a.public_metrics.like_count + a.public_metrics.retweet_count)
      )
      .slice(0, 10);
  } catch (error) {
    console.error('Error in getTopTweets:', error);
    return [];
  }
};

const getInterests = async (api: any, userId: string) => {
  try {
    const response = await axios.get(
      `${api.baseURL}/users/${userId}/tweets`, {
      headers: api.headers,
      params: {
        max_results: 100,
        'tweet.fields': 'context_annotations,entities'
      }
    });

    const tweets: { context_annotations?: { domain?: { name: string } }[] }[] = response.data.data || [];

    const topics = tweets
      .flatMap(tweet => tweet.context_annotations || [])
      .map(context => context.domain?.name)
      .filter(Boolean)
      .reduce((acc, topic) => {
        acc.set(topic, (acc.get(topic) || 0) + 1);
        return acc;
      }, new Map<string, number>());

    return Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic)
      .slice(0, 5);
  } catch (error) {
    console.error('Error in getInterests:', error);
    return [];
  }
};

const getMentionsAndInteractions = async (api: any, userId: string) => {
  try {
    const response = await axios.get(
      `${api.baseURL}/users/${userId}/mentions`, {
      headers: api.headers,
      params: {
        max_results: 100,
        'tweet.fields': 'author_id,created_at,public_metrics',
        'user.fields': 'username'
      }
    });

    const mentions = response.data.data || [];

    const tweetsResponse = await axios.get(
      `${api.baseURL}/users/${userId}/tweets`, {
      headers: api.headers,
      params: {
        max_results: 100,
        'tweet.fields': 'in_reply_to_user_id,referenced_tweets,author_id,created_at,public_metrics'
      }
    });

    const tweets = tweetsResponse.data.data || [];

    const repliesAndQuotes = tweets.filter(tweet =>
      tweet.in_reply_to_user_id ||
      (tweet.referenced_tweets || []).some(ref => ref.type === 'quoted')
    );

    return processMentionsAndInteractions([...mentions, ...repliesAndQuotes]);

  } catch (error) {
    console.error('Error in getMentionsAndInteractions:', error);
    return [];
  }
};

const calculateEngagementRate = (tweets, followers) => {
  const totalEngagements = tweets.reduce((sum, tweet) => {
    const metrics = tweet.public_metrics;
    return sum + (metrics.like_count || 0) +
      (metrics.retweet_count || 0) +
      (metrics.reply_count || 0);
  }, 0);

  return followers > 0 ? (totalEngagements / followers) * 100 : 0;
};

const calculateTweetMetrics = (tweets: any[]) => {
  const metrics = tweets.reduce((acc, tweet) => {
    const tweetMetrics = tweet.public_metrics;
    return {
      likes: acc.likes + (tweetMetrics.like_count || 0),
      retweets: acc.retweets + (tweetMetrics.retweet_count || 0),
      replies: acc.replies + (tweetMetrics.reply_count || 0),
      quotes: acc.quotes + (tweetMetrics.quote_count || 0)
    };
  }, { likes: 0, retweets: 0, replies: 0, quotes: 0 });

  const sortedTweets = [...tweets].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const firstWeek = sortedTweets.slice(0, 7);
  const lastWeek = sortedTweets.slice(-7);

  const firstWeekEngagement = calculateEngagementRate(firstWeek, metrics.followers);
  const lastWeekEngagement = calculateEngagementRate(lastWeek, metrics.followers);

  return {
    ...metrics,
    growth: lastWeekEngagement - firstWeekEngagement
  };
};

const processMentionsAndInteractions = (mentions: any[]) => {
  const interactions = new Map();

  mentions.forEach(mention => {
    const authorId = mention.author_id;
    if (!interactions.has(authorId)) {
      interactions.set(authorId, {
        count: 0,
        lastInteraction: mention.created_at,
        engagement: 0
      });
    }

    const interaction = interactions.get(authorId);
    interaction.count++;
    interaction.engagement +=
      mention.public_metrics.like_count +
      mention.public_metrics.retweet_count;
  });

  return Array.from(interactions.entries()).map(([authorId, data]) => ({
    authorId,
    ...data
  }));
};

const calculatePeakEngagementTimes = (tweets: any[]) => {
  const engagementByHour = new Array(24).fill(0);

  tweets.forEach(tweet => {
    const hour = new Date(tweet.created_at).getHours();
    const metrics = tweet.public_metrics;

    engagementByHour[hour] += (metrics.like_count || 0) +
      (metrics.retweet_count || 0) +
      (metrics.reply_count || 0);
  });

  return engagementByHour
    .map((engagement, hour) => ({ hour, engagement }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 3);
};
