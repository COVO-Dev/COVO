import { google } from 'googleapis';
import { validateYoutubeAccessToken } from './authYoutube.service';
import { Youtube } from '../../models/youtube.model';
import { Influencer } from '../../models/influencers.models';
import get from "lodash/get";


const initializeYoutubeApis = (accessToken: string) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  return {
    youtube: google.youtube({
      version: 'v3',
      auth
    }),
    youtubeAnalytics: google.youtubeAnalytics({
      version: 'v2',
      auth
    })
  };
};

const getEngagementMetrics = async (youtubeAnalytics, channelId: string) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const response = await youtubeAnalytics.reports.query({
      ids: `channel==${channelId}`,
      startDate: oneMonthAgo.toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      metrics: 'likes,comments,shares,averageViewDuration,subscribersGained,subscribersLost',
      dimensions: 'day'
    });

    const metrics = response.data.rows || [];

    const peakEngagement = calculatePeakEngagement(metrics);
    return {
      engagementRate: calculateEngagementRate(metrics),
      subscriberGrowth: calculateSubscriberGrowth(metrics),
      metrics,
      peakEngagement
    };
  } catch (error) {
    console.error('Error in getEngagementMetrics:', error.response?.data || error);
    throw error;
  }
};

export const updateYoutubeMetrics = async (influencerId: string) => {
  try {
    const accessToken = await validateYoutubeAccessToken(influencerId);
    if (!accessToken) {
      throw new Error('No valid access token found');
    }
    const { youtube, youtubeAnalytics } = initializeYoutubeApis(accessToken);

    const influencer = await Youtube.findOne({ influencerId });
    if (!influencer) {
      throw new Error('Influencer not found');
    }
    const channelId = influencer.youtubeId;


    if (!channelId) {
      throw new Error('Channel ID not found');
    }

    try {
      const channelResponse = await youtube.channels.list({
        part: ['id'],
        id: [channelId]
      });

      if (!channelResponse.data.items?.length) {
        throw new Error('Channel not accessible');
      }
    } catch (error) {
      console.error('Channel verification failed:', error.response?.data || error);
      throw new Error('Failed to verify channel access');
    }

    const [basicInfo, engagementMetrics, demographics, topVideos, interests, adPerformance, audienceRetention] = await Promise.all([
      getBasicChannelInfo(youtube, channelId),
      getEngagementMetrics(youtubeAnalytics, channelId),
      getDemographics(youtubeAnalytics, channelId),
      getTopVideos(youtube, youtubeAnalytics, channelId),
      getInterests(youtube, channelId),
      getAdPerformance(youtube, channelId),
      getAudienceRetention(youtubeAnalytics, channelId)
    ]);

    await updateMissingFields(influencerId, basicInfo, interests);


    await Youtube.findOneAndUpdate(
      { influencerId },
      {
        $set: {
          "metrics.followers": basicInfo.subscriberCount,
          "metrics.impressions": topVideos.reduce((sum, video) => sum + video.impressions, 0),
          "metrics.engagementRate": engagementMetrics.engagementRate,
          "metrics.likes": engagementMetrics.metrics.reduce((sum, row) => sum + (row[1] || 0), 0),
          "metrics.views": engagementMetrics.metrics.reduce((sum, row) => sum + (row[4] || 0), 0),
          "metrics.shares": engagementMetrics.metrics.reduce((sum, row) => sum + (row[3] || 0), 0),
          "metrics.comments": engagementMetrics.metrics.reduce((sum, row) => sum + (row[2] || 0), 0),
          "metrics.subscriberGrowth": engagementMetrics.subscriberGrowth.map((growth) => ({
            date: growth.date,
            gained: growth.gained,
            lost: growth.lost
          })),

          "metrics.lastUpdated": new Date(),
          "demographics.audience.age": Object.fromEntries(demographics.age),
          "demographics.audience.genderStats": Object.fromEntries(demographics.gender),
          "interests": interests,
          "videoPerformance": topVideos.map(video => ({
            videoId: video.videoId,
            title: video.title,
            views: video.views,
            watchTime: video.watchTime,
            // thiumbnail: video.thumbnail,
            avgViewDuration: video.avgViewDuration,
            ctr: video.ctr,
            likes: video.likes,
            comments: video.comments,
            shares: video.shares,
            trafficSources: video.trafficSources,
            uploadDate: video.publishDate
          })),
          "peakEngagement": engagementMetrics.peakEngagement,
          "audienceRetention": audienceRetention,
        },
      });

    return {
      basicInfo,
      engagementMetrics,
      demographics,
      topVideos,
      interests,
      adPerformance
    };
  } catch (error) {
    console.error('Error updating YouTube metrics:', error.response?.data || error);
    throw error;
  }
};

