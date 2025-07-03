import { Instagram } from "../models/instagram.model";
import { Notification } from "../models/notification.models";
import { refreshInstagramAccessToken } from "../services/instagram/authInstagram.service";
import { NotificationCategory, NotificationStatus, UserRole } from "../types/enum";

export async function refreshAllInstagramTokens() {
    try {
        console.log("🔁 Starting Instagram token maintenance job");

        const now = new Date();
        const soon = new Date();
        soon.setDate(now.getDate() + 7);
        const instagramAccounts = await Instagram.find({ connected: true });

        for (const account of instagramAccounts) {
            const { influencerId, tokenExpiry } = account;

            try {
                if (!tokenExpiry) continue;

                const isExpired = tokenExpiry <= now;
                const isExpiringSoon = tokenExpiry <= soon;

                if (isExpired) {
                    await Instagram.findOneAndUpdate(
                        { influencerId },
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
                        subject: "Reconnect your Instagram account",
                        body: "Your Instagram token has expired. Click here to reconnect and resume tracking.",
                        type: "reauthorization",
                        category: NotificationCategory.System,
                        status: NotificationStatus.Unread,
                        isDeleted: false,
                    });

                    console.warn(`⚠ Token expired for Instagram user ${influencerId}. Disconnected + notified.`);
                    continue;
                }

                if (isExpiringSoon) {
                    console.log(`🔄 Token expiring soon. Refreshing for ${influencerId}`);
                    await refreshInstagramAccessToken(influencerId);
                }
            } catch (error) {
                console.error(`❌ Error with Instagram account ${influencerId}:`, error.message);
            }
        }

        console.log("✅ Instagram cron job finished");
    } catch (err) {
        console.error("❌ Instagram cron job failed:", err.message);
    }
}
