import { getFacebookAnalytics } from '../controllers/facebookPlatformData.controller';
import { authMiddleware } from '../middleware/auth';
import { Router } from 'express';

const facebookPlatformData = Router();

facebookPlatformData.get('/facebook/analytics', authMiddleware, getFacebookAnalytics);

export { facebookPlatformData };
