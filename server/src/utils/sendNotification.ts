import { INotification, ServiceResponse } from "../types/index";
import NotificationSettings from "../models/notificationSettings.models";
import { Notification } from "../models/notification.models";
import { sendNotificationEmail } from "../services/email_sending.service";
import { User } from "../models/users.models";

async function getUserById(userId: string) {
  return await User.findById(userId).select("email firstName");
}


// Validation helper functions
async function validateRecipientAndSettings(recipientId: string, notificationData: Partial<INotification>) {
  if (!recipientId) throw new Error("Missing recipient ID.");
  
  let settings = await NotificationSettings.findOne({ recipient: recipientId, role: notificationData.role });

  if (!settings) {
    settings = new NotificationSettings({ recipient: recipientId, role: notificationData.role, is_enabled: true });
  }

  if (!settings.isEnabled) throw new Error("Notification settings are disabled.");

  // Check for DND
  if (settings?.doNotDisturb) {
    const now = new Date();
    const start = new Date(`1970-01-01T${settings.doNotDisturb.start}:00`);
    const end = new Date(`1970-01-01T${settings.doNotDisturb.end}:00`);
    if (isInDND(now, start, end)) throw new Error("User is in DND, notification not sent.");
  }

  if (
    settings?.preferences &&
    settings.preferences[notificationData.type] === false
  ) {
    console.warn(
      `Notifications disabled for type '${notificationData.type}' for recipient ${recipientId}`
    );
    return;
  }

  return settings;
}

// Helper function to check DND status
function isInDND(now: Date, start: Date, end: Date): boolean {
  return (start < end && now >= start && now <= end) || (start > end && (now >= start || now <= end));
}

// Main notification sending function
export const sendNotification = async (
  recipientId: string,
  senderId: string,
  notificationData: Partial<INotification>
): Promise<ServiceResponse<INotification>> => {
  try {
    if (!notificationData.subject || !notificationData.body || !notificationData.role || !notificationData.category) {
      throw new Error("Missing required fields for notification.");
    }

    await validateRecipientAndSettings(recipientId, notificationData);

    const user = await getUserById(recipientId);
    const sender = await getUserById(senderId);
    console.log("User found:", user.email, user.firstName);
    await sendNotificationEmail(user.email, user.firstName, sender.firstName );

    return {
      status_code: 200,
      message: "Notifications sent successfully",
      data: notificationData as INotification,
    };
  } catch (error) {
    console.error("Error sending notifications:", error.message);
    throw new Error("Failed to send notifications.");
  }
};

