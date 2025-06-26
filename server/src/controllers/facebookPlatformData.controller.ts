import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { updateFacebookMetrics } from '../services/facebook/facebookPlaformData.service';

export const getFacebookAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const influencerId = req.user.userId;
    const analytics = await updateFacebookMetrics(influencerId);
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching YouTube analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};