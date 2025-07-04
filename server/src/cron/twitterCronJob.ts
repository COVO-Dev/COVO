import { Twitter } from "../models/twitter.model";
import { Notification } from "../models/notification.models";
import { updateTwitterMetrics } from "../services/twitterPlatformData.service";
import { NotificationCategory, NotificationStatus, UserRole } from "../types/enum";

export async function refreshAllTwitterTokens() {
    try {
        console.log("🔁 Starting Twitter token validation cron...");

        const connectedUsers = await Twitter.find({ connected: true });

        for (const user of connectedUsers) {
            const { influencerId } = user;

            try {
                console.log(`📊 Syncing Twitter metrics for ${influencerId}`);
                await updateTwitterMetrics(influencerId.toString());
            } catch (error) {
                console.warn(`⚠ Token invalid for ${influencerId}, disconnecting...`);

                await Twitter.findOneAndUpdate(
                    { _id: influencerId },
                    {
                        $set: {
                            connected: false,
                            reauthorizeRequired: true,
                            lastDisconnected: new Date(),
                        },
                    }
                );

                await Notification.create({
                    recipientId: influencerId,
                    senderId: influencerId,
                    role: UserRole.Influencer,
                    subject: "Reconnect your Twitter account",
                    body: "Your Twitter connection is no longer valid. Please reconnect to continue tracking performance.",
                    type: "reauthorization",
                    category: NotificationCategory.System,
                    status: NotificationStatus.Unread,
                    isDeleted: false,
                });
            }
        }

        console.log("✅ Twitter cron job completed.");
    } catch (err) {
        console.error("❌ Twitter cron job failed:", err.message);
    }
}
