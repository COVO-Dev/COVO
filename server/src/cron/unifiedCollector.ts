import cron from 'node-cron';
import { Instagram } from '../models/instagram.model';
import { Youtube } from '../models/youtube.model';
import { Facebook } from '../models/facebook.model';

import { updateInstagramMetrics } from '../services/instagram/instagramPlatformData.service';
import { updateYoutubeMetrics } from '../services/youtube/YoutubePlatformData.service';
import { updateFacebookMetrics } from '../services/facebook/facebookPlaformData.service';
import { refreshInstagramAccessToken } from '../services/instagram/authInstagram.service';
import { refreshYoutubeAccessToken } from '../services/youtube/authYoutube.service';
import { refreshFacebookAccessToken } from '../services/facebook/authFacebook.service';


cron.schedule('0 2 * * *', async () => {
  console.log("🕑 Running unified platform metrics collector");

  // ▶ Instagram
  const instagramAccounts = await Instagram.find({ connected: true });
  for (const account of instagramAccounts) {
    try {
      const { influencerId, tokenExpiry } = account;

      if (new Date() >= new Date(tokenExpiry)) {
          await refreshInstagramAccessToken(influencerId);
      }
      await updateInstagramMetrics(influencerId);
    } catch (err) {
      console.error(`⚠️ Instagram error for ${account._id}:`, err.message);
    }
  }
  

  // ▶ YouTube
  const youtubeAccounts = await Youtube.find({ connected: true });
  for (const account of youtubeAccounts) {
    try {
      const { influencerId, tokenExpiry } = account;
      if (new Date() >= new Date(tokenExpiry)) {
          await refreshYoutubeAccessToken(influencerId.toString());
      }
      await updateYoutubeMetrics(influencerId.toString());
    } catch (err) {
      console.error(`⚠️ YouTube error for ${account._id}:`, err.message);
    }
  }

  // ▶ Facebook
  const facebookAccounts = await Facebook.find({ connected: true });
  for (const account of facebookAccounts) {
    try {
      const { influencerId, tokenExpiry } = account;
      if (new Date() >= new Date(tokenExpiry)) {
          await refreshFacebookAccessToken(influencerId);
      }
      await updateFacebookMetrics(influencerId);
    } catch (err) {
      console.error(`⚠️ Facebook error for ${account._id}:`, err.message);
    }
  } {
    scheduled: true;
    timezone: "America/New_York"
  }
});
