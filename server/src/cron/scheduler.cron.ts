import cron from "node-cron";
import runFacebookCronJob from "./facebookCronJob";
import { refreshAllInstagramTokens } from "./instagramCronJob";
import { refreshAllYoutubeTokens } from "./youtubeCronJob";
import { refreshAllTwitterTokens } from "./twitterCronJob";

cron.schedule("0 * * * *", async () => {
  console.log("🚀 Running all social platform cron jobs (hourly)");

  try {
    await runFacebookCronJob();
  } catch (err) {
    console.error("❌ Facebook cron failed:", err.message);
  }

  try {
    await refreshAllInstagramTokens();
  } catch (err) {
    console.error("❌ Instagram cron failed:", err.message);
  }

  try {
    await refreshAllYoutubeTokens();
  } catch (err) {
    console.error("❌ YouTube cron failed:", err.message);
  }

  try {
    await refreshAllTwitterTokens();
  } catch (err) {
    console.error("❌ Twitter cron failed:", err.message);
  }

  console.log("✅ All cron jobs completed.");
});