const updateMissingFields = async (influencerId: string, basicInfo: any, interests: any) => {
  const influencer = await Influencer.findById(influencerId);
  if (!influencer) throw new Error("Influencer not found");

  const updates = Object.fromEntries(
    Object.entries({
      profilePicture: basicInfo.profilePicture,
      PersonalBio: basicInfo.bio,
      username: basicInfo.channelName,
      followers: basicInfo.subscriberCount,
      "contentAndAudience.primaryNiche": interests[0],
      "contentAndAudience.secondaryNiche": interests[1],
    }).filter(([key, value]) => value && !get(influencer, key))
  );

  if (Object.keys(updates).length > 0) {
    await Influencer.findByIdAndUpdate(influencerId, { $set: updates });
  }
};

const getBasicChannelInfo = async (youtube, channelId: string) => {
  const response = await youtube.channels.list({
    part: ['snippet', 'statistics', 'brandingSettings'],
    id: [channelId]
  });

  const channel = response.data.items?.[0];
  return {
    channelName: channel?.snippet?.title,
    profilePicture: channel?.snippet?.thumbnails?.high?.url,
    bio: channel?.snippet?.description,
    subscriberCount: channel?.statistics?.subscriberCount,
    viewCount: channel?.statistics?.viewCount,
    videoCount: channel?.statistics?.videoCount
  };
};

const getDemographics = async (youtubeAnalytics, channelId: string) => {
  try {
    const ageGenderResponse = await youtubeAnalytics.reports.query({
      ids: `channel==${channelId}`,
      startDate: '2020-01-01',
      endDate: new Date().toISOString().split('T')[0],
      metrics: 'viewerPercentage',
      dimensions: 'ageGroup,gender',
      sort: '-viewerPercentage',
    });

    const geographyResponse = await youtubeAnalytics.reports.query({
      ids: `channel==${channelId}`,
      startDate: '2020-01-01',
      endDate: new Date().toISOString().split('T')[0],
      metrics: 'estimatedMinutesWatched',
      dimensions: 'country',
      sort: '-estimatedMinutesWatched',
      maxResults: 25
    });

    const demographics = {
      age: new Map<string, number>(),
      gender: new Map<string, number>(),
      location: new Map<string, number>()
    };

    const ageGenderRows = ageGenderResponse.data.rows || [];
    let totalMinutesAgeGender = 0;
    ageGenderRows.forEach(row => {
      totalMinutesAgeGender += row[2];
    });

    ageGenderRows.forEach(row => {
      const [age, gender, minutes] = row;
      const percentage = (minutes / totalMinutesAgeGender) * 100;

      if (age) {
        demographics.age.set(age,
          (demographics.age.get(age) || 0) + percentage
        );
      }
      if (gender) {
        demographics.gender.set(gender,
          (demographics.gender.get(gender) || 0) + percentage
        );
      }
    });

    const geographyRows = geographyResponse.data.rows || [];
    let totalMinutesGeo = 0;
    geographyRows.forEach(row => {
      totalMinutesGeo += row[1];
    });

    geographyRows.forEach(row => {
      const [country, minutes] = row;
      const percentage = (minutes / totalMinutesGeo) * 100;
      if (country) {
        demographics.location.set(country, percentage);
      }
    });

    return demographics;
  } catch (error) {
    console.error('Error fetching demographics:', error.response?.data || error);
    throw error;
  }
};


