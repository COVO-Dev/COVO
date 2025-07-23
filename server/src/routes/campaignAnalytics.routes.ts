import express from 'express';
import { getCampaignAnalytics } from '../controllers/campaignAnalytics.controller';

const campaignAnalyticsRouter = express.Router();

campaignAnalyticsRouter.get('/campaign/:campaignId/analytics', getCampaignAnalytics);

export default campaignAnalyticsRouter;
