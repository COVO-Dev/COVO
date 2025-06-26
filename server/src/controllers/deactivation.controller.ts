import { Request, Response } from "express";
import { DeactivationService } from "../services/deactivation.service";
import { asyncHandler, sendJsonResponse } from "../middleware/helper";
import { BadRequest } from "../middleware/errors";
import getUserData from "../middleware/helper";

const deactivationService = new DeactivationService();

export class DeactivationController {
  /**
   * Deactivate user account controller method
   */

  public deactivateUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { deactivationReason } = req.body;
    const userData = getUserData(req);

    if (!userData) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    console.log(
      "deactivateUser service userData \n",
      userData,
      userId,
      deactivationReason,
      req.body
    );

    if (userId !== userData.userId) {
      throw new BadRequest("You are not authorized to deactivate this user account");
    }

    const { status_code, message, data } =
      await deactivationService.deactivateUserAccount(
        userId,
        deactivationReason
      );
    sendJsonResponse(res, status_code, message, data);
  });

  /**
   * Activate user account controller method
   */

  public reactivateUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const userData = getUserData(req);

    if (!userData) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (userId !== userData.userId) {
      throw new BadRequest("You are not authorized to reactivate this user account");
    }

    const { status_code, message, data } =
      await deactivationService.reactivateUserAccount(userId);
    sendJsonResponse(res, status_code, message, data);
  });

  /**
   * Disconnect social media account.
   */
  public disconnectSocialMedia = asyncHandler(async (req: Request, res: Response) => {
    const { influencerId, platform } = req.body;
    const userData = getUserData(req);

    if (!userData) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (influencerId !== userData.userId) {
      throw new BadRequest("You are not authorized to disconnect this social media account");
    }

    const { status_code, message, data } =
      await deactivationService.disconnectSocialPlatform(influencerId, platform);
    sendJsonResponse(res, status_code, message, data);
  });
}
