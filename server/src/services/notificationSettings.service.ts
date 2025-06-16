import NotificationSettings from "../models/notificationSettings.models";
import { isValidObjectId } from "../utils/valid";
import mongoose from "mongoose";
import { INotificationSettings } from "../types";
import { ServiceResponse } from "../types";
import { BadRequest, ResourceNotFound } from "../middleware/errors";
import { UserRole } from "../types/enum";

export class NotificationSettingsService {
  /**
   * Get notification settings for an influencer
   */

  public async getNotificationSettings(
    recipientId: string
  ): Promise<ServiceResponse<INotificationSettings>> {
    try {
      if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        throw new BadRequest("Invalid recipient ID");
      }

      const settings = await NotificationSettings.findOne({
        recipient: recipientId,
      });
      console.log('settings', settings)

      if (!settings) {
        return {
          status_code: 404,
          message: "Notification settings not found",
          data: null,
        };
      }

      return {
        status_code: 200,
        message: "Notification settings retrieved successfully",
        data: settings,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve notification settings: ${error.message}`
      );
    }
  }

  /**
   * Update notification settings
   *
   * @param recipientId Notification recipient ID
   * @param settings Notification settings
   * @returns Notification settings
   */
  public async updateNotificationSettings(
    recipientId: string,
    settings: Partial<INotificationSettings>
  ): Promise<ServiceResponse<INotificationSettings>> {
    try {
      if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        throw new BadRequest("Invalid recipient ID");
      }

      const updateData: Partial<INotificationSettings> = {
        ...settings,
        ...(settings.doNotDisturb && {
          doNotDisturb: settings.doNotDisturb,
        }),
      };

      // Find or create the notification settings for the user
      const updatedSettings = await NotificationSettings.findOneAndUpdate(
        { recipient: recipientId },
        { $set: updateData },
        { new: true, upsert: true }
      );

      return {
        status_code: 200,
        message: "Notification settings updated successfully",
        data: updatedSettings,
      };
    } catch (error) {
      throw new Error(
        `Failed to update notification settings: ${error.message}`
      );
    }
  }

  /**
   * Reset the notification settings to default.
   * @param recipientId
   * @returns A promise that resolves to the updated notification settings
   */
  public async resetNotificationSettings(
    recipientId: string,
  ): Promise<ServiceResponse<INotificationSettings>> {
    try {
      if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        throw new BadRequest("Invalid recipient ID");
      }

      const defaultSettings = {
        isEnabled: true,
        preferences: {
          Promotions: true,
          Updates: true,
          Alerts: true,
        },
        doNotDisturb: {
          start: null,
          end: null,
        }
      };

      const updatedSettings = await NotificationSettings.findOneAndUpdate(
        { recipient: recipientId },
        { $set: defaultSettings },
        { new: true, upsert: true }
      );

      return {
        status_code: 200,
        message: "Notification settings reset to default",
        data: updatedSettings,
      };
    } catch (error) {
      throw new Error(
        `Failed to reset notification settings: ${error.message}`
      );
    }
  }
}
