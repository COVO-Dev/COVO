import { Youtube } from "../models/youtube.model";
import { Notification } from "../models/notification.models";
import { refreshYoutubeAccessToken } from "../services/youtube/authYoutube.service";
import { NotificationCategory, NotificationStatus, UserRole } from "../types/enum";

export async function refreshAllYoutubeTokens() {
    try {
        console.log("🔁 Starting YouTube token refresh job");

        const now = new Date();
        const soon = new Date();
        soon.setDate(now.getDate() + 7);

        const youTubers = await Youtube.find({ connected: true });

        for (const account of youTubers) {
            const { influencerId, tokenExpiry } = account;

            try {
                if (!tokenExpiry) continue;

                const isExpired = tokenExpiry <= now;
                const isExpiringSoon = tokenExpiry <= soon;

                if (isExpired) {
                    await Youtube.findOneAndUpdate(
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
                        subject: "Reconnect your YouTube account",
                        body: "Your YouTube token has expired. Click here to reconnect and resume tracking.",
                        type: "reauthorization",
                        category: NotificationCategory.System,
                        status: NotificationStatus.Unread,
                        isDeleted: false,
                    });

                    console.warn(`⚠ Token expired for YouTube user ${influencerId}. Disconnected + notified.`);
                    continue;
                }

                if (isExpiringSoon) {
                    console.log(`🔄 Refreshing YouTube token for ${influencerId}`);
                    await refreshYoutubeAccessToken(influencerId.toString());
                }
            } catch (error) {
                console.error(`❌ Error with YouTube account ${influencerId}:`, error.message);
            }
        }

        console.log("✅ YouTube cron job finished");
    } catch (err) {
        console.error("❌ YouTube cron job failed:", err.message);
    }
}
