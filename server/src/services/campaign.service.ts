import { Campaign } from "../models/campaign.models";
import {
  ICampaign,
  IInfluencer,
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
import { CampaignPerformance } from "../models/campaignAnalytics.models";
import { Influencer } from "../models/influencers.models";

export class CampaignProvider {
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

      const campaigns = await Campaign.find({ brandId: brandId })
        .populate({
          path: "brandId",
          select: "firstName lastName -role",
        })
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
      if (error instanceof ResourceNotFound) {
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
      if (error instanceof ResourceNotFound || error instanceof InvalidInput) {
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
    payload: Partial<ICampaign>
  ): Promise<ServiceResponse<ICampaign>> {
    try {
      if (!isValidObjectId(brandId.toString()))
        throw new BadRequest("Invalid brand ID");
      if (!isValidObjectId(campaignId.toString()))
        throw new BadRequest("Invalid campaign ID");

      console.log(...payload.influencerId, "acceptInfluencer");
      const campaign = await Campaign.findOneAndUpdate(
        { _id: campaignId, brandId: brandId },
        {
          $pull: {
            applications: {
              influencerId: new mongoose.Types.ObjectId(
                ...payload.influencerId!.toString()
              ),
            },
          },
        },
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
      if (error instanceof ResourceNotFound || error instanceof InvalidInput) {
        throw error;
      }
      throw new Error(`Error updating campaign: ${error.message}`);
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
    payload: Partial<ICampaign>
  ): Promise<ServiceResponse<ICampaign>> {
    const influencerId = payload.influencerId[0];
    try {
      if (!isValidObjectId(brandId.toString()))
        throw new BadRequest("Invalid brand ID");
      if (!isValidObjectId(campaignId.toString()))
        throw new BadRequest("Invalid campaign ID");
      if (!isValidObjectId(influencerId.toString()))
        throw new BadRequest("Invalid infulencer ID");

      // console.log(
      //   typeof influencerId,
      //   isValidObjectId(influencerId.toString()),
      //   "acceptInfluencer"
      // );

      const campaign = await Campaign.findOneAndUpdate(
        { _id: campaignId, brandId: brandId },
        {
          $addToSet: {
            influencerId: new mongoose.Types.ObjectId(
              influencerId.toString()
              // ...payload.influencerId.toString()
            ),
          },
          $pull: {
            applications: {
              influencerId: new mongoose.Types.ObjectId(
                influencerId.toString()
                // ...payload.influencerId!.toString()
              ),
            },
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
      if (error instanceof ResourceNotFound || error instanceof InvalidInput) {
        throw error;
      }
      console.log("acceptInfluencer", error);
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
      if (error instanceof ResourceNotFound || error instanceof InvalidInput) {
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
      if (error instanceof ResourceNotFound || error instanceof InvalidInput) {
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
  ): Promise<ServiceResponse<Partial<ICampaign>>> {
    try {
      if (!isValidObjectId(campaignId.toString()))
        throw new BadRequest("Invalid campaign ID");
      if (!isValidObjectId(influencerId.toString()))
        throw new BadRequest("Invalid influencer ID");

      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new ResourceNotFound("Campaign not found");
      }

      const influencer = await Influencer.findById(influencerId);
      if (!influencer) {
        throw new ResourceNotFound("Influencer not found");
      }

      const hasApplied = await campaign.applications.some(
        (application) =>
          application.influencerId.toString() === influencerId.toString()
      );

      const isEnrolled = await campaign.influencerId.some(
        (influencer) => influencer.toString() === influencerId.toString()
      );

      console.log(
        "applyToCampaign service:",
        campaign,
        "\n is enrolled: ",
        isEnrolled,
        "hasApplied: ",
        hasApplied
      );

      if (hasApplied) {
        throw new BadRequest("Influencer has already applied to this campaign");
      }

      if (isEnrolled) {
        throw new BadRequest("Influencer is already enrolled to this campaign");
      }

      const application = {
        influencerId: new mongoose.Types.ObjectId(influencerId),
        message: message,
        offer: offer,
        appliedAt: new Date(),
      };
      console.log("applyToCampaign", application, "message", message);

      const responseResult = await Campaign.findByIdAndUpdate(
        campaignId,
        { $push: { applications: application } },
        { new: true }
      );

      return {
        status_code: 200,
        message: "Application sent successfully",
        data: responseResult,
      };
    } catch (error) {
      if (error instanceof ResourceNotFound || error instanceof InvalidInput) {
        throw error;
      }
      throw new Error(`Error sending application: ${error.message}`);
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
  ): Promise<ServiceResponse<any>> {
    // Validate the IDs
    if (!isValidObjectId(brandId)) throw new BadRequest("Invalid Campaign ID");
    if (!isValidObjectId(influencerId))
      throw new BadRequest("Invalid influencer ID");

    const campaigns = await Campaign.find({
      brandId: brandId,
      "applications.influencerId": influencerId,
    });

    if (!campaigns || campaigns.length === 0) {
      throw new ResourceNotFound(
        "No campaigns found that the influencer applied for under this brand"
      );
    }

    return {
      status_code: 200,
      message: "Campaigns retrieved successfully",
      data: campaigns,
    };
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
      if (error instanceof ResourceNotFound || error instanceof InvalidInput) {
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
      if (error instanceof ResourceNotFound || error instanceof InvalidInput) {
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
  ): Promise<ServiceResponse<any>> {
    try {
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");

      const campaigns = await Campaign.find({
        "applications.influencerId": influencerId,
      });

      if (!campaigns || campaigns.length === 0) {
        throw new ResourceNotFound(
          "No campaigns found that the influencer applied for"
        );
      }

      return {
        status_code: 200,
        message: "Campaigns retrieved successfully",
        data: campaigns,
      };
    } catch (error) {
      if (error instanceof ResourceNotFound || error instanceof InvalidInput) {
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
  ): Promise<ServiceResponse<any>> {
    try {
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");
      if (!isValidObjectId(campaignId))
        throw new BadRequest("Invalid campaign ID");

      const campaign = await Campaign.findById(campaignId);
      if (!campaign) throw new ResourceNotFound("Campaign not found");

      const influencer = await Influencer.findById(influencerId);
      if (!influencer) throw new ResourceNotFound("Influencer not found");

      const applicationIndex = campaign.applications.findIndex(
        (application) =>
          application.influencerId.toString() === influencerId.toString()
      );

      if (applicationIndex === -1) {
        throw new ResourceNotFound("Application not found");
      }

      const application = campaign.applications[applicationIndex];

      const currentTime = new Date();
      const applicationTime = new Date(application.appliedAt);
      const hoursSinceApplied =
        (currentTime.getTime() - applicationTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceApplied > 5) {
        throw new BadRequest(
          "Application can only be edited within 5 hours of applying"
        );
      }
      if (message !== undefined) {
        campaign.applications[applicationIndex].message = message;
      }
      if (offer !== undefined) {
        campaign.applications[applicationIndex].offer = offer;
      }

      campaign.applications[applicationIndex].lastEditedAt = new Date();
      await campaign.save();

      return {
        status_code: 200,
        message: "Application edited successfully",
        data: campaign.applications[applicationIndex],
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
  ): Promise<ServiceResponse<any>> {
    try {
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");
      if (!isValidObjectId(campaignId))
        throw new BadRequest("Invalid campaign ID");

      const campaign = await Campaign.findById(campaignId);

      if (!campaign) throw new ResourceNotFound("Campaign not found");

      const application = campaign.applications.find(
        (application) => application.influencerId.toString() === influencerId
      );

      if (!application)
        throw new ResourceNotFound("You have not applied to this campaign");

      return {
        status_code: 200,
        message: "Application retrieved successfully",
        data: application,
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
  ): Promise<ServiceResponse<any>> {
    try {
      if (!isValidObjectId(influencerId))
        throw new BadRequest("Invalid influencer ID");

      const influencer = await Influencer.findById(influencerId);
      if (!influencer) throw new ResourceNotFound("Influencer not found");

      const campaigns = await Campaign.find({
        "applications.influencerId": influencerId,
      });

      const allApplications = [];

      campaigns.forEach((campaign) => {
        const applications = campaign.applications.filter(
          (app) => app.influencerId.toString() === influencerId.toString()
        );

        applications.forEach((app) => {
          allApplications.push({
            campaignId: campaign._id,
            application: app,
          });
        });
      });

      return {
        status_code: 200,
        message: "Applications retrieved successfully",
        data: allApplications,
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
}
