import axios from "axios";
import { Influencer } from "../../models/influencers.models";
import { Facebook } from "../../models/facebook.model";
import { validateFacebookAccessToken } from "./authFacebook.service";
import get from "lodash/get";


interface BasicPageInfo {
  pageName: string;
  followers: number;
  about: string;
  category: string;
  profilePicture: string;
  city?: string;
  country?: string;
  website?: string;
  phone?: string;
  emails?: string[];
}

interface PageInsights {
  engagedUsers: number;
  postEngagements: number;
  impressions: number;
  reach: number;
  engagementRate: number;
}

interface PostData {
  postId: string;
  message: string;
  createdAt: string;
  shares: number;
  likes: number;
  comments: number;
  totalReactions: number;
  impressions: number;
  engagement: number;
  engagementRate: number;
  mediaType: string;
  postDate: Date;
}

interface EngagementByTime {
  day: string;
  hour: number;
  posts: number;
  totalEngagement: number;
}

interface PeakEngagement {
  day: string;
  hour: number;
  engagement: number;
}

const FACEBOOK_GRAPH_URL = "https://graph.facebook.com/v22.0";

const initializeFacebookApi = (accessToken: string) => {
  return axios.create({
    baseURL: FACEBOOK_GRAPH_URL,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

const getBasicPageInfo = async (facebookApi, pageId: string): Promise<BasicPageInfo> => {
  try {
    const response = await facebookApi.get(`/${pageId}`, {
      params: {
        fields: "name,followers_count,about,category,picture,fan_count,location,website,phone,emails"
      }
    });

    return {
      pageName: response.data.name || "",
      followers: response.data.followers_count || response.data.fan_count || 0,
      about: response.data.about || "",
      category: response.data.category || "",
      profilePicture: response.data.picture?.data?.url || "",
      city: response.data.location?.city || "",
      country: response.data.location?.country || "",
      website: response.data.website || "",
      phone: response.data.phone || "",
      emails: response.data.emails || []
    };
  } catch (error) {
    console.error("Error fetching basic page info:", error.response?.data || error);
    return {
      pageName: "",
      followers: 0,
      about: "",
      category: "",
      profilePicture: "",
      city: "",
      country: "",
      website: "",
      phone: "",
      emails: []
    };
  }
};

const getPageInsights = async (facebookApi, pageId: string): Promise<PageInsights> => {
  try {
    // Get 28-day page engagement metrics
    const response = await facebookApi.get(`/${pageId}/insights`, {
      params: {
        metric: "page_engaged_users,page_post_engagements,page_impressions,page_impressions_unique,page_consumptions,page_content_activity",
        period: "days_28"
      }
    });

    const insights: PageInsights = {
      engagedUsers: 0,
      postEngagements: 0,
      impressions: 0,
      reach: 0,
      engagementRate: 0
    };
    
    if (response.data && response.data.data) {
      response.data.data.forEach(metric => {
        if (metric.name === "page_engaged_users") {
          insights.engagedUsers = metric.values[0]?.value || 0;
        } else if (metric.name === "page_post_engagements") {
          insights.postEngagements = metric.values[0]?.value || 0;
        } else if (metric.name === "page_impressions") {
          insights.impressions = metric.values[0]?.value || 0;
        } else if (metric.name === "page_impressions_unique") {
          insights.reach = metric.values[0]?.value || 0;
        }
      });
    }

    // Calculate engagement rate if we have both impressions and engagements
    if (insights.postEngagements && insights.impressions) {
      insights.engagementRate = (insights.postEngagements / insights.impressions) * 100;
    }

    return insights;
  } catch (error) {
    console.error("Error fetching page insights:", error.response?.data || error);
    return {
      engagedUsers: 0,
      postEngagements: 0,
      impressions: 0,
      reach: 0,
      engagementRate: 0
    };
  }
};

const getDetailedPostData = async (facebookApi, pageId: string): Promise<PostData[]> => {
  try {
    // Get more detailed post data (up to 25 posts)
    const response = await facebookApi.get(`/${pageId}/posts`, {
      params: {
        fields: "id,message,created_time,shares.summary(true),likes.summary(true),comments.summary(true),reactions.summary(true).limit(0).as(total_reactions),attachments{type},insights.metric(post_impressions,post_engaged_users).period(lifetime)",
        limit: 25,
      },
    });

    return response.data.data.map((post) => {
      // Find post impressions if available
      let impressions = 0;
      let engaged_users = 0;
      
      if (post.insights && post.insights.data) {
        post.insights.data.forEach(insight => {
          if (insight.name === "post_impressions") {
            impressions = insight.values[0]?.value || 0;
          }
          if (insight.name === "post_engaged_users") {
            engaged_users = insight.values[0]?.value || 0;
          }
        });
      }

      // Calculate engagement rate for this post
      const engagement = (post.likes?.summary?.total_count || 0) + 
                        (post.comments?.summary?.total_count || 0) + 
                        (post.shares?.summary?.total_count || 0);
      
      const mediaType = post.attachments?.data?.[0]?.type || "status";
      const postDate = new Date(post.created_time);

      return {
        postId: post.id,
        message: post.message || "No text content",
        createdAt: post.created_time,
        shares: post.shares?.summary?.total_count || 0,
        likes: post.likes?.summary?.total_count || 0,
        comments: post.comments?.summary?.total_count || 0,
        totalReactions: post.total_reactions?.summary?.total_count || 0,
        impressions: impressions,
        engagement: engaged_users || engagement,
        engagementRate: impressions > 0 ? (engagement / impressions) * 100 : 0,
        mediaType: mediaType,
        postDate: postDate
      };
    });
  } catch (error) {
    console.error("Error fetching detailed post data:", error.response?.data || error);
    return [];
  }
};

export const updateFacebookMetrics = async (influencerId: string) => {
  try {
    const accessToken = await validateFacebookAccessToken(influencerId);
    if (!accessToken) throw new Error("No valid Facebook access token");

    const influencer = await Facebook.findOne({ influencerId });
    if (!influencer || !influencer.facebookId) throw new Error(`No Facebook data found for influencer: ${influencerId}`);

    const pageId = influencer.facebookId;
    const facebookApi = initializeFacebookApi(accessToken);

    const [basicInfo, pageInsights, detailedPosts] = await Promise.all([
      getBasicPageInfo(facebookApi, pageId),
      getPageInsights(facebookApi, pageId),
      getDetailedPostData(facebookApi, pageId)
    ]);

    // Calculate averages across posts
    const totalLikes = detailedPosts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = detailedPosts.reduce((sum, post) => sum + post.comments, 0);
    const totalShares = detailedPosts.reduce((sum, post) => sum + post.shares, 0);

    // Calculate peak engagement times based on posts
    const engagementByDayHour: Record<string, EngagementByTime> = {};
    
    detailedPosts.forEach(post => {
      if (post.postDate) {
        const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][post.postDate.getDay()];
        const hour = post.postDate.getHours();
        const key = `${day}-${hour}`;
        
        if (!engagementByDayHour[key]) {
          engagementByDayHour[key] = { 
            day, 
            hour, 
            posts: 0, 
            totalEngagement: 0 
          };
        }
        
        engagementByDayHour[key].posts += 1;
        engagementByDayHour[key].totalEngagement += post.engagement;
      }
    });
    
    // Convert to array and sort by average engagement
    const peakEngagement: PeakEngagement[] = Object.values(engagementByDayHour)
      .map(item => ({
        day: item.day,
        hour: item.hour,
        engagement: item.totalEngagement / item.posts
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5); // Keep top 5 peak times

    // Map detailed posts to the schema format
    const postPerformance = detailedPosts.map(post => ({
      postId: post.postId,
      message: post.message,
      mediaType: post.mediaType,
      impressions: post.impressions,
      engagement: post.engagement,
      reactions: {
        like: post.likes || 0,
        // love: 0,
        // wow: 0,
        // haha: 0,
        // sad: 0,
        // angry: 0
      },
      shares: post.shares,
      comments: post.comments,
      postDate: post.postDate
    }));

    await updateMissingFields(influencerId, basicInfo);

    // Update the Facebook metrics in the database
    await Facebook.findOneAndUpdate(
      { influencerId },
      {
        $set: {
          "metrics.followers": basicInfo.followers,
          "metrics.impressions": pageInsights.impressions,
          "metrics.engagementRate": pageInsights.engagementRate,
          "metrics.likes": totalLikes / (detailedPosts.length || 1),
          "metrics.comments": totalComments / (detailedPosts.length || 1),
          "metrics.shares": totalShares / (detailedPosts.length || 1),
          "metrics.reach": pageInsights.reach,
          "metrics.lastUpdated": new Date(),
          postPerformance: postPerformance,
          peakEngagement: peakEngagement,
        },
      },
      { new: true }
    );

    return { 
      basicInfo, 
      pageInsights,
      posts: detailedPosts,
      totalPosts: detailedPosts.length,
      peakEngagement
    };
  } catch (error) {
    console.error(
      "Error updating Facebook metrics:",
      error.response?.data || error
    );
    throw error;
  }
};

const updateMissingFields = async (influencerId: string, basicInfo: BasicPageInfo) => {
  const influencer = await Influencer.findById(influencerId);
  if (!influencer) throw new Error("Influencer not found");

  const updates = Object.fromEntries(
    Object.entries({
      profilePicture: basicInfo.profilePicture,
      PersonalBio: basicInfo.about,
      username: basicInfo.pageName,
      followers: basicInfo.followers,
      "location.city": basicInfo.city,
      "location.country": basicInfo.country,
      "contentAndAudience.primaryNiche": basicInfo.category,
      website: basicInfo.website,
      phone: basicInfo.phone
    }).filter(([key, value]) => value && !get(influencer, key))
  );

  if (Object.keys(updates).length > 0) {
    await Influencer.findByIdAndUpdate(influencerId, { $set: updates });
  }
};