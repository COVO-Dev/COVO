import { Campaign } from "../models/campaign.models";
import {
  ICampaign,
  IInfluencer,
  IInvitation,
  IRecommendedInfluencer,
  SearchResponse,
  ServiceResponse,
} from "../types";
import { Brand } from "../models/brands.models";
import {
  ResourceNotFound,
  BadRequest,
  InvalidInput,
  HttpError,
} from "../middleware/errors";
import mongoose from "mongoose";
import { isValidObjectId } from "../utils/valid";
import { CampaignValidationSchema } from "../schema/auth.schema";
import { ZodSchema } from "zod";
import { Influencer } from "../models/influencers.models";
import { Invitation } from "../models/invitation.models";

export class CampaignProvider {
  private isFollowerCountValidForType(followers: number): string {
    if (followers >= 1000 && followers < 10000) return "Nano";
    if (followers >= 10000 && followers < 100000) return "Micro";
    if (followers >= 100000 && followers < 1000000) return "Macro";
    if (followers >= 1000000) return "Mega";
    return "Unknown";
  }

  /**
   * Reusable method to validate payload using Zod schema.
   */

  private validatePayload(payload: any, schema: ZodSchema) {
    const result = schema.safeParse(payload);
    console.log("validatePayload service: ", result);
    if (!result.success) {
      const errorMessages = result.error.errors
        .map((err) => `${err.path.join(".")} ${err.message}`)
        .join(", ");
      console.log("validatePayload service failure error: ", errorMessages);
      throw new HttpError(400, errorMessages);
    }
  }

