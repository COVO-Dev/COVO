import axios from 'axios';
import { Instagram } from '../../models/instagram.model';
import { Influencer } from '../../models/influencers.models';
import { validateInstagramAccessToken } from './authInstagram.service';
import { IInstagramMetrics } from '../../types';
import get from "lodash/get";

const initializeInstagramApi = (accessToken: string, pageAccessToken: string) => {
  return {
    baseUrl: 'https://graph.facebook.com/v22.0',
    accessToken,
    pageAccessToken
  };
};

export const updateInstagramMetrics = async (influencerId: string) => {
  try {
    const tokens = await validateInstagramAccessToken(influencerId);
    if (!tokens || !tokens.accessToken || !tokens.pageAccessToken) {
      throw new Error('No valid access token found');
    }

    const { accessToken, pageAccessToken } = tokens;
    const api = initializeInstagramApi(accessToken, pageAccessToken);

    const influencer = await Instagram.findOne({ influencerId });
    const instagramId = influencer?.instagramId;

    if (!instagramId) {
      throw new Error('Instagram ID not found');
    }

    try {
      const userResponse = await axios.get(`${api.baseUrl}/${instagramId}`, {
        params: {
          fields: 'id,username',
          access_token: pageAccessToken
        }
      });

      if (!userResponse.data || !userResponse.data.id) {
        throw new Error('Instagram account not accessible');
      }
    } catch (error) {
      console.error('Instagram account verification failed:', error.response?.data.error || error.response?.data || error.message || error);
      throw new Error('Failed to verify Instagram account access');
    }

    const [
      basicInfo,
      mediaInsights, 
      audienceInsights, 
      storyInsights,
      reelInsights,
      hashtagPerformance,
      topPostsData,
      peakEngagementData,
      contentPerformanceData,
      interestsData,
      mentionsData

    ] = await Promise.all([
      getBasicAccountInfo(api, instagramId),
      getMediaInsights(api, instagramId),
      getAudienceInsights(api, instagramId, pageAccessToken),
      getStoryInsights(api, instagramId),
      getReelInsights(api, instagramId),
      getHashtagPerformance(api, instagramId),
      getTopPosts(api, instagramId),
      getPeakEngagement(api, instagramId),
      getContentPerformance(api, instagramId),
      getAudienceInterests(api, instagramId, pageAccessToken),
      getMentionsAndInteractions(api, instagramId, accessToken)
   
    ]);

    await updateMissingFields(influencerId, basicInfo, interestsData);

    const followerGrowthData = calculateFollowerGrowth(influencer, basicInfo.followers);

    await Instagram.findOneAndUpdate(
      { influencerId },
      {
        $set: {
          "metrics.followers": basicInfo.followers,
          "metrics.followerGrowth": followerGrowthData,
          "metrics.lastUpdated": new Date(),
          "metrics.impressions": mediaInsights.impressions,
          "metrics.engagementRate": mediaInsights.engagementRate,
          "metrics.likes": mediaInsights.likes,
          "metrics.comments": mediaInsights.comments,
          "metrics.shares": mediaInsights.shares,
          "metrics.views": mediaInsights.views,
          "metrics.saves": mediaInsights.saves,
          "connected": true,
          "lastConnected": new Date(),

          "demographics.audience.age": audienceInsights.age,
          "demographics.audience.genderStats": audienceInsights.gender,
          
          "storyMetrics.views": storyInsights.views,
          "storyMetrics.replies": storyInsights.replies,
          "storyMetrics.exits": storyInsights.exits,
          "storyMetrics.completionRate": storyInsights.completionRate,

          "reelMetrics.plays": reelInsights.plays,
          "reelMetrics.shares": reelInsights.shares,
          "reelMetrics.saves": reelInsights.saves,
          "reelMetrics.comments": reelInsights.comments,

          "hashtagPerformance": hashtagPerformance,

          "topPosts": topPostsData,

          "peakEngagement": peakEngagementData,
          
          "contentPerformance": contentPerformanceData,

          "interests": interestsData,

          "mentionsAndInteractions": mentionsData
        },
      },
    );

    return {
      basicInfo,
      mediaInsights,
      audienceInsights,
      storyInsights,
      reelInsights,
      hashtagPerformance,
      topPostsData,
      peakEngagementData,
    };
  } catch (error) {
    console.error('Error updating Instagram metrics:', error.response?.data || error);
    throw error;
  }
};