const getTopVideos = async (youtube, youtubeAnalytics, channelId: string) => {
  try {

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    const searchResponse = await youtube.search.list({
      channelId,
      part: ['id'],
      order: 'viewCount',
      maxResults: 10,
      type: ['video'],
      publishedAfter: startDate.toISOString(),
      publishedBefore: endDate.toISOString()
    });

    const videoIds = searchResponse.data.items?.map(item => item.id?.videoId) || [];

    if (videoIds.length > 0) {
      const videosResponse = await youtube.videos.list({
        part: ['snippet', 'statistics'],
        id: videoIds
      });

      const analyticsPromises = videoIds.map(async videoId => {
        try {
          const metricsResponse = await youtubeAnalytics.reports.query({
            ids: `channel==${channelId}`,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            metrics: 'shares,averageViewDuration,estimatedMinutesWatched,clickThroughRate',
            filters: `video==${videoId}`,
          });

          const metricsRow = metricsResponse.data.rows?.[0] || [];

          const trafficResponse = await youtubeAnalytics.reports.query({
            ids: `channel==${channelId}`,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            metrics: 'views',
            dimensions: 'insightTrafficSourceType',
            filters: `video==${videoId}`
          });

          const trafficSources = { search: 0, external: 0, suggested: 0, browseFeatures: 0 };
          (trafficResponse.data.rows || []).forEach(row => {
            const type = row[0];
            const count = parseInt(row[1] || '0');
            if (type === 'YT_SEARCH') {
              trafficSources.search += count;
            } else if (type === 'EXT_URL') {
              trafficSources.external += count;
            } else if (type === 'SUGGESTED_VIDEO') {
              trafficSources.suggested += count;
            } else if (type === 'BROWSE') {
              trafficSources.browseFeatures += count;
            }
          });

          return {
            videoId,
            shares: parseInt(metricsRow[0] || '0'),
            avgViewDuration: parseFloat(metricsRow[1] || '0'),
            watchTime: parseFloat(metricsRow[2] || '0'),
            ctr: parseFloat(metricsRow[3] || '0'),
            trafficSources
          };
        } catch (error) {
          console.error(`Error getting analytics for video ${videoId}:`, error);
          return { videoId, shares: 0, impressions: 0 };
        }
      });

      const analyticsResults = await Promise.all(analyticsPromises);

      return videosResponse.data.items?.map(video => {
        const videoId = video.id;
        const analytics = analyticsResults.find(result => result.videoId === videoId) || {
          shares: 0,
          avgViewDuration: 0,
          watchTime: 0,
          ctr: 0,
          trafficSources: { search: 0, external: 0, suggested: 0, browseFeatures: 0 }
        };

        return {
          videoId,
          title: video.snippet?.title || '',
          views: parseInt(video.statistics?.viewCount || '0'),
          watchTime: analytics.watchTime,
          avgViewDuration: analytics.avgViewDuration,
          ctr: analytics.ctr,
          likes: parseInt(video.statistics?.likeCount || '0'),
          comments: parseInt(video.statistics?.commentCount || '0'),
          shares: analytics.shares,
          trafficSources: analytics.trafficSources,
          uploadDate: video.snippet?.publishedAt ? new Date(video.snippet.publishedAt) : new Date()
        };
      }) || [];
    }
    return [];
  } catch (error) {
    console.error('Error in getTopVideos:', error.response?.data || error);
    return [];
  }
};

const getInterests = async (youtube, channelId: string) => {
  const response = await youtube.channels.list({
    part: ['topicDetails'],
    id: [channelId]
  });

  return response.data.items?.[0]?.topicDetails?.topicCategories || [];
};

const calculateEngagementRate = (metrics: any[]) => {
  const totalEngagements = metrics.reduce((sum, row) =>
    sum + (row[1] + row[2] + row[3]), 0);
  const totalViews = metrics.reduce((sum, row) => sum + row[4], 0);
  return totalViews ? (totalEngagements / totalViews) * 100 : 0;
};

