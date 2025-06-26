import { Request, Response } from "express";
import { InfluencerService } from "../services/influencer.service";
import { asyncHandler, sendJsonResponse } from "../middleware/helper";
import { BadRequest } from "../middleware/errors";
import getUserData from "../middleware/helper";

const influencerService = new InfluencerService();

export class InfluencerController {
  /**
   * Get influencer details by ID
   */
  public getInfluencerDetails = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }

      // if (id !== userData.userId) {
      //   throw new BadRequest(
      //     "You are not authorized to perform this operation"
      //   );
      // }

      const result = await influencerService.getInfluencerDetails({ id });
      // console.log("getInfluencerDetails controller: ", result);

      sendJsonResponse(res, result.status_code, result.message, result.data);
    }
  );

  /**
   * Get and update partial information about the user.
   */

  public getInfluencer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const userData = getUserData(req);

    if (!userData) {
      throw new BadRequest("You are not authenticated");
    }

    if (id !== userData.userId) {
      throw new BadRequest("You are not authorized to perform this operation");
    }

    const result = await influencerService.getInfluencerAndUpdate({
      id,
      ...payload,
    });
    sendJsonResponse(res, result.status_code, result.message, result.data);
  });

  /**
   * Update influencer details
   */
  public updateInfluencerController = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;

      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }

      if (id !== userData.userId) {
        throw new BadRequest(
          "You are not authorized to perform this operation"
        );
      }

      const result = await influencerService.updateInfluencer({
        id,
        ...req.body,
      });
      sendJsonResponse(res, result.status_code, result.message, result.data);
    }
  );

  /**
   * Search influencers with pagination.
   */
  public searchInfluencerController = async (req: Request, res: Response) => {
    const { username, primaryNiche, secondaryNiche, country } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
      const searchParams = {
        username: username?.toString(),
        primaryNiche: primaryNiche?.toString(),
        secondaryNiche: secondaryNiche?.toString(),
        country: country?.toString(),
      };

      const result = await influencerService.searchInfluencers(
        searchParams,
        page,
        limit
      );

      sendJsonResponse(res, result.status_code, result.message, result.data);
    } catch (error) {
      sendJsonResponse(res, error.status_code || 500, error.message);
    }
  };
}