const updateMissingFields = async (influencerId, basicInfo, interestsData) => {
  const influencer = await Influencer.findById(influencerId);
  if (!influencer) throw new Error("Influencer not found");

  const updates = Object.fromEntries(
    Object.entries({
      profilePicture: basicInfo.profilePicture,
      followers: basicInfo.followers,
      PersonalBio: basicInfo.bio,
      username: basicInfo.username,
      "contentAndAudience.primaryNiche": interestsData[0]?.name,
      "contentAndAudience.secondaryNiche": interestsData[1]?.name,	
    }).filter(([key, value]) => value && !get(influencer, key))
  );

  if (Object.keys(updates).length > 0) {
    await Influencer.findByIdAndUpdate(influencerId, { $set: updates });
  }
};

const getBasicAccountInfo = async (api, instagramId: string) => {
  try {
    const response = await axios.get(`${api.baseUrl}/${instagramId}`, {
      params: {
        fields: 'id,username,profile_picture_url,name,biography,media_count,followers_count,follows_count',
        access_token: api.accessToken
      }
    });

    return {
      username: response.data.username,
      profilePicture: response.data.profile_picture_url,
      name: response.data.name,
      bio: response.data.biography,
      followers: response.data.followers_count,
      following: response.data.follows_count,
      postsCount: response.data.media_count
    };
  } catch (error) {
    console.error('Error fetching basic account info:', error.response?.data || error);
    throw error;
  }
};

const getMediaInsights = async (api, instagramId: string) => {
  try {
    const mediaResponse = await axios.get(`${api.baseUrl}/${instagramId}/media`, {
      params: {
        fields: 'id,media_type,timestamp',
        limit: 50,
        access_token: api.accessToken
      }
    });

    const mediaItems = mediaResponse.data.data || [];
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recentMedia = mediaItems.filter(item => 
      new Date(item.timestamp) >= oneMonthAgo
    );

    let totalImpressions = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalViews = 0;
    let totalSaves = 0;
    let totalEngagements = 0;
    let totalReach = 0;

    for (const item of recentMedia) {
      try {
        const insightsResponse = await axios.get(`${api.baseUrl}/${item.id}/insights`, {
          params: {
            metric: 'impressions,reach,saved,likes,comments,shares',
            access_token: api.accessToken
          }
        });

        const metrics = insightsResponse.data.data || [];
        
        metrics.forEach(metric => {
          if (metric.name === 'impressions') totalImpressions += metric.values[0].value;
          if (metric.name === 'reach') totalReach += metric.values[0].value;
          if (metric.name === 'saved') totalSaves += metric.values[0].value;
          if (metric.name === 'likes') totalLikes += metric.values[0].value;
          if (metric.name === 'comments') totalComments += metric.values[0].value;
          if (metric.name === 'shares') totalShares += metric.values[0].value;
        });

        if (item.media_type === 'VIDEO' || item.media_type === 'REEL') {
          const videoInsightsResponse = await axios.get(`${api.baseUrl}/${item.id}/insights`, {
            params: {
              metric: 'video_views',
              access_token: api.accessToken
            }
          });

          const videoMetrics = videoInsightsResponse.data.data || [];
          videoMetrics.forEach(metric => {
            if (metric.name === 'video_views') totalViews += metric.values[0].value;
          });
        }
      } catch (error) {
        console.error(`Error fetching insights for media ${item.id}:`, error.response?.data || error);
      }
    }

    totalEngagements = totalLikes + totalComments + totalShares + totalSaves;
    
    const engagementRate = totalReach > 0 
      ? (totalEngagements / totalReach) * 100 
      : 0;

    return {
      impressions: totalImpressions,
      reach: totalReach,
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      views: totalViews,
      saves: totalSaves,
      engagementRate: Number(engagementRate.toFixed(2))
    };
  } catch (error) {
    console.error('Error fetching media insights:', error.response?.data || error);
    throw error;
  }
};

