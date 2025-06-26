import { authMiddleware } from '../middleware/auth';
import { getTwitterAnalytics } from '../controllers/twitterPlatformData.controller';
import { Router } from 'express';

const twitterPlatformData = Router();

twitterPlatformData.get('/twitter/analytics', authMiddleware, getTwitterAnalytics);

export { twitterPlatformData };
