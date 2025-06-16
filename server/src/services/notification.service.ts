import { INotification, ServiceResponse } from "../types/index";
import NotificationSettings from "../models/notificationSettings.models";
import { Notification } from "../models/notification.models";
import { UserRole } from "../types/enum";
import mongoose from "mongoose";
import WebSocket from "ws";
import { User } from "../models/users.models";
import { isValidObjectId } from "../utils/valid";
import {
  BadRequest,
  ResourceNotFound,
  InvalidInput,
} from "../middleware/errors";
import { sendNotification } from "../utils/sendNotification";

const connectedClients = new Map<string, WebSocket>();

export class NotificationService {
  /**
   * Create a new Notification
   * @param payload
   * @returns A promise that resolves to the created notification
   */

  public async createNotification(
    senderId: string,
    receiverId: string,
    notificationData: Partial<INotification>
  ): Promise<ServiceResponse<INotification>> {
    try {
      if (
        !senderId ||
        !mongoose.Types.ObjectId.isValid(senderId.toString())
      ) {
        throw new BadRequest("Invalid or missing recipient ID");
      }

      const sender = await User.findById(senderId);
      if (!sender) {
        throw new ResourceNotFound("Sender not found");
      }

      if (
        !receiverId ||
        !mongoose.Types.ObjectId.isValid(receiverId.toString())
      ) {
        throw new BadRequest("Invalid or missing receiver ID");
      }

      const receiver = await User.findById(receiverId);
      if (!receiver) {
        throw new ResourceNotFound("Receiver not found");
      }

      console.log(
        "Recieving ids in service",
        senderId,
        receiverId,
        notificationData
      );

      const payload = {
        senderId: new mongoose.Types.ObjectId(senderId),
        recipientId: new mongoose.Types.ObjectId(receiverId),
        subject: notificationData.subject,
        body: notificationData.body,
        type: notificationData.type,
        role: notificationData.role,
        category: notificationData.category,
        status: notificationData.status || "unread",
      } as INotification;

      const newNotification = new Notification(payload);
      const notification = await newNotification.save();

      const { subject, body, type, role, category, timestamp } = notification;
      const notificationDetails = {
        subject,
        body,
        type,
        role,
        category,
        timestamp,
        senderId: new mongoose.Types.ObjectId(senderId),
      };

      const recipientClient = connectedClients.get(receiverId);
      console.log("Connected Clients Map:", connectedClients);
      if (recipientClient) {
        console.log(
          `Recipient WebSocket status: ${recipientClient.readyState}`
        );
        if (recipientClient.readyState === WebSocket.OPEN) {
          console.log(`Sending notification via WebSocket.`, notification);
          recipientClient.send(
            JSON.stringify({ type: "new_notification", data: notification })
          );
        } else {
          console.log(
            `Recipient WebSocket not open. Sending via fallback method.`
          );
        }
      }

      const sendResponse = await sendNotification(
        receiverId,
        senderId,
        notificationDetails
      );
      console.log("sendResponse", sendResponse, sendResponse.data);
      if (sendResponse.status_code !== 200) {
        console.warn(
          `Notification creation succeeded but sending failed. Response: ${JSON.stringify(
            sendResponse
          )}`
        );

        return {
          status_code: 201,
          message: "Notification created but fail to send.",
          data: notification,
        };
      }

      return {
        status_code: 201,
        message: "Notification created successfully",
        data: notification,
      };
    } catch (error) {
      if (
        error instanceof BadRequest ||
        error instanceof ResourceNotFound ||
        error instanceof InvalidInput
      ) {
        throw error;
      }
      console.error("Error creating notification:", error.message, error.stack);
      throw new Error(`Error creating notification: ${error}`);
    }
  }

  /**
   * Get notifications for a user

   * @param recipientId user id
   * @returns A promise that resolves to an array of notifications
   */

  public async getNotifications(
    recipientId: string
  ): Promise<ServiceResponse<INotification[]>> {
    try {
      if (!isValidObjectId(recipientId)) {
        throw new InvalidInput("Invalid recipient ID");
      }

      const notifications = await Notification.find({
        recipientId: recipientId,
        isDeleted: false,
      }).sort({ timestamp: -1 });

      if (!notifications || notifications.length === 0) {
        throw new ResourceNotFound("Notification not found for this recipient");
      }

      return {
        status_code: 200,
        message: "Notifications retrieved successfully",
        data: notifications,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve notifications: ${error.message}`);
    }
  }

  /**
   * Get unread notifications for an user
   * @param recipientId user id
   * @returns A promise that resolves to an array of notifications
   */

  public async getUnreadNotifications(
    recipientId: string,
    populate: boolean = true
  ): Promise<ServiceResponse<INotification[]>> {
    try {
      if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        throw new BadRequest("Invalid user ID");
      }

      let query = Notification.find({
        recipientId: recipientId,
        isDeleted: false,
      }).sort({ timestamp: -1 });

      // Only retrieve unread notifications
      query = query.where("status").equals("unread");

      if (populate) {
        query = query.populate("");
      }

      const notifications = await query;

      if (!notifications || notifications.length === 0) {
        throw new ResourceNotFound("Notification not found for this recipient");
      }

      return {
        status_code: 200,
        message: "Notifications retrieved successfully",
        data: notifications,
      };
    } catch (error) {
      throw new Error(`Error retrieving notifications: ${error.message}`);
    }
  }

  /**
   * Delete a notification
   *
   * @param notificationId The notification id to delete
   * @param recipientId The Id of the the user to be deleted.
   * @returns A promise that is resolved when the notification is deleted.
   */

  public async deleteNotification(
    recipientId: string,
    notificationId: string
  ): Promise<ServiceResponse<INotification>> {
    try {
      if (!isValidObjectId(recipientId) || !isValidObjectId(notificationId)) {
        throw new InvalidInput("Invalid recipient ID or notification ID");
      }

      const notification = await Notification.findOne({
        _id: notificationId,
        recipientId: recipientId,
      });

      if (!notification) {
        throw new ResourceNotFound("Notification not found for this recipient");
      }

      if (notification.isDeleted) {
        return {
          status_code: 200,
          message: "Notification is already deleted",
          data: notification,
        };
      }

      notification.isDeleted = true;
      await notification.save();

      return {
        status_code: 200,
        message: "Notification deleted successfully",
        data: notification,
      };
    } catch (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }

  /**
   * Mark notification as read
   *
   * @param notificationId The notification id to mark as read
   * @param recipientId The Id of the the user to be marked as read.
   * @returns A promise that is resolved when the notification is marked as read.
   */

  public async markNotificationAsRead(
    recipientId: string,
    notificationId: string
  ): Promise<ServiceResponse<INotification>> {
    try {
      if (!isValidObjectId(recipientId) || !isValidObjectId(notificationId)) {
        throw new InvalidInput("Invalid recipient ID or notification ID");
      }

      const notification = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipientId: recipientId,
          isDeleted: false,
        },
        { status: "read" },
        { new: true }
      );

      if (!notification) {
        throw new ResourceNotFound("Notification not found for this recipient");
      }

      return {
        status_code: 200,
        message: "Notification marked as read successfully",
        data: notification,
      };
    } catch (error) {
      if (error instanceof ResourceNotFound || error instanceof InvalidInput) {
        throw error;
      }
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }
}