const getAudienceInsights = async (api, instagramId: string, pageAccessToken: string) => {
  try {
    // Use the correct metrics as shown in the error message
    const audienceResponse = await axios.get(`https://graph.facebook.com/v22.0/${instagramId}/insights`, {
      params: {
        metric: 'follower_demographics,reached_audience_demographics,engaged_audience_demographics',
        period: 'lifetime',
        metric_type: 'total_value',
        timeframe: 'this_month',
        breakdown: 'age,gender',
        access_token: pageAccessToken
      }
    });

    const insights = audienceResponse.data.data || [];

    // Process the demographic data from the new format
    const ageBreakdown = {
      "13-17": 0,
      "18-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45-54": 0,
      "55-64": 0,
      "65+": 0
    };
    
    const genderStats = {
      male: 0,
      female: 0,
      other: 0,
      unknown: 0
    };

    // Try to extract demographics from follower_demographics
    const demographicData = insights.find(item => item.name === 'follower_demographics');
    if (demographicData && demographicData.values && demographicData.values[0].value) {
      const data = demographicData.values[0].value;
      
      // Process age and gender data based on the API response format
      if (data.gender_age) {
        Object.entries(data.gender_age).forEach(([key, value]) => {
          const [gender, age] = key.split('.');
          
          if (gender === 'M') genderStats.male += Number(value);
          else if (gender === 'F') genderStats.female += Number(value);
          else if (gender === 'U') genderStats.unknown += Number(value);
          else genderStats.other += Number(value);
          
          if (age && ageBreakdown.hasOwnProperty(age)) {
            ageBreakdown[age] += Number(value);
          }
        });
      }
      
      // Process location data
      const locations = [];
      if (data.countries) {
        const topCountries = Object.entries(data.countries)
          .sort((a, b) => Number(b[1]) - Number(a[1]))
          .slice(0, 10)
          .map(([country]) => country);
          
        locations.push(...topCountries);
      }
      
      if (data.cities) {
        const topCities = Object.entries(data.cities)
          .sort((a, b) => Number(b[1]) - Number(a[1]))
          .slice(0, 10)
          .map(([city]) => city)
          .filter(city => !locations.includes(city));
          
        locations.push(...topCities);
      }
      
      // Get language data
      let primaryLanguage = 'en_US';
      if (data.languages) {
        const languages = Object.entries(data.languages);
        if (languages.length > 0) {
          languages.sort((a, b) => Number(b[1]) - Number(a[1]));
          primaryLanguage = languages[0][0];
        }
      }
      
      return {
        age: ageBreakdown,
        gender: genderStats,
        location: locations,
        language: primaryLanguage,
        timezone: new Date().getTimezoneOffset()
      };
    }
    
    // Return default values if data extraction fails
    return {
      age: ageBreakdown,
      gender: genderStats,
      location: [],
      language: 'en_US',
      timezone: new Date().getTimezoneOffset()
    };
  } catch (error) {
    console.error('Error fetching audience insights:', error.response?.data || error);
    return {
      age: {
        "13-17": 0,
        "18-24": 0,
        "25-34": 0,
        "35-44": 0,
        "45-54": 0,
        "55-64": 0,
        "65+": 0
      },
      gender: {
        male: 0,
        female: 0,
        other: 0,
        unknown: 100
      },
      location: [],
      language: 'en_US',
      timezone: new Date().getTimezoneOffset()
    };
  }
};

const getStoryInsights = async (api, instagramId: string) => {
  try {
    const storiesResponse = await axios.get(`${api.baseUrl}/${instagramId}/stories`, {
      params: {
        fields: 'id,media_type',
        access_token: api.accessToken
      }
    });

    const stories = storiesResponse.data.data || [];
    
    let totalViews = 0;
    let totalReplies = 0;
    let totalExits = 0;
    let totalImpressions = 0;
    let totalCompletions = 0;
    
    for (const story of stories) {
      try {
        const insightsResponse = await axios.get(`${api.baseUrl}/${story.id}/insights`, {
          params: {
            metric: 'impressions,reach,exits,replies,taps_forward,taps_back',
            access_token: api.accessToken
          }
        });

        const metrics = insightsResponse.data.data || [];
        
        let storyImpressions = 0;
        let storyReach = 0;
        
        metrics.forEach(metric => {
          if (metric.name === 'impressions') {
            storyImpressions = metric.values[0].value;
            totalImpressions += storyImpressions;
          }
          if (metric.name === 'reach') {
            storyReach = metric.values[0].value;
            totalViews += storyReach;
          }
          if (metric.name === 'exits') totalExits += metric.values[0].value;
          if (metric.name === 'replies') totalReplies += metric.values[0].value;
          if (metric.name === 'taps_forward') totalCompletions += metric.values[0].value;
        });
      } catch (error) {
        console.error(`Error fetching insights for story ${story.id}:`, error.response?.data || error);
      }
    }
    
    const completionRate = totalViews > 0 
      ? ((totalViews - totalExits) / totalViews) * 100 
      : 0;

    return {
      views: totalViews,
      replies: totalReplies,
      exits: totalExits,
      completionRate: Number(completionRate.toFixed(2))
    };
  } catch (error) {
    console.error('Error fetching story insights:', error.response?.data || error);
    return {
      views: 0,
      replies: 0, 
      exits: 0,
      completionRate: 0
    };
  }
};


