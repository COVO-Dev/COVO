import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { asyncHandler, sendJsonResponse } from "../middleware/helper";
import { BadRequest } from '../middleware/errors'
import getUserData from '../middleware/helper';

const notificationService = new NotificationService();

export class NotificationController {

  /**
   * create a notification.
   */
  public createNotification = asyncHandler(
    async (req: Request, res: Response) => {
      const { senderId } = req.params;
      const { recipientId, ...notificationData } = req.body;

      console.log('Recieving ids in controller', senderId, recipientId, notificationData);

      const { message, status_code, data: notificationDataResponse } = await notificationService.createNotification(senderId, recipientId, notificationData);
  
      sendJsonResponse(res, status_code, message, notificationDataResponse);
    }
  );
  
  /**
   * Get notifications
   */

  public getNotifications = asyncHandler(
    async (req: Request, res: Response) => {
      const { recipientId } = req.params;

      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }


      if (recipientId !== userData.userId) {
        throw new BadRequest("You are not authorized to view this notification");
      }
      const { message, data, status_code } = await notificationService.getNotifications(
        recipientId
      );
      sendJsonResponse(res, status_code, message, data);
    }
  );

  /**
   * Delete notification
   */

  public deleteNotification = asyncHandler(
    async (req: Request, res: Response) => {
      const { recipientId, notificationId } = req.params;
      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }


      if (recipientId !== userData.userId) {
        throw new BadRequest("You are not authorized to delete this notification");
      }
      
      const { message, data, status_code } = await notificationService.deleteNotification(
        recipientId,
        notificationId,
      );
      sendJsonResponse(res, status_code, message, data);
    }
  );

  /**
   * Mark a notification as read
   */

  public markNotificationAsRead = asyncHandler(
    async (req: Request, res: Response) => {
      const { recipientId, notificationId } = req.params;
      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }

      if (recipientId !== userData.userId) {
        throw new BadRequest("You are not authorized to mark this notification as read");
      }
  
      const { message, data, status_code } =
        await notificationService.markNotificationAsRead(
          recipientId,
          notificationId,
        );
      sendJsonResponse(res, status_code, message, data);
    }
  );

  /**
   * Get unread notifications
   */
  public getUnreadNotifications = asyncHandler(async (req: Request, res: Response) => {
    const { recipientId } = req.params;
    console.log(recipientId);
    const userData = getUserData(req);

    if (!userData) {
      throw new BadRequest("You are not authenticated");
    }

    if (recipientId !== userData.userId) {
      throw new BadRequest("You are not authorized to view this notification");
    }
       
    const { message, data, status_code } = await notificationService.getUnreadNotifications(
      recipientId
    );
    console.log('Data from controller', data);
    sendJsonResponse(res, status_code, message, data);
  });
}
