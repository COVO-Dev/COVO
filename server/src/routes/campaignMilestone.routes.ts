import express from "express";
import { authMiddleware } from "../middleware/auth";
import { MilestoneController } from "../controllers/campaignMilestone.controller";
const milestoneRouter = express.Router();
const milestoneController = new MilestoneController();

milestoneRouter.post(
  "/milestones",
  authMiddleware,
  milestoneController.createMilestone
);

milestoneRouter.put(
  "/milestones/:id",
  authMiddleware,
  milestoneController.updateMilestone
);

milestoneRouter.delete(
  "/milestones/:id",
  authMiddleware,
  milestoneController.deleteMilestone
);
milestoneRouter.get(
  "/milestones/:campaignId/:influencerId?",
  authMiddleware,
  milestoneController.getMilestone
);

milestoneRouter.put(
  "/milestones/influencer-check/:milestoneId/:influencerId",
  authMiddleware,
  milestoneController.influencerCheckMilestone
);
milestoneRouter.put(
  "/milestones/brand-check/:milestoneId",
  authMiddleware,
  milestoneController.brandCheckMilestone
);
export { milestoneRouter };

