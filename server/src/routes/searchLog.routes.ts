import { Router } from 'express';
import { searchLog } from '../controllers/searchLog.controller';
import { authMiddleware } from '../middleware/auth';

const searchLogRoute = Router();

searchLogRoute.post('/search-influencers', authMiddleware, searchLog);

export { searchLogRoute };