const getReelInsights = async (api, instagramId: string) => {
  try {
    const mediaResponse = await axios.get(`${api.baseUrl}/${instagramId}/media`, {
      params: {
        fields: 'id,media_type,timestamp',
        limit: 50,
        access_token: api.accessToken
      }
    });

    const mediaItems = mediaResponse.data.data || [];
    
    const reels = mediaItems.filter(item => item.media_type === 'REEL');
    
    let totalPlays = 0;
    let totalShares = 0;
    let totalSaves = 0;
    let totalComments = 0;
    
    // Get insights for each reel
    for (const reel of reels) {
      try {
        const insightsResponse = await axios.get(`${api.baseUrl}/${reel.id}/insights`, {
          params: {
            metric: 'plays,saved,shares,comments',
            access_token: api.accessToken
          }
        });

        const metrics = insightsResponse.data.data || [];
        
        metrics.forEach(metric => {
          if (metric.name === 'plays') totalPlays += metric.values[0].value;
          if (metric.name === 'saved') totalSaves += metric.values[0].value;
          if (metric.name === 'shares') totalShares += metric.values[0].value;
          if (metric.name === 'comments') totalComments += metric.values[0].value;
        });
      } catch (error) {
        console.error(`Error fetching insights for reel ${reel.id}:`, error.response?.data || error);
      }
    }

    return {
      plays: totalPlays,
      shares: totalShares,
      saves: totalSaves,
      comments: totalComments
    };
  } catch (error) {
    console.error('Error fetching reel insights:', error.response?.data || error);
    return {
      plays: 0,
      shares: 0,
      saves: 0,
      comments: 0
    };
  }
};