  /**
   * Get all campaigns
   *
   * @param brandId The id of the brand
   * @returns A promise that resolves to an array of campaigns
   */
  public async getAllCampaignsNoId(
    page: number = 1,
    limit: number = 10
  ): Promise<SearchResponse<ICampaign>> {
    try {
      const skip = (page - 1) * limit;

      const campaigns = await Campaign.find()
        .populate({
          path: "brandId",
          select: "firstName lastName -role",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      if (campaigns.length === 0) {
        throw new ResourceNotFound("No campaigns found for this brand");
      }
      console.log(
        "service getAllCampaignsNoId brand ID:",
        campaigns[0].brandId
      );

      const totalCampaigns = await Campaign.countDocuments();

      const totalPages = Math.ceil(totalCampaigns / limit);

      return {
        status_code: 200,
        message: "Campaigns retrieved successfully",
        data: {
          data: campaigns,
          totalPages,
          totalCount: totalCampaigns,
          currentPage: page,
        },
      };
    } catch (error) {
      if (error instanceof ResourceNotFound) {
        throw error;
      }
      throw new Error(`Error retrieving campaigns: ${error.message}`);
    }
  }

  /**
   * Create a new campaign
   *
   * @param payload The campaign data to be saved
   * @returns A promise that resolves to the created campaign object
   */
  public async createCampaign(
    brandId: string,
    payload: ICampaign
  ): Promise<ServiceResponse<ICampaign>> {
    console.log("createCampaign service: ", brandId, payload);
    this.validatePayload(payload, CampaignValidationSchema);
    try {
      if (!isValidObjectId(brandId)) {
        throw new BadRequest("Invalid brand ID");
      }

      const { brandId: ignored, ...campaignDetails } = payload;

      const campaignData = {
        ...campaignDetails,
        brandId: new mongoose.Types.ObjectId(brandId),
      };

      const brandExists = await Brand.findById(brandId);
      if (!brandExists) {
        throw new BadRequest("Brand not found");
      }

      const newCampaign = new Campaign(campaignData);
      const campaign = await newCampaign.save();

      await Brand.findByIdAndUpdate(
        brandId,
        { $push: { campaigns: campaign._id } },
        { new: true }
      );

      return {
        status_code: 201,
        message: "Campaign created successfully",
        data: await campaign.populate("brandId influencerId"),
      };
    } catch (error) {
      if (error instanceof BadRequest) {
        throw error;
      }
      console.log(error);
      throw new Error(`Error creating campaign: ${error.message}`);
    }
  }

  /**
   * Get all campaigns by associated to a brand
   *
   * @param brandId The id of the brand to fetch campaigns
   * @returns A promise that resolves to an array of campaigns
   */
  public async getAllCampaigns(
    brandId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<SearchResponse<ICampaign>> {
    try {
      if (!isValidObjectId(brandId.toString()))
        throw new BadRequest("Invalid brand ID");

      const skip = (page - 1) * limit;

      const campaigns = await Campaign.find({
        brandId: brandId,
        status: "active",
      })
        .populate({
          path: "brandId",
          select: "firstName lastName -role",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      if (campaigns.length === 0) {
        throw new ResourceNotFound("No campaigns found for this brand");
      }

      const totalCampaigns = await Campaign.countDocuments({
        brandId: brandId,
      });
      const totalPages = Math.ceil(totalCampaigns / limit);

      return {
        status_code: 200,
        message: "Campaigns retrieved successfully",
        data: {
          data: campaigns,
          totalPages,
          totalCount: totalCampaigns,
          currentPage: page,
        },
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof BadRequest ||
        error instanceof InvalidInput
      ) {
        throw error;
      }
      throw new Error(`Error retrieving campaigns: ${error.message}`);
    }
  }

  /**
   * Get a campaign by its id
   *
   * @param brandId The id of the brand associated to the campaign
   * @param campaignId The id of the campaign to be fetched
   * @returns A promise that resolves to the fetched campaign object
   */

  public async getCampaignById(
    brandId: string,
    campaignId: string
  ): Promise<ServiceResponse<ICampaign>> {
    // console.log("getCampaignByID: service", brandId);
    try {
      if (!isValidObjectId(brandId.toString()))
        throw new BadRequest("Invalid brand ID");
      if (!isValidObjectId(campaignId.toString()))
        throw new BadRequest("Invalid campaign ID");

      const campaign = await Campaign.findOne({
        _id: campaignId,
        brandId: brandId,
      }).populate([
        {
          path: "applications",
          // select: "influencerId -_id",
          populate: {
            path: "influencerId",
            select: "_id firstName lastName -role",
          },
        },
        {
          // path: "influencerId  applications.influencerId",
          path: "influencerId",
          select: "-password -__v",
        },
      ]);

      if (!campaign) {
        throw new ResourceNotFound(
          "Campaign not found for the specified brand"
        );
      }

      return {
        status_code: 200,
        message: "Campaign retrieved successfully",
        data: campaign,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof BadRequest ||
        error instanceof InvalidInput
      ) {
        throw error;
      }
      throw new Error(`Error retrieving campaign: ${error.message}`);
    }
  }

  /**
   * Edit a campaign by rejecting an influencer
   *
   * @param brandId The id of the brand associated to the campaign
   * @param campaignId The id of the campaign to be updated
   * @param payload The updated campaign data
   * @returns A promise that resolves to the updated campaign object
   */

  public async rejectInfluencerForCampaign(
    brandId: string,
    campaignId: string,
    influencerId: string
  ): Promise<ServiceResponse<IInvitation>> {
    try {
      if (!isValidObjectId(brandId)) throw new BadRequest("Invalid brand ID");
      if (!isValidObjectId(campaignId))
        throw new BadRequest("Invalid campaign ID");
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");

      const invitation = await Invitation.findOneAndUpdate(
        { campaignId, influencerId, brandId },
        { status: "rejected" },
        { new: true }
      );

      if (!invitation) {
        throw new ResourceNotFound(
          "Application/invitation not found for this influencer and campaign."
        );
      }

      return {
        status_code: 200,
        message: "Influencer application rejected successfully",
        data: invitation,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof BadRequest ||
        error instanceof InvalidInput
      ) {
        throw error;
      }
      throw new Error(`Error rejecting application: ${error.message}`);
    }
  }

  /**
   * Edit a campaign by accepting an influencer
   *
   * @param brandId The id of the brand associated to the campaign
   * @param campaignId The id of the campaign to be updated
   * @param payload The updated campaign data
   * @returns A promise that resolves to the updated campaign object
   */

  public async acceptInfluencerForCampaign(
    brandId: string,
    campaignId: string,
    influencerId: string
  ): Promise<ServiceResponse<ICampaign>> {
    try {
      if (!isValidObjectId(brandId)) throw new BadRequest("Invalid brand ID");
      if (!isValidObjectId(campaignId))
        throw new BadRequest("Invalid campaign ID");
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");

      const invitation = await Invitation.findOneAndUpdate(
        {
          campaignId,
          influencerId,
          brandId,
          status: "pending",
          sender: influencerId,
        },
        { status: "accepted" },
        { new: true }
      );

      if (!invitation) {
        throw new ResourceNotFound(
          "Pending application/invitation not found for this influencer."
        );
      }

      const campaign = await Campaign.findOneAndUpdate(
        { _id: campaignId, brandId: brandId },
        {
          $addToSet: {
            influencerId: new mongoose.Types.ObjectId(influencerId),
          },
        },
        { new: true }
      ).populate("brandId influencerId");

      if (!campaign) {
        throw new ResourceNotFound("Campaign not found for this brand");
      }

      return {
        status_code: 200,
        message: "Influencer added to campaign successfully",
        data: campaign,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof BadRequest ||
        error instanceof InvalidInput
      ) {
        throw error;
      }
      throw new Error(`Error updating campaign: ${error.message}`);
    }
  }

  /**
   * Update a campaign
   *
   * @param brandId The id of the brand associated to the campaign
   * @param campaignId The id of the campaign to be updated
   * @param payload The updated campaign data
   * @returns A promise that resolves to the updated campaign object
   */

  public async updateCampaign(
    brandId: string,
    campaignId: string,
    payload: Partial<ICampaign>
  ): Promise<ServiceResponse<ICampaign>> {
    try {
      if (!isValidObjectId(brandId.toString()))
        throw new BadRequest("Invalid brand ID");
      if (!isValidObjectId(campaignId.toString()))
        throw new BadRequest("Invalid campaign ID");

      const campaign = await Campaign.findOneAndUpdate(
        { _id: campaignId, brandId: brandId },
        { $set: payload },
        { new: true }
      ).populate("brandId influencerId");

      if (!campaign) {
        throw new ResourceNotFound("Campaign not found for this brand");
      }

      return {
        status_code: 200,
        message: "Campaign updated successfully",
        data: campaign,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof BadRequest ||
        error instanceof InvalidInput
      ) {
        throw error;
      }
      throw new Error(`Error updating campaign: ${error.message}`);
    }
  }

  /**
   * Delete a campaign
   *
   * @param brandid The id of the brand to be deleted
   * @param campaignId The id of the campaign to be deleted
   * @returns A promise that resolves to the deleted campaign object
   */

  public async deleteCampaign(
    brandId: string,
    campaignId: string
  ): Promise<ServiceResponse<ICampaign>> {
    try {
      if (!isValidObjectId(brandId.toString()))
        throw new BadRequest("Invalid brand ID");
      if (!isValidObjectId(campaignId.toString()))
        throw new BadRequest("Invalid campaign ID");

      const campaign = await Campaign.findOneAndUpdate(
        {
          _id: campaignId,
          brandId: brandId,
          is_deleted: { $ne: true },
        },
        {
          $set: { is_deleted: true },
        },
        { new: true }
      ).populate("brandId influencerId");

      if (!campaign) {
        throw new ResourceNotFound("Campaign not found for this brand");
      }

      return {
        status_code: 200,
        message: "Campaign deleted successfully",
        data: campaign,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof InvalidInput ||
        error instanceof BadRequest
      ) {
        throw error;
      }
      throw new Error(`Error deleting campaign: ${error.message}`);
    }
  }

  /**
   * Influencer apply to Campaign
   * @param campaignId The id of the campaign to be applied to
   * @param influencerId The id of the influencer applying
   * @param message The message sent by the influencer
   * @param offer The offer made by the influencer
   */

  public async applyToCampaign(
    campaignId: string,
    influencerId: string,
    message: string,
    offer: number | string
  ): Promise<ServiceResponse<IInvitation>> {
    try {
      if (!isValidObjectId(campaignId))
        throw new BadRequest("Invalid campaign ID");
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");

      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new ResourceNotFound("Campaign not found");
      }

      const influencer = await Influencer.findById(influencerId);
      if (!influencer) {
        throw new ResourceNotFound("Influencer not found");
      }

      const computedType = this.isFollowerCountValidForType(
        influencer.followers
      );

      // const allowedTypes = ["Nano", "Micro", "Macro", "Mega"];
      // if (!allowedTypes.includes(campaign.collaborationPreferences.type)) {
      //   throw new BadRequest("Campaign has invalid influencer type criteria");
      // }

      // if (campaign.collaborationPreferences.type !== computedType) {
      //   throw new BadRequest(
      //     `This campaign is only open to ${campaign.collaborationPreferences.type} influencers. You are categorized as ${computedType}.`
      //   );
      // }

      const existingInvitation = await Invitation.findOne({
        campaignId,
        influencerId,
      });
      if (existingInvitation) {
        throw new BadRequest("You have already applied to this campaign.");
      }

      const isEnrolled = campaign.influencerId.some(
        (id) => id.toString() === influencerId
      );
      if (isEnrolled) {
        throw new BadRequest("You are already enrolled in this campaign.");
      }

      const newInvitation = new Invitation({
        campaignId,
        influencerId,
        brandId: campaign.brandId,
        sender: influencerId,
        receiver: campaign.brandId,
        message,
        offer,
        status: "pending",
      });

      await newInvitation.save();
      console.log("applyToCampaign service: ", newInvitation);

      return {
        status_code: 200,
        message: "Application sent successfully",
        data: newInvitation,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof InvalidInput ||
        error instanceof BadRequest
      ) {
        throw error;
      }
      throw new Error(`Error sending application: ${error.message}`);
    }
  }

  /**
   * Brand invites an Influencer to a Campaign
   * @param campaignId The id of the campaign
   * @param brandId The id of the brand inviting
   * @param influencerId The id of the influencer being invited
   * @param message The message sent by the brand
   */
  public async inviteToCampaign(
    campaignId: string,
    brandId: string,
    influencerId: string,
    message?: string
  ): Promise<ServiceResponse<IInvitation>> {
    try {
      if (!isValidObjectId(campaignId))
        throw new BadRequest("Invalid campaign ID");
      if (!isValidObjectId(brandId)) throw new BadRequest("Invalid brand ID");
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");

      const campaign = await Campaign.findOne({ _id: campaignId, brandId });
      if (!campaign) {
        throw new ResourceNotFound("Campaign not found for this brand");
      }

      const influencer = await Influencer.findById(influencerId);
      if (!influencer) {
        throw new ResourceNotFound("Influencer not found");
      }

      const existingInvitation = await Invitation.findOne({
        campaignId,
        influencerId,
      });
      if (existingInvitation) {
        throw new BadRequest(
          "This influencer has already been invited to or has applied to this campaign."
        );
      }

      const isEnrolled = campaign.influencerId.some(
        (id) => id.toString() === influencerId
      );
      if (isEnrolled) {
        throw new BadRequest(
          "This influencer is already part of this campaign."
        );
      }

      const newInvitation = new Invitation({
        campaignId,
        influencerId,
        brandId,
        sender: brandId,
        receiver: influencerId,
        message,
        status: "pending",
      });

      await newInvitation.save();

      return {
        status_code: 200,
        message: "Invitation sent successfully",
        data: newInvitation,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof InvalidInput ||
        error instanceof BadRequest
      ) {
        throw error;
      }
      throw new Error(`Error sending invitation: ${error.message}`);
    }
  }

  /**
   * Retrieves campaigns for a specific brand that an influencer has applied to for brand.
   *
   * @param influencerId - The ID of the influencer (from the authenticated user).
   * @param brandId - The ID of the brand.
   * @returns A ServiceResponse containing the list of matching campaigns.
   */
  public async getCampaignsAppliedByInfluencerForBrand(
    influencerId: string,
    brandId: string
  ): Promise<ServiceResponse<ICampaign[]>> {
    try {
      if (!isValidObjectId(brandId)) throw new BadRequest("Invalid Brand ID");
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");

      const invitations = await Invitation.find({
        influencerId,
        brandId,
        sender: influencerId,
      }).select("campaignId");

      if (!invitations || invitations.length === 0) {
        throw new ResourceNotFound(
          "No applications found for this influencer under this brand"
        );
      }

      const campaignIds = invitations.map((inv) => inv.campaignId);

      const campaigns = await Campaign.find({
        _id: { $in: campaignIds },
      });

      return {
        status_code: 200,
        message: "Campaigns with applications retrieved successfully",
        data: campaigns,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof InvalidInput ||
        error instanceof BadRequest
      ) {
        throw error;
      }
      throw new Error(`Error retrieving campaigns: ${error.message}`);
    }
  }

  /**
   * Get recommended influencer for a given campaign based on the brand
   * @param brandId The id of the brand associated with the campaign
   * @param campaignId The id of the campaign to get recommendations
   * @returns A promise that resolves to the recommended influencers
   */

  public async getRecommendedInfluencers(
    brandId: string,
    campaignId: string
  ): Promise<ServiceResponse<any>> {
    try {
      if (!isValidObjectId(brandId.toString()))
        throw new BadRequest("Invalid brand ID");
      if (!isValidObjectId(campaignId.toString()))
        throw new BadRequest("Invalid campaign ID");

      const campaign = await Campaign.findOne({
        _id: campaignId,
        brandId: brandId,
      });

      if (!campaign) {
        throw new ResourceNotFound("Campaign not found for this brand");
      }

      if (!brandId) throw new ResourceNotFound("Brand not found.");

      const recommendedInfluencers = campaign.recommendedInfluencers.map(
        (rec: any) => ({
          influencer: rec.influencer,
          ...rec,
        })
      ) as IRecommendedInfluencer[];
      if (!recommendedInfluencers || recommendedInfluencers.length === 0) {
        throw new ResourceNotFound(
          "No recommended influencers found for this campaign"
        );
      }
      return {
        status_code: 200,
        message: "Recommended influencers retrieved successfully",
        data: recommendedInfluencers,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof InvalidInput ||
        error instanceof BadRequest
      ) {
        throw error;
      }
      throw new Error(`Error retrieving influencers: ${error.message}`);
    }
  }

  /**
   * Retrieves campaigns where a specific influencer has applied and got accepted
   * @param influencerId The ID of the influencer.
   */

  public async getCampaignsRegisteredByInfluencer(
    influencerId: string
  ): Promise<ServiceResponse<any>> {
    try {
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");

      const campaigns = await Campaign.find({
        influencerId: { $in: [influencerId] },
      }).populate({
        path: "brandId",
        select: "firstName lastName -role",
      });

      // const campaigns = await Campaign.find({
      //   influencerId: { id: influencerId },
      // });

      if (!campaigns || campaigns.length === 0) {
        throw new ResourceNotFound(
          "No campaigns found that the influencer is registered to"
        );
      }

      return {
        status_code: 200,
        message: "Campaigns retrieved successfully",
        data: campaigns,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof InvalidInput ||
        error instanceof BadRequest
      ) {
        throw error;
      }
      throw new Error(`Error retrieving campaigns: ${error.message}`);
    }
  }

  /**
   * Retrieves campaigns for a specific brand that an influencer has applied to for brand.
   * @param influencerId The ID of the influencer.
   */

  public async getCampaignsAppliedByInfluencer(
    influencerId: string
  ): Promise<ServiceResponse<ICampaign[]>> {
    try {
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");

      const invitations = await Invitation.find({
        influencerId,
        sender: influencerId,
      }).populate<{ campaignId: ICampaign | null }>("campaignId");

      if (!invitations || invitations.length === 0) {
        throw new ResourceNotFound(
          "No campaigns found that the influencer applied for"
        );
      }

      const campaigns = invitations
        .map((inv) => inv.campaignId)
        .filter((campaign): campaign is ICampaign => !!campaign);

      return {
        status_code: 200,
        message: "Campaigns with applications retrieved successfully",
        data: campaigns,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof InvalidInput ||
        error instanceof BadRequest
      ) {
        throw error;
      }
      throw new Error(`Error retrieving campaigns: ${error.message}`);
    }
  }

  /**
   * Edit the application applied by an influencer limited for only 5 hours.
   *
   * @param influencerId The ID of the influencer.
   * @param campaignId The ID of the campaign.
   * @param message The message of the application.
   * @param offer The offer made by the influencer.
   */

  public async editApplication(
    influencerId: string,
    campaignId: string,
    message?: string,
    offer?: number | string
  ): Promise<ServiceResponse<IInvitation>> {
    try {
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");
      if (!isValidObjectId(campaignId))
        throw new BadRequest("Invalid campaign ID");

      const invitation = await Invitation.findOne({
        influencerId,
        campaignId,
        sender: influencerId,
      });
      if (!invitation) throw new ResourceNotFound("Application not found");

      const currentTime = new Date();
      const applicationTime = new Date(invitation.appliedAt);
      const hoursSinceApplied =
        (currentTime.getTime() - applicationTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceApplied > 5) {
        throw new BadRequest(
          "Application can only be edited within 5 hours of applying"
        );
      }

      const updateData: {
        message?: string;
        offer?: number | string;
        [key: string]: any;
      } = {};
      if (message !== undefined) {
        updateData.message = message;
      }
      if (offer !== undefined) {
        updateData.offer = offer;
      }

      const updatedInvitation = await Invitation.findByIdAndUpdate(
        invitation._id,
        { $set: updateData },
        { new: true }
      );

      return {
        status_code: 200,
        message: "Application edited successfully",
        data: updatedInvitation,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof BadRequest ||
        error instanceof InvalidInput
      ) {
        throw error;
      }
      throw new Error(`Error editing application: ${error.message}`);
    }
  }

  /**
   * Get influencer application data
   * @param influencerId The id of the influencer
   * @param campaignId The id of the campaign
   */

  public async getInfluencerApplicationInCampaign(
    influencerId: string,
    campaignId: string
  ): Promise<ServiceResponse<IInvitation>> {
    try {
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");
      if (!isValidObjectId(campaignId))
        throw new BadRequest("Invalid campaign ID");

      const invitation = await Invitation.findOne({
        influencerId,
        campaignId,
        sender: influencerId,
      });

      if (!invitation)
        throw new ResourceNotFound("You have not applied to this campaign");

      return {
        status_code: 200,
        message: "Application retrieved successfully",
        data: invitation,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof BadRequest ||
        error instanceof InvalidInput
      ) {
        throw error;
      }
      throw new Error(`Error retrieving application: ${error.message}`);
    }
  }

  /**
   * Get all applications of an influencer
   * @param influencerId The id of the influencer
   */

  public async getAllInfluencerApplications(
    influencerId: string
  ): Promise<ServiceResponse<IInvitation[]>> {
    try {
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");

      const applications = await Invitation.find({
        influencerId,
        sender: influencerId,
      }).populate("campaignId");

      return {
        status_code: 200,
        message: "Applications retrieved successfully",
        data: applications,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof BadRequest ||
        error instanceof InvalidInput
      ) {
        throw error;
      }
      throw new Error(`Error retrieving applications: ${error.message}`);
    }
  }

  /**
   * Retrieves all invitations received by a specific influencer.
   * @param influencerId The ID of the influencer.
   * @param status Optional: Filter invitations by status (e.g., "pending", "accepted", "rejected").
   */
  public async getCampaignInvitationsByInfluencer(
    influencerId: string,
    status?: "pending" | "accepted" | "rejected"
  ): Promise<ServiceResponse<IInvitation[]>> {
    try {
      if (!isValidObjectId(influencerId)) {
        throw new BadRequest("Invalid influencer ID");
      }

      const query: any = { receiver: influencerId };
      if (status) {
        query.status = status;
      }

      const invitations = await Invitation.find(query)
        .populate({
          path: "campaignId",
          select: "title", // Only need the title of the campaign
        })
        .populate({
          path: "brandId", // Populate brandId to get brand name
          select: "firstName lastName", // Assuming brand name is firstName/lastName
        })
        .sort({ createdAt: -1 }); // Sort by most recent

      if (!invitations || invitations.length === 0) {
        throw new ResourceNotFound("No invitations found for this influencer.");
      }

      return {
        status_code: 200,
        message: "Invitations retrieved successfully",
        data: invitations,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof InvalidInput ||
        error instanceof BadRequest
      ) {
        throw error;
      }
      throw new Error(`Error retrieving invitations: ${error.message}`);
    }
  }

  /**
   * Influencer accepts a Campaign Invitation
   * @param influencerId The id of the influencer accepting
   * @param campaignId The id of the campaign
   * @param brandId The id of the brand that sent the invitation
   */
  public async acceptCampaignInvitation(
    influencerId: string,
    campaignId: string,
    brandId: string
  ): Promise<ServiceResponse<IInvitation>> {
    try {
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");
      if (!isValidObjectId(campaignId))
        throw new BadRequest("Invalid campaign ID");
      if (!isValidObjectId(brandId)) throw new BadRequest("Invalid brand ID");

      const invitation = await Invitation.findOneAndUpdate(
        {
          campaignId,
          influencerId,
          brandId,
          status: "pending",
          receiver: influencerId, // Ensure the influencer is the receiver
        },
        { status: "accepted" },
        { new: true }
      );

      if (!invitation) {
        throw new ResourceNotFound(
          "Pending invitation not found for this influencer."
        );
      }

      // Add influencer to the campaign's registered influencers
      const campaign = await Campaign.findOneAndUpdate(
        { _id: campaignId, brandId: brandId },
        {
          $addToSet: {
            influencerId: new mongoose.Types.ObjectId(influencerId),
          },
        },
        { new: true }
      ).populate("brandId influencerId");

      if (!campaign) {
        throw new ResourceNotFound("Campaign not found for this brand");
      }

      return {
        status_code: 200,
        message: "Invitation accepted and influencer registered to campaign",
        data: invitation,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof BadRequest ||
        error instanceof InvalidInput
      ) {
        throw error;
      }
      throw new Error(`Error accepting invitation: ${error.message}`);
    }
  }

  /**
   * Influencer declines a Campaign Invitation
   * @param influencerId The id of the influencer declining
   * @param campaignId The id of the campaign
   * @param brandId The id of the brand that sent the invitation
   */
  public async rejectCampaignInvitation(
    influencerId: string,
    campaignId: string,
    brandId: string
  ): Promise<ServiceResponse<IInvitation>> {
    try {
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");
      if (!isValidObjectId(campaignId))
        throw new BadRequest("Invalid campaign ID");
      if (!isValidObjectId(brandId)) throw new BadRequest("Invalid brand ID");

      const invitation = await Invitation.findOneAndUpdate(
        {
          campaignId,
          influencerId,
          brandId,
          status: "pending",
          receiver: influencerId, // Ensure the influencer is the receiver
        },
        { status: "rejected" },
        { new: true }
      );

      if (!invitation) {
        throw new ResourceNotFound(
          "Pending invitation not found for this influencer."
        );
      }

      return {
        status_code: 200,
        message: "Invitation declined successfully",
        data: invitation,
      };
    } catch (error) {
      if (
        error instanceof ResourceNotFound ||
        error instanceof BadRequest ||
        error instanceof InvalidInput
      ) {
        throw error;
      }
      throw new Error(`Error declining invitation: ${error.message}`);
    }
  }
}
