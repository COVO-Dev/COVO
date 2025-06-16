import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { updateTwitterMetrics } from "../services/twitterPlatformData.service";

export const getTwitterAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const influencerId = req.user.userId;
    const analytics = await updateTwitterMetrics(influencerId);
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching Twitter analytics:', error);
    
    if (error.response?.status === 429) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: error.response.headers['x-rate-limit-reset']
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};