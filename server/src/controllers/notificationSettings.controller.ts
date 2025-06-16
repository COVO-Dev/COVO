import { Request, Response } from "express";
import { asyncHandler, sendJsonResponse } from "../middleware/helper";
import { NotificationSettingsService } from "../services/notificationSettings.service";
import { BadRequest } from '../middleware/errors'
import getUserData from '../middleware/helper';


const notificationSettingsService = new NotificationSettingsService();

export class NotificationSettings {

  /**
   * Gets the notification settings for a user
   */
  public getNotificationSettings = asyncHandler(
    async (req: Request, res: Response) => {
      const { recipientId } = req.params;
      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated ");
      }

      if (recipientId !== userData.userId) {
        throw new BadRequest("You are not authorized to view this notification seetings");
      }
      
      const { message, status_code, data } =
        await notificationSettingsService.getNotificationSettings(
          recipientId,
        );
      sendJsonResponse(res, status_code, message, data);
    }
  );

  /**
   * updates the notification settings for a user
   */
  public updateNotificationSettings = asyncHandler(
    async (req: Request, res: Response) => {
      const { recipientId } = req.params;
      const { settings } = req.body;
      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }


      if (recipientId !== userData.userId) {
        throw new BadRequest("You are not authorized to update this notification settings");
      }
      const { message, data, status_code } =
        await notificationSettingsService.updateNotificationSettings(
          recipientId,
          settings,
        );
      sendJsonResponse(res, status_code, message, data);
    }
  );

  /**
   * Reset the notification settings for a user to default
   */

  public resetNotificationSettings = asyncHandler(
    async (req: Request, res: Response) => {
      const { recipientId } = req.params;
      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }

      if (recipientId !== userData.userId) {
        throw new BadRequest("You are not authorized to reset this notification settings");
      }
      
      const { message, data, status_code } =
        await notificationSettingsService.resetNotificationSettings(
          recipientId,
        );
      sendJsonResponse(res, status_code, message, data);
    });
}
