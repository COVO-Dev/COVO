import express from "express";
import { CampaignController } from "../controllers/campaign.controller";
import { authMiddleware } from "../middleware/auth";

const campaignRoute = express.Router();
const campaignController = new CampaignController();

campaignRoute.get(
	"/campaigns",
	authMiddleware,
	campaignController.getAllCampaigns
);

// POST create new campaign
campaignRoute.post(
	"/:brandId/campaigns",
	authMiddleware,
	campaignController.createCampaign
);

// get all brand campaigns
campaignRoute.get(
	"/:brandId/campaigns",
	authMiddleware,
	campaignController.getAllCampaignsByBrand
);

// get campaign by brand and campaign ID
campaignRoute.get(
	"/:brandId/campaign/:id",
	authMiddleware,
	campaignController.getCampaignById
);

// Edit campaign
campaignRoute.put(
	"/:brandId/campaign/:id",
	authMiddleware,
	campaignController.updateCampaign
);

// Reject influencer
campaignRoute.put(
	"/:brandId/campaign/:id/reject",
	authMiddleware,
	campaignController.rejectInfluencer
);

// Accept influencer
campaignRoute.put(
	"/:brandId/campaign/:id/accept",
	authMiddleware,
	campaignController.acceptInfluencer
);

campaignRoute.put(
	"/influencer/:influencerId/campaign/:id",
	authMiddleware,
	campaignController.editApplication
);

campaignRoute.get(
	"/influencer/:influencerId/campaign/:id/applications",
	authMiddleware,
	campaignController.getApplication
);

campaignRoute.get(
	"/influencer/:influencerId/applications",
	authMiddleware,
	campaignController.getApplications
);

campaignRoute.delete(
	"/:brandId/campaign/:id",
	authMiddleware,
	campaignController.deleteCampaign
);

campaignRoute.post(
	"/:influencerId/campaign/:id/apply",
	authMiddleware,
	campaignController.applyToCampaign
);

campaignRoute.get(
	"/:influencerId/campaigns/:brandId/applied",
	authMiddleware,
	campaignController.getAppliedCampaignsForBrand
);

campaignRoute.get(
	"/:brandId/campaigns/:id/recommended",
	authMiddleware,
	campaignController.getRecommendedInfluencers
);

// Campaigns registered with influencer route
campaignRoute.get(
	"/:influencerId/campaigns/registered",
	authMiddleware,
	campaignController.getRegisteredCampaignsForInfluencer
);

campaignRoute.get(
	"/:influencerId/campaigns/applied",
	authMiddleware,
	campaignController.getAppliedCampaignsForInfluencer
);

export { campaignRoute };
