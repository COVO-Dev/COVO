import { Facebook } from "../models/facebook.model";
import { Notification } from "../models/notification.models";
import {
    refreshFacebookAccessToken,
    isFacebookConnected,
} from "../services/facebook/authFacebook.service";
import { updateFacebookMetrics } from "../services/facebook/facebookPlaformData.service";
import { isTokenExpired, isTokenExpiringSoon } from "../middleware/helper"
import mongoose from "mongoose";
import { config } from "../config/configuration";
import { NotificationCategory, NotificationStatus, UserRole } from "../types/enum";

async function runFacebookCronJob() {
    try {
        await mongoose.connect(config.METRICS_DB_URI);

        const facebookUsers = await Facebook.find({ connected: true });

        for (const user of facebookUsers) {
            const { influencerId, tokenExpiry } = user;

            try {
                if (!tokenExpiry) continue;

                if (isTokenExpired(tokenExpiry)) {
                    await Facebook.findOneAndUpdate(
                        { influencerId },
                        {
                            $set: {
                                connected: false,
                                reauthorizeRequired: true,

                            },
                        }
                    );

                    await Notification.create({
                        recipientId: influencerId,
                        senderId: influencerId,
                        role: UserRole.Influencer,
                        subject: "Reconnect your Facebook account",
                        body: "Your Facebook connection has expired. Click below to reconnect and continue tracking your metrics.",
                        type: "reauthorization",
                        category: NotificationCategory.System,
                        status: NotificationStatus.Unread,
                        isDeleted: false,
                    });

                    console.warn(`⚠ Token expired for ${influencerId}. Marked disconnected and notified.`);
                    continue;
                }

                if (isTokenExpiringSoon(tokenExpiry)) {
                    console.log(`🔄 Refreshing Facebook token for ${influencerId}`);
                    await refreshFacebookAccessToken(influencerId.toString());
                }

                const stillConnected = await isFacebookConnected(influencerId.toString());
                if (!stillConnected) continue;

                console.log(`📊 Updating metrics for ${influencerId}`);
                await updateFacebookMetrics(influencerId.toString());
            } catch (err) {
                console.error(`❌ Facebook error for ${influencerId}:`, err.message);
            }
        }

        console.log("✅ Facebook cron job completed.");
    } catch (err) {
        console.error("❌ Cron job failed:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

export default runFacebookCronJob;
