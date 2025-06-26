
import {
    ResourceNotFound,
    BadRequest,
    InvalidInput,
    HttpError,
} from "../middleware/errors";
import { Milestone } from "../models/campaignMilestone.model";
import { Campaign } from "../models/campaign.models";
import { IMilestone, ServiceResponse } from "../types";
import { UserRole } from "../types/enum";
import { User } from "../models/users.models";


export class CampaignMilestoneService {

    /**
     * Create a new milestone for a campaign and influencer.
     * @param data 
     * @returns 
     */

    public async createMilestone(
        data: IMilestone,
        userRole: UserRole,
        userId: string
    ): Promise<ServiceResponse<IMilestone>> {
        try {
            if (userRole !== UserRole.Brand) {
                throw new BadRequest("Only brands can create milestones");
            }
            const { description, dueDate, influencerId, campaignId } = data;

            if (!description || !dueDate || !influencerId || !campaignId) {
                throw new InvalidInput("Missing required fields");
            }

            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new ResourceNotFound("Campaign not found");
            }

            console.log("userId", userId);
            console.log("campaign.brandId", campaign.brandId);

            if (!campaign.brandId.equals(userId)) {
                throw new BadRequest("You are not authorized to create milestones for this campaign");
            }

            const influencerAccepted = campaign.influencerId?.some((id) =>
                id.equals(influencerId)
            );

            if (!influencerAccepted) {
                throw new BadRequest("Influencer not accepted in this campaign");
            }

            const milestone = new Milestone({
                ...data,
                influencerChecked: false,
                brandChecked: false,
            });

            await milestone.save();

            return {
                status_code: 201,
                message: "Milestone created successfully",
                data: milestone,
            }
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            }
            throw new BadRequest("Failed to create milestone");
        }
    }

    /**
     * Get all milestones for a specific campaign.
     * @param campaignId 
     * @returns 
     */

    public async getMilestones(campaignId: string, influencerId?: string): Promise<ServiceResponse<IMilestone[]>> {
        try {
            const query: any = { campaignId };

            if (influencerId) query.influencerId = influencerId;

            if (!campaignId) {
                throw new InvalidInput("Campaign ID is required");
            }

            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                throw new ResourceNotFound("Campaign not found");
            }

            const milestones = await Milestone.find(query).sort({ dueDate: 1 });
            if (milestones.length === 0) {
                throw new ResourceNotFound("No milestones found for this campaign");
            }

            return {
                status_code: 200,
                message: "Milestones retrieved successfully",
                data: milestones,
            }

        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            }
            throw new BadRequest("Failed to retrieve milestones");
        }
    }

    /**
     * Check a milestone by influencer.
     * This marks the milestone as checked by the influencer.
     * @param milestoneId 
     * @param influencerId 
     * @returns the updated milestone
     */

    public async influencerCheckMilestone(
        milestoneId: string,
        influencerId: string,
        userRole: UserRole
    ): Promise<ServiceResponse<IMilestone>> {
        try {

            if (userRole !== UserRole.Influencer) {
                throw new BadRequest("Only brands can create milestones");
            }

            if (!milestoneId || !influencerId) {
                throw new InvalidInput("Milestone ID and Influencer ID are required");
            }

            const milestone = await Milestone.findById(milestoneId);
            if (!milestone) {
                throw new ResourceNotFound("Milestone not found");
            }

            if (milestone.influencerId.toString() !== influencerId) {
                throw new BadRequest("This milestone does not belong to the influencer");
            }

            milestone.influencerChecked = true;
            await milestone.save();

            return {
                status_code: 200,
                message: "Milestone checked successfully",
                data: milestone,
            }
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            }
            throw new BadRequest("Failed to check milestone");
        }
    }

    /**
     *  Check a milestone by brand.
     * This marks the milestone as checked by the brand.
     * @param milestoneId  the ID of the milestone to be checked by the brand.
     * @returns  the updated milestone after brand check.
     */

    public async brandCheckMilestone(
        milestoneId: string,
        userRole: UserRole,
    ): Promise<ServiceResponse<IMilestone>> {
        try {

            if (userRole !== UserRole.Brand) {
                throw new BadRequest("You are not authorized to check this milestone");
            }

            if (!milestoneId) {
                throw new InvalidInput("Milestone ID is required");
            }

            const milestone = await Milestone.findById(milestoneId);
            if (!milestone) {
                throw new ResourceNotFound("Milestone not found");
            }

            if (!milestone.influencerChecked) {
                throw new BadRequest("Milestone must be checked by influencer first");
            }

            milestone.brandChecked = true;
            await milestone.save();

            return {
                status_code: 200,
                message: "Milestone checked successfully",
                data: milestone,
            }
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            }
            throw new BadRequest("Failed to check milestone");
        }
    }

    public async updateMilestone(
        milestoneId: string,
        updates: Partial<IMilestone>,
        userRole: UserRole,
    ): Promise<ServiceResponse<IMilestone>> {
        try {
            if (userRole !== UserRole.Brand) {
                throw new BadRequest("Only brands can update milestones");
            }

            if (!milestoneId) {
                throw new InvalidInput("Milestone ID is required");
            }

            const milestone = await Milestone.findById(milestoneId);
            if (!milestone) {
                throw new ResourceNotFound("Milestone not found");
            }

            const allowedFields = ["description", "dueDate", "notes"];
            for (const key of allowedFields) {
                if (updates[key as keyof IMilestone] !== undefined) {
                    (milestone as any)[key] = updates[key as keyof IMilestone];
                }
            }
            await milestone.save();

            return {
                status_code: 200,
                message: "Milestone updated successfully",
                data: milestone,
            }
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            }
            throw new BadRequest("Failed to update milestone");
        }
    }


    public async deleteMilestone(
        milestoneId: string,
        userRole: UserRole,
    ): Promise<ServiceResponse<null>> {
        try {
            if (userRole !== UserRole.Brand) {
                throw new BadRequest("Only brands can delete milestones");
            }

            if (!milestoneId) {
                throw new InvalidInput("Milestone ID is required");
            }

            const milestone = await Milestone.findByIdAndDelete(milestoneId);
            if (!milestone) {
                throw new ResourceNotFound("Milestone not found");
            }

            return {
                status_code: 200,
                message: "Milestone deleted successfully",
                data: null,
            }
        } catch (error) {
            if (error instanceof HttpError) {
                throw error;
            }
            throw new BadRequest("Failed to delete milestone");
        }
    }
}