const getHashtagPerformance = async (api, instagramId: string) => {
  try {
    const mediaResponse = await axios.get(`${api.baseUrl}/${instagramId}/media`, {
      params: {
        fields: 'id,caption,timestamp',
        limit: 50,
        access_token: api.accessToken
      }
    });

    const mediaItems = mediaResponse.data.data || [];
    
    const hashtagCounts = {};
    const hashtagLastUsed = {};
    
    mediaItems.forEach(item => {
      if (item.caption) {
        const hashtags = item.caption.match(/#[\w]+/g) || [];
        
        hashtags.forEach(hashtag => {
          const tag = hashtag.substring(1).toLowerCase();
          
          hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
          
          const itemDate = new Date(item.timestamp);
          if (!hashtagLastUsed[tag] || itemDate > new Date(hashtagLastUsed[tag])) {
            hashtagLastUsed[tag] = item.timestamp;
          }
        });
      }
    });
    
    return Object.keys(hashtagCounts).map(tag => ({
      hashtag: tag,
      mentionCount: hashtagCounts[tag],
      lastUsedAt: new Date(hashtagLastUsed[tag])
    })).sort((a, b) => b.mentionCount - a.mentionCount);
  } catch (error) {
    console.error('Error analyzing hashtag performance:', error.response?.data || error);
    return [];
  }
};

const getTopPosts = async (api, instagramId: string) => {
  try {
    const mediaResponse = await axios.get(`${api.baseUrl}/${instagramId}/media`, {
      params: {
        fields: 'id,caption,media_type,timestamp,media_url,thumbnail_url',
        limit: 50,
        access_token: api.accessToken
      }
    });

    const mediaItems = mediaResponse.data.data || [];
    const postsWithInsights = [];

    for (const item of mediaItems) {
      try {
        const insightsResponse = await axios.get(`${api.baseUrl}/${item.id}/insights`, {
          params: {
            metric: 'impressions,reach,engagement,saved,likes,comments,shares',
            access_token: api.accessToken
          }
        });

        const metrics = insightsResponse.data.data || [];
        
        let likes = 0;
        let comments = 0;
        let shares = 0;
        let saves = 0;
        let views = 0;
        
        metrics.forEach(metric => {
          if (metric.name === 'likes') likes = metric.values[0].value;
          if (metric.name === 'comments') comments = metric.values[0].value;
          if (metric.name === 'shares') shares = metric.values[0].value;
          if (metric.name === 'saved') saves = metric.values[0].value;
        });
        
        if (item.media_type === 'VIDEO' || item.media_type === 'REEL') {
          const videoInsightsResponse = await axios.get(`${api.baseUrl}/${item.id}/insights`, {
            params: {
              metric: 'video_views',
              access_token: api.accessToken
            }
          });
          
          const videoMetrics = videoInsightsResponse.data.data || [];
          videoMetrics.forEach(metric => {
            if (metric.name === 'video_views') views = metric.values[0].value;
          });
        }
        
        postsWithInsights.push({
          content: item.caption || '',
          likes,
          comments,
          shares,
          saves,
          views,
          postDate: new Date(item.timestamp)
        });
      } catch (error) {
        console.error(`Error fetching insights for media ${item.id}:`, error.response?.data || error);
      }
    }
    
    return postsWithInsights
      .sort((a, b) => {
        const engagementA = a.likes + a.comments + a.shares + a.saves;
        const engagementB = b.likes + b.comments + b.shares + b.saves;
        return engagementB - engagementA;
      })
      .slice(0, 10);
  } catch (error) {
    console.error('Error analyzing top posts:', error.response?.data || error);
    return [];
  }
};

const getPeakEngagement = async (api, instagramId: string) => {
  try {
    const mediaResponse = await axios.get(`${api.baseUrl}/${instagramId}/media`, {
      params: {
        fields: 'id,timestamp',
        limit: 100,
        access_token: api.accessToken
      }
    });

    const mediaItems = mediaResponse.data.data || [];
    
    const engagementByHour = Array(24).fill(0);
    
    for (const item of mediaItems) {
      try {
        const insightsResponse = await axios.get(`${api.baseUrl}/${item.id}/insights`, {
          params: {
            metric: 'engagement',
            access_token: api.accessToken
          }
        });

        const metrics = insightsResponse.data.data || [];
        let engagement = 0;
        
        metrics.forEach(metric => {
          if (metric.name === 'engagement') engagement = metric.values[0].value;
        });
        
        const postDate = new Date(item.timestamp);
        const hour = postDate.getHours();

        engagementByHour[hour] += engagement;
      } catch (error) {
        console.error(`Error fetching insights for media ${item.id}:`, error.response?.data || error);
      }
    }
    
    return engagementByHour.map((engagement, hour) => ({
      hour,
      engagement
    })).filter(item => item.engagement > 0)
      .sort((a, b) => b.engagement - a.engagement);
  } catch (error) {
    console.error('Error analyzing peak engagement times:', error.response?.data || error);
    return [];
  }
};

const getContentPerformance = async (api, instagramId: string) => {
  try {
    const mediaResponse = await axios.get(`${api.baseUrl}/${instagramId}/media`, {
      params: {
        fields: 'id,media_type',
        limit: 50,
        access_token: api.accessToken
      }
    });

    const mediaItems = mediaResponse.data.data || [];
    
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalReelViews = 0;
    
    let postCount = 0;
    let reelCount = 0;
    
    for (const item of mediaItems) {
      try {
        const insightsResponse = await axios.get(`${api.baseUrl}/${item.id}/insights`, {
          params: {
            metric: 'likes,comments,shares',
            access_token: api.accessToken
          }
        });

        const metrics = insightsResponse.data.data || [];
        
        metrics.forEach(metric => {
          if (metric.name === 'likes') totalLikes += metric.values[0].value;
          if (metric.name === 'comments') totalComments += metric.values[0].value;
          if (metric.name === 'shares') totalShares += metric.values[0].value;
        });
        
        postCount++;

        if (item.media_type === 'REEL') {
          const videoInsightsResponse = await axios.get(`${api.baseUrl}/${item.id}/insights`, {
            params: {
              metric: 'plays',
              access_token: api.accessToken
            }
          });
          
          const videoMetrics = videoInsightsResponse.data.data || [];
          videoMetrics.forEach(metric => {
            if (metric.name === 'plays') totalReelViews += metric.values[0].value;
          });
          
          reelCount++;
        }
      } catch (error) {
        console.error(`Error fetching insights for media ${item.id}:`, error.response?.data || error);
      }
    }

    const averageLikesPerPost = postCount > 0 ? Math.round(totalLikes / postCount) : 0;
    const averageCommentsPerPost = postCount > 0 ? Math.round(totalComments / postCount) : 0;
    const averageSharesPerPost = postCount > 0 ? Math.round(totalShares / postCount) : 0;
    const averageViewsPerReel = reelCount > 0 ? Math.round(totalReelViews / reelCount) : 0;

    return {
      averageLikesPerPost,
      averageCommentsPerPost,
      averageSharesPerPost,
      averageViewsPerReel
    };
  } catch (error) {
    console.error('Error analyzing content performance:', error.response?.data || error);
    return {
      averageLikesPerPost: 0,
      averageCommentsPerPost: 0,
      averageSharesPerPost: 0,
      averageViewsPerReel: 0
    };
  }
};

const getAudienceInterests = async (api, instagramId: string, pageAccessToken: string) => {
  try {
    // Fetch Follower Demographics
    const followerDemographicsResponse = await axios.get(`${api.baseUrl}/${instagramId}/insights`, {
      params: {
        metric: 'follower_demographics',
        period: 'lifetime',
        metric_type: 'total_value',
        timeframe: 'this_month',
        breakdown: 'age',
        access_token: pageAccessToken
      }
    });

    // Fetch Reached Audience Demographics
    const reachedAudienceResponse = await axios.get(`${api.baseUrl}/${instagramId}/insights`, {
      params: {
        metric: 'reached_audience_demographics',
        period: 'lifetime',
        metric_type: 'total_value',
        timeframe: 'this_month',
        breakdown: 'gender',
        access_token: pageAccessToken
      }
    });

    // Fetch Engaged Audience Demographics
    const engagedAudienceResponse = await axios.get(`${api.baseUrl}/${instagramId}/insights`, {
      params: {
        metric: 'engaged_audience_demographics',
        period: 'lifetime',
        metric_type: 'total_value',
        timeframe: 'this_month',
        breakdown: 'gender',
        access_token: pageAccessToken
      }
    });

    // Extract and merge data
    const followersData = followerDemographicsResponse.data.data || [];
    const reachedData = reachedAudienceResponse.data.data || [];
    const engagedData = engagedAudienceResponse.data.data || [];

    const demographicsData: { followers?: any; reached?: any; engaged?: any } = {};

    for (const metric of [...followersData, ...reachedData, ...engagedData]) {
      if (metric.name === 'follower_demographics' && metric.values?.[0]) {
        demographicsData.followers = metric.values[0].value;
      }
      if (metric.name === 'reached_audience_demographics' && metric.values?.[0]) {
        demographicsData.reached = metric.values[0].value;
      }
      if (metric.name === 'engaged_audience_demographics' && metric.values?.[0]) {
        demographicsData.engaged = metric.values[0].value;
      }
    }

    const interests = [];

    if (demographicsData.followers?.gender_age) {
      Object.entries(demographicsData.followers.gender_age).forEach(([key, value]) => {
        const [gender, ageRange] = key.split('.');
        interests.push({
          name: `${gender === 'F' ? 'Women' : 'Men'} ${ageRange.replace('-', ' to ')}`,
          audienceSize: typeof value === 'number' ? value : 0,
          category: 'followers'
        });
      });
    }

    if (demographicsData.reached?.gender_age) {
      Object.entries(demographicsData.reached.gender_age).forEach(([key, value]) => {
        const [gender, ageRange] = key.split('.');
        interests.push({
          name: `Reached ${gender === 'F' ? 'Women' : 'Men'} ${ageRange.replace('-', ' to ')}`,
          audienceSize: typeof value === 'number' ? value : 0,
          category: 'reached'
        });
      });
    }

    if (demographicsData.engaged?.gender_age) {
      Object.entries(demographicsData.engaged.gender_age).forEach(([key, value]) => {
        const [gender, ageRange] = key.split('.');
        interests.push({
          name: `Engaged ${gender === 'F' ? 'Women' : 'Men'} ${ageRange.replace('-', ' to ')}`,
          audienceSize: typeof value === 'number' ? value : 0,
          category: 'engaged'
        });
      });
    }

    return interests.sort((a, b) => b.audienceSize - a.audienceSize);
  } catch (error) {
    console.error('Error fetching audience insights:', error.response?.data || error);
    return [];
  }
};


const getMentionsAndInteractions = async (api, instagramId: string, accessToken: string) => {
  try {
    // Use the media endpoint to get recent posts
    const mediaResponse = await axios.get(`${api.baseUrl}/${instagramId}/media`, {
      params: {
        fields: 'id,caption,timestamp,comments_count,like_count,comments{text,username,timestamp}',
        limit: 50,
        access_token: accessToken
      }
    });

    const mediaItems = mediaResponse.data.data || [];
    const mentions = [];
    
    // Check for mentions in captions
    for (const item of mediaItems) {
      if (item.caption) {
        const mentionRegex = /@([a-zA-Z0-9._]+)/g;
        const mentionMatches = Array.from(item.caption.matchAll(mentionRegex) || []);
        
        for (const match of mentionMatches) {
          const username = match[1];
          mentions.push({
            username,
            postId: item.id,
            mentionDate: new Date(item.timestamp),
            likes: item.like_count || 0,
            comments: item.comments_count || 0,
            engagement: (item.like_count || 0) + (item.comments_count || 0),
            type: 'mention'
          });
        }
      }
      
      // Process comments directly from the nested comments field
      if (item.comments && item.comments.data) {
        for (const comment of item.comments.data) {
          mentions.push({
            username: comment.username,
            postId: item.id,
            mentionDate: new Date(comment.timestamp),
            type: 'comment',
            engagement: 1
          });
          
          // Check for mentions in comments
          if (comment.text) {
            const commentMentionRegex = /@([a-zA-Z0-9._]+)/g;
            const commentMentionMatches = Array.from(comment.text.matchAll(commentMentionRegex) || []);
            
            for (const match of commentMentionMatches) {
              const username = match[1];
              mentions.push({
                username,
                postId: item.id,
                mentionDate: new Date(comment.timestamp),
                type: 'comment_mention',
                engagement: 1
              });
            }
          }
        }
      }
    }
    
    interface Interaction {
      username: string;
      mentionCount: number;
      lastMentionedAt: Date | null;
      totalEngagement: number;
      types: string[];
    }
    
    const interactionsByUser: { [key: string]: Interaction } = {};
    
    for (const mention of mentions) {
      if (!interactionsByUser[mention.username]) {
        interactionsByUser[mention.username] = {
          username: mention.username,
          mentionCount: 0,
          lastMentionedAt: null,
          totalEngagement: 0,
          types: []
        };
      }
      
      interactionsByUser[mention.username].mentionCount++;
      interactionsByUser[mention.username].totalEngagement += mention.engagement || 0;
      
      if (!interactionsByUser[mention.username].types.includes(mention.type)) {
        interactionsByUser[mention.username].types.push(mention.type);
      }
      
      if (!interactionsByUser[mention.username].lastMentionedAt || 
          mention.mentionDate > interactionsByUser[mention.username].lastMentionedAt) {
        interactionsByUser[mention.username].lastMentionedAt = mention.mentionDate;
      }
    }
    
    return Object.values(interactionsByUser)
      .sort((a, b) => b.totalEngagement - a.totalEngagement);
  } catch (error) {
    console.error('Error analyzing mentions and interactions:', error.response?.data || error);
    return [];
  }
};


const calculateFollowerGrowth = (influencer: IInstagramMetrics, currentFollowers: number) => {
  try {
    const existingGrowth = influencer?.metrics?.followerGrowth || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let previousFollowers = 0;
    if (existingGrowth.length > 0) {
      const latestEntry = existingGrowth.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      previousFollowers = latestEntry.count;
    }
    
    const todayExists = existingGrowth.some(entry => 
      new Date(entry.date).setHours(0, 0, 0, 0) === today.getTime()
    );
    
    if (!todayExists) {
      existingGrowth.push({
        date: today,
        count: currentFollowers
      });
    } else {
      const todayIndex = existingGrowth.findIndex(entry => 
        new Date(entry.date).setHours(0, 0, 0, 0) === today.getTime()
      );
      
      if (todayIndex !== -1) {
        existingGrowth[todayIndex].count = currentFollowers;
      }
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const filteredGrowth = existingGrowth.filter(entry => 
      new Date(entry.date) >= ninetyDaysAgo
    );

    return filteredGrowth.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    console.error('Error calculating follower growth:', error);
    return [];
  }
};
