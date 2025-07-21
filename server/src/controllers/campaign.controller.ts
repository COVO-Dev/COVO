import { Request, Response } from "express";
import { CampaignProvider } from "../services/campaign.service";
import { asyncHandler, sendJsonResponse } from "../middleware/helper";
import { BadRequest } from "../middleware/errors";
import { ChatService } from "../services/chat.service";
import getUserData from "../middleware/helper";
import mongoose from "mongoose";

const campaignService = new CampaignProvider();
const chatService = new ChatService();

export class CampaignController {
  /**
   * Get all campaigns
   */
  public getAllCampaigns = asyncHandler(async (req: Request, res: Response) => {
    // const { brandId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { message, data } = await campaignService.getAllCampaignsNoId(
      // brandId,
      page,
      limit
    );
    sendJsonResponse(res, 200, message, data);
  });

  /**
   * Get all brand campaign
   */
  public getAllCampaignsByBrand = asyncHandler(
    async (req: Request, res: Response) => {
      const { brandId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { message, data } = await campaignService.getAllCampaigns(
        brandId,
        page,
        limit
      );
      sendJsonResponse(res, 200, message, data);
    }
  );

  /**
   * Get a brand campaign details
   */
  public getCampaignById = asyncHandler(async (req: Request, res: Response) => {
    const { brandId, id: campaignId } = req.params;
    console.log("getCampaignById controller: ", brandId, campaignId);
    const userData = getUserData(req);

    if (!userData) {
      throw new BadRequest("You are not authenticated");
    }

    // if (brandId !== userData.userId) {
    //   console.log(brandId, userData.userId);
    //   throw new BadRequest(
    //     "You are not authorized to view this campaign details"
    //   );
    // }

    const { message, data } = await campaignService.getCampaignById(
      brandId,
      campaignId
    );
    console.log("getCampaignById controller: data", data);
    sendJsonResponse(res, 200, message, data);
  });

  /**
   * Create a new campaign. (Campaign builder)
   */
  public createCampaign = asyncHandler(async (req: Request, res: Response) => {
    const { brandId } = req.params;

    const userData = getUserData(req);

    if (!userData) {
      throw new BadRequest("You are not authenticated");
    }

    if (brandId !== userData.userId) {
      throw new BadRequest("You are not authorized to perform this operation");
    }
    const { message, data } = await campaignService.createCampaign(
      brandId,
      req.body
    );
    sendJsonResponse(res, 201, message, data);
  });

  /**
   * Delete a brand campaign.
   */
  public deleteCampaign = asyncHandler(async (req: Request, res: Response) => {
    const { brandId, id: campaignId } = req.params;

    const userData = getUserData(req);

    if (!userData) {
      throw new BadRequest("You are not authenticated");
    }

    if (brandId !== userData.userId) {
      throw new BadRequest(
        "You are not authorized to delete this campaign details"
      );
    }

    const { message, data } = await campaignService.deleteCampaign(
      brandId,
      campaignId
    );
    sendJsonResponse(res, 200, message, data);
  });

  /**
   * Reject Influencer in campaign
   */
  public rejectInfluencer = asyncHandler(
    async (req: Request, res: Response) => {
      const { brandId, id: campaignId } = req.params;
      const { influencerId } = req.body;
      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }

      if (brandId !== userData.userId) {
        throw new BadRequest(
          "You are not authorized to update this campaign details"
        );
      }

      if (!influencerId) {
        throw new BadRequest("Influencer ID is required.");
      }

      const { message, data } =
        await campaignService.rejectInfluencerForCampaign(
          brandId,
          campaignId,
          influencerId
        );
      sendJsonResponse(res, 200, message, data);
    }
  );

  /**
   * Accept Influencer in campaign
   */
  public acceptInfluencer = asyncHandler(
    async (req: Request, res: Response) => {
      const { brandId, id: campaignId } = req.params;
      const { influencerId } = req.body;
      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }

      if (brandId !== userData.userId) {
        throw new BadRequest(
          "You are not authorized to update this campaign details"
        );
      }

      if (!influencerId) {
        throw new BadRequest("Influencer ID is required.");
      }

      const { message, data } =
        await campaignService.acceptInfluencerForCampaign(
          brandId,
          campaignId,
          influencerId
        );

      const brandIDObject = new mongoose.Types.ObjectId(brandId);
      const influencerIDObject = new mongoose.Types.ObjectId(influencerId);

      const { data: chatData } = await chatService.createChatRoom([
        // brandId,
        // influencerId,
        brandIDObject,
        influencerIDObject,
      ]);
      console.log("acceptInfluencer controller: chatData", chatData);

      sendJsonResponse(
        res,
        200,
        "Accepted Influencer and created new chat room",
        data
      );
    }
  );

  /**
   * Update a brand campaign.
   */
  public updateCampaign = asyncHandler(async (req: Request, res: Response) => {
    const { brandId, id: campaignId } = req.params;
    const userData = getUserData(req);

    if (!userData) {
      throw new BadRequest("You are not authenticated");
    }

    if (brandId !== userData.userId) {
      throw new BadRequest(
        "You are not authorized to update this campaign details"
      );
    }

    const { message, data } = await campaignService.updateCampaign(
      brandId,
      campaignId,
      req.body
    );
    sendJsonResponse(res, 200, message, data);
  });

  /**
   * Haandles influencer applying to campaign
   */
  public applyToCampaign = asyncHandler(async (req: Request, res: Response) => {
    const { influencerId, id: campaignId } = req.params;
    const userData = getUserData(req);

    if (!userData) {
      throw new BadRequest("You are not authenticated");
    }

    if (influencerId !== userData.userId) {
      throw new BadRequest("You are not authorized to perform this operation");
    }

    const { offer, message } = req.body;
    console.log(
      "applyToCampaign controller: ",
      influencerId,
      campaignId,
      offer,
      message
    );
    const { message: serviceMessage, data } =
      await campaignService.applyToCampaign(
        campaignId,
        influencerId,
        message,
        offer
      );
    sendJsonResponse(res, 200, serviceMessage, data);
  });

  /**
   * Handles brand inviting an influencer to a campaign
   */
  public inviteToCampaign = asyncHandler(
    async (req: Request, res: Response) => {
      const { brandId, id: campaignId } = req.params;
      const { influencerId, message } = req.body;
      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }

      if (brandId !== userData.userId) {
        throw new BadRequest(
          "You are not authorized to perform this operation"
        );
      }

      if (!influencerId) {
        throw new BadRequest("Influencer ID is required");
      }

      const { message: serviceMessage, data } =
        await campaignService.inviteToCampaign(
          campaignId,
          brandId,
          influencerId,
          message
        );
      sendJsonResponse(res, 200, serviceMessage, data);
    }
  );

  /**
   * Controller to get campaigns under a specific brand that the influencer applied to.
   */
  public getAppliedCampaignsForBrand = asyncHandler(
    async (req: Request, res: Response) => {
      const { influencerId, brandId } = req.params;
      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }
      if (brandId !== userData.userId) {
        throw new BadRequest(
          "You are not authorized to perform this operation"
        );
      }
      const { message, data } =
        await campaignService.getCampaignsAppliedByInfluencerForBrand(
          influencerId,
          brandId
        );
      sendJsonResponse(res, 200, message, data);
    }
  );

  /**
   * Get recommended influencers for a campaign
   */
  public getRecommendedInfluencers = asyncHandler(
    async (req: Request, res: Response) => {
      const { brandId, id: campaignId } = req.params;

      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }

      if (brandId !== userData.userId) {
        throw new BadRequest(
          "You are not authorized to perform this operation"
        );
      }

      const { message, data } = await campaignService.getRecommendedInfluencers(
        brandId,
        campaignId
      );
      sendJsonResponse(res, 200, message, data);
    }
  );

  /**
   * Get the campaign registered with an influencer.
   */

  public getRegisteredCampaignsForInfluencer = asyncHandler(
    async (req: Request, res: Response) => {
      const { influencerId } = req.params;
      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }

      if (influencerId !== userData.userId) {
        throw new BadRequest(
          "You are not authorized to perform this operation"
        );
      }
      const { message, data } =
        await campaignService.getCampaignsRegisteredByInfluencer(influencerId);
      sendJsonResponse(res, 200, message, data);
    }
  );

  /**
   * Get the campaign applied by the influencer.
   */

  public getAppliedCampaignsForInfluencer = asyncHandler(
    async (req: Request, res: Response) => {
      const { influencerId } = req.params;
      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }

      if (influencerId !== userData.userId) {
        throw new BadRequest(
          "You are not authorized to perform this operation"
        );
      }
      const { message, data } =
        await campaignService.getCampaignsAppliedByInfluencer(influencerId);
      sendJsonResponse(res, 200, message, data);
    }
  );

  /**
   * Edit the application of the influencer.
   */

  public editApplication = asyncHandler(async (req: Request, res: Response) => {
    const { influencerId, id: campaignId } = req.params;
    const userData = getUserData(req);

    if (!userData) {
      throw new BadRequest("You are not authenticated");
    }

    if (influencerId !== userData.userId) {
      throw new BadRequest("You are not authorized to perform this operation");
    }

    const { message, offer } = req.body;

    const { message: dbMessage, data } = await campaignService.editApplication(
      influencerId,
      campaignId,
      message,
      offer
    );
    sendJsonResponse(res, 200, dbMessage, data);
  });

  /**
   * Get the application of the influencer.
   */

  public getApplication = asyncHandler(async (req: Request, res: Response) => {
    const { influencerId, id: campaignId } = req.params;
    const userData = getUserData(req);

    if (!userData) {
      throw new BadRequest("You are not authenticated");
    }

    if (influencerId !== userData.userId) {
      throw new BadRequest("You are not authorized to perform this operation");
    }

    const { message, data } =
      await campaignService.getInfluencerApplicationInCampaign(
        influencerId,
        campaignId
      );
    sendJsonResponse(res, 200, message, data);
  });

  /**
   * Get all the application of the influencer.
   */

  public getApplications = asyncHandler(async (req: Request, res: Response) => {
    const { influencerId } = req.params;
    const userData = getUserData(req);

    if (!userData) {
      throw new BadRequest("You are not authenticated");
    }

    if (influencerId !== userData.userId) {
      throw new BadRequest("You are not authorized to perform this operation");
    }

    const { message, data } =
      await campaignService.getAllInfluencerApplications(influencerId);
    sendJsonResponse(res, 200, message, data);
  });

  /**
   * Get all invitations received by an influencer.
   */
  public getCampaignInvitations = asyncHandler(
    async (req: Request, res: Response) => {
      const { influencerId } = req.params;
      const userData = getUserData(req);
      const status = req.query.status as
        | "pending"
        | "accepted"
        | "rejected"
        | undefined;

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }

      if (influencerId !== userData.userId) {
        throw new BadRequest(
          "You are not authorized to perform this operation"
        );
      }

      const { message, data } =
        await campaignService.getCampaignInvitationsByInfluencer(
          influencerId,
          status
        );
      sendJsonResponse(res, 200, message, data);
    }
  );

  /**
   * Influencer accepts a campaign invitation
   */
  public acceptCampaignInvitation = asyncHandler(
    async (req: Request, res: Response) => {
      const { influencerId, campaignId, brandId } = req.params; // Assuming brandId is also in params or body
      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }

      if (influencerId !== userData.userId) {
        throw new BadRequest(
          "You are not authorized to perform this operation"
        );
      }

      const { message, data } = await campaignService.acceptCampaignInvitation(
        influencerId,
        campaignId,
        brandId
      );

      const brandIDObject = new mongoose.Types.ObjectId(brandId);
      const influencerIDObject = new mongoose.Types.ObjectId(influencerId);

      const { data: chatData } = await chatService.createChatRoom([
        // brandId,
        // influencerId,
        brandIDObject,
        influencerIDObject,
      ]);

      // // Create a chat room between the brand and influencer
      // const { data: chatData } = await chatService.createChatRoom([
      //   // brandId,
      //   // influencerId,
      //   new Schema.ObjectId(brandId),
      //   new Schema.ObjectId(influencerId),
      // ]);

      console.log("acceptCampaignInvitation controller: chatData", chatData);

      sendJsonResponse(
        res,
        200,
        "Invitation accepted and chat room created",
        data
      );
    }
  );

  /**
   * Influencer declines a campaign invitation
   */
  public rejectCampaignInvitation = asyncHandler(
    async (req: Request, res: Response) => {
      const { influencerId, campaignId, brandId } = req.params; // Assuming brandId is also in params or body
      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }

      if (influencerId !== userData.userId) {
        throw new BadRequest(
          "You are not authorized to perform this operation"
        );
      }

      const { message, data } = await campaignService.rejectCampaignInvitation(
        influencerId,
        campaignId,
        brandId
      );
      sendJsonResponse(res, 200, message, data);
    }
  );
}
