import { getInstagramAnalytics } from '../controllers/instagramPlatformData.controller';
import { authMiddleware } from '../middleware/auth';
import { Router } from 'express';

const instagramPlatformData = Router();

instagramPlatformData.get('/instagram/analytics', authMiddleware, getInstagramAnalytics);

export { instagramPlatformData };