const calculateSubscriberGrowth = (metrics: any[]) => {
  return metrics.map(row => ({
    date: row[0],
    gained: row[6],
    lost: row[7],
    net: row[6] - row[7]
  }));
};


const getAdPerformance = async (googleAds, channelId: string) => {
  try {
    const adReport = await googleAds.v16.reportService.searchStreamQuery({
      query: `
        SELECT 
          ad_group_ad.ad.id, 
          metrics.impressions, 
          metrics.clicks, 
          metrics.ctr, 
          metrics.cost_micros
        FROM ad_group_ad
        WHERE ad_group_ad.ad.type = YOUTUBE_VIDEO_AD
        AND segments.youtube_video.channel_id = "${channelId}"
      `
    });

    return {
      impressions: adReport.totalImpressions,
      clicks: adReport.totalClicks,
      ctr: adReport.averageCTR,
      adRevenue: adReport.totalRevenue
    };
  } catch (error) {
    console.error('Error fetching ad performance:', error);
    return null;
  }
};

const calculatePeakEngagement = (metrics: any[]) => {
  const engagementByDayAndHour: { [dayAndHour: string]: number } = {};

  metrics.forEach(([dayStr, likes, comments, shares]) => {
    const date = new Date(dayStr);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const key = `${day}-AllDay`;
    engagementByDayAndHour[key] = (engagementByDayAndHour[key] || 0) + (likes + comments + shares);
  });

  return Object.entries(engagementByDayAndHour).map(([key, engagement]) => {
    const [day, hourStr] = key.split('-');
    return {
      day,
      hour: hourStr === 'AllDay' ? null : parseInt(hourStr),
      engagement
    };
  });
};

const getAudienceRetention = async (youtubeAnalytics, channelId: string) => {
  try {
    const videosResponse = await youtubeAnalytics.reports.query({
      ids: `channel==${channelId}`,
      startDate: '2020-01-01',
      endDate: new Date().toISOString().split('T')[0],
      metrics: 'views',
      dimensions: 'video',
      sort: '-views',
      maxResults: 10
    });
    
    const videoIds = videosResponse.data.rows?.map(row => row[0]) || [];
    
    const retentionDataPromises = videoIds.map(async (videoId) => {
      try {
        const videoInfoResponse = await youtubeAnalytics.youtubeV3.videos.list({
          part: ['contentDetails'],
          id: [videoId]
        });
        
        const durationISO = videoInfoResponse.data.items?.[0]?.contentDetails?.duration;
        const durationSeconds = isoDurationToSeconds(durationISO);
        
        const retentionResponse = await youtubeAnalytics.reports.query({
          ids: `channel==${channelId}`,
          startDate: '2020-01-01',
          endDate: new Date().toISOString().split('T')[0],
          metrics: 'audienceWatchRatio',
          dimensions: 'elapsedVideoTimeRatio',
          filters: `video==${videoId}`
        });
        
        const retentionPoints = retentionResponse.data.rows?.map(([elapsedTimeRatio, watchRatio]) => {
          const timestamp = Math.round(parseFloat(elapsedTimeRatio) * durationSeconds);
          return {
            timestamp,
            viewersRemaining: parseFloat(watchRatio) * 100
          };
        }) || [];
        
        return {
          videoId,
          retentionPoints
        };
      } catch (error) {
        console.error(`Error getting retention data for video ${videoId}:`, error);
        return {
          videoId,
          retentionPoints: []
        };
      }
    });
    
    const allRetentionData = await Promise.all(retentionDataPromises);
    
    // Flatten the data structure to match our schema
    return allRetentionData.flatMap(({ videoId, retentionPoints }) => 
      retentionPoints.map(point => ({
        videoId,
        timestamp: point.timestamp,
        viewersRemaining: point.viewersRemaining
      }))
    );
  } catch (error) {
    console.error('Error fetching audience retention:', error);
    return [];
  }
};

function isoDurationToSeconds(isoDuration) {
  if (!isoDuration) return 0;
  
  const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return 0;
  
  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);
  const seconds = parseInt(matches[3] || '0', 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}




