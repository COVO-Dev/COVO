import { getYoutubeAnalytics } from '../controllers/youtubePlatformDate.controller';
import { authMiddleware } from '../middleware/auth';
import { Router } from 'express';

const youtubePlatformData = Router();

youtubePlatformData.get('/youtube/analytics', authMiddleware, getYoutubeAnalytics);

export { youtubePlatformData };
