import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { config } from '../config/configuration';
import { redisSave, redisRetrieve } from '../app';
import { AuthenticatedRequest } from '../types';
import { getTokens } from '../services/instagram/authInstagram.service';
import { asyncHandler } from '../middleware/helper';

const validateConfig = () => {
  const required = ['INSTAGRAM_APP_ID', 'INSTAGRAM_APP_SECRET', 'INSTAGRAM_REDIRECT_URL'];
  const missing = required.filter(key => !config[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

export const generateAuthUrl = (state: string): string => {
  validateConfig();
  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'instagram_manage_comments',
    'instagram_manage_insights',
    'pages_show_list',
    'pages_read_engagement',
    'business_management'
  ].join(',');

  return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${config.INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(config.INSTAGRAM_REDIRECT_URL)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${state}`;
};

export const getAuthUrl = async (req: AuthenticatedRequest, res: Response) => {
  try {
    validateConfig();
    const state = randomBytes(32).toString('hex');
    const stateData = {
      instagramState: state,
      influencerId: req.user.userId,
      timestamp: Date.now()
    };

    await redisSave(state, stateData);
    const authUrl = generateAuthUrl(state);

    res.status(200).json({
      authUrl,
      state,
      influencerId: req.user.userId,
      message:
        "For Postman testing: 1. Open authUrl in browser 2. After auth, copy 'code' and 'state' from redirect URL",
    });

    // res.status(200).json({ authUrl, state });
  } catch (error) {
    console.error('Auth URL generation error:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
};

export const handleCallback = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (typeof state !== 'string' || typeof code !== 'string') {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    const stateData = await redisRetrieve(state);
    if (!stateData || stateData.instagramState !== state) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }


    const result = await getTokens(code, stateData.influencerId);

    // res.redirect(`${config.FRONTEND_URL}/settings?connection=success`);
    return res.status(200).json({
      message: "Instagram account connected successfully",
      connected: true,
      token: result
    });
  } catch (error) {
    console.error('Callback handling error:', error);
    //res.redirect(`${config.FRONTEND_URL}/settings?connection=error`);
  }
});