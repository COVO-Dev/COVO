import { Request, Response } from "express";
import { CampaignMilestoneService } from "../services/campaignMilestone.service";
import { UserRole } from "../types/enum";
import { asyncHandler, sendJsonResponse } from "../middleware/helper";

// Extend Express Request interface to include 'user'
declare global {
    namespace Express {
        interface User {
            userId?: string;
            role?: UserRole;
        }
        interface Request {
            user?: User;
        }
    }
}

const milestoneService = new CampaignMilestoneService();

export class MilestoneController {

    /**
     * Handles the creation of a new campaign milestone.
     * Validates the user role and ensures the milestone data is correct.
     */

    public createMilestone = asyncHandler(async (req: Request, res: Response) => {
        const userRole = req.user?.role;
        const userId = req.user?.userId;
        const milestoneData = req.body;
        const result = await milestoneService.createMilestone(milestoneData, userRole, userId);
        sendJsonResponse(res, result.status_code, result.message, result.data);
    })

    /**
     * Handles the update of an existing campaign milestone.
     * Validates the user role and ensures the updates are correct.
     */

    public updateMilestone = asyncHandler(async (req: Request, res: Response) => {
        const userRole = req.user?.role;
        const milestoneId = req.params.id;
        const updates = req.body;
        const result = await milestoneService.updateMilestone(milestoneId, updates, userRole);
        sendJsonResponse(res, result.status_code, result.message, result.data);
    })

    /**
     * Handles the deletion of a campaign milestone.
     * Validates the user role and ensures the milestone can be deleted.
     */

    public deleteMilestone = asyncHandler(async (req: Request, res: Response) => {
        const userRole = req.user?.role;
        const milestoneId = req.params.id;
        const result = await milestoneService.deleteMilestone(milestoneId, userRole);
        sendJsonResponse(res, result.status_code, result.message, result.data);
    });

    /**
     * Retrieves all milestones for a specific campaign and influencer.
     * Validates the user role and ensures the campaign and influencer exist.
     */

    public getMilestone = asyncHandler(async (req: Request, res: Response) => {
        const { campaignId, influencerId } = req.params;
        const result = await milestoneService.getMilestones(campaignId, influencerId);
        sendJsonResponse(res, result.status_code, result.message, result.data);
    });

    /**
     * Checks the status of a milestone for an influencer.
     * Validates the user role and ensures the influencer can check the milestone.
     */

    public influencerCheckMilestone = asyncHandler(async (req: Request, res: Response) => {
        const userRole = req.user?.role;
        const { milestoneId, influencerId } = req.params;
        const result = await milestoneService.influencerCheckMilestone(milestoneId, influencerId, userRole);
        sendJsonResponse(res, result.status_code, result.message, result.data);
    });

    /**
     * Checks the status of a milestone for a brand.
     * Validates the user role and ensures the brand can check the milestone.
     */

    public brandCheckMilestone = asyncHandler(async (req: Request, res: Response) => {
        const userRole = req.user?.role;
        const { milestoneId } = req.params;
        const result = await milestoneService.brandCheckMilestone(milestoneId, userRole);
        sendJsonResponse(res, result.status_code, result.message, result.data);
    });
}
