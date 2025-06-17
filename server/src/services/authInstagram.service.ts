import axios from "axios";
import { Influencer } from "../models/influencers.models";
import { Instagram } from "../models/instagram.model";
import { config } from "../config/configuration";

export async function getTokens(code: string, influencerId: string) {
  try {
    const tokenResponse = await axios.post(
      "https://graph.facebook.com/v18.0/oauth/access_token",
      new URLSearchParams({
        client_id: config.INSTAGRAM_APP_ID,
        client_secret: config.INSTAGRAM_APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: config.INSTAGRAM_REDIRECT_URL,
        code,
      })
    );

    const userAccessToken = tokenResponse.data.access_token;

    const accountResponse = await axios.get(
      'https://graph.facebook.com/v18.0/me/accounts',
      {
        params: {
          access_token: userAccessToken,
          fields: 'instagram_business_account,access_token'
        }
      }
    );

    if (!accountResponse.data.data.length) {
      throw new Error('No Facebook Page found. Please create a Facebook Page and connect it to Instagram Professional Account');
    }

    const page = accountResponse.data.data[0];
    const pageAccessToken = page.access_token;
    const instagramAccountId = page.instagram_business_account?.id;

    if (!instagramAccountId) {
      throw new Error('No Instagram Professional Account connected to your Facebook Page');
    }

    const instagramResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${instagramAccountId}`,
      {
        params: {
          fields: 'username,profile_picture_url',
          access_token: pageAccessToken
        }
      }
    );

    const updateInstagram = await Instagram.findOneAndUpdate(
      { influencerId },
      {
        $set: {
          accessToken: userAccessToken,
          pageAccessToken: pageAccessToken,
          tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          lastConnected: new Date(),
          instagramId: instagramAccountId,
        },
        $setOnInsert: {
          connected: true, influencerId
        },
      },
      {upsert: true, new: true}
    );

    if (!updateInstagram) {
      throw new Error("Failed to update influencer record");
    }

    return {
      accessToken: userAccessToken,
      pageAccessToken: pageAccessToken,
      username: instagramResponse.data.username,
      userId: instagramAccountId,
    };
  } catch (error) {
    console.error("Instagram token exchange error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message ||
      error.message ||
      "Failed to exchange authorization code"
    );
  }
}

export async function refreshAccessToken(influencerId: string) {
  try {
    const instagramAccount = await Instagram.findOne({ influencerId });

    if (!instagramAccount) {
      throw new Error("Instagram account not found");
    }
    const accessToken = instagramAccount?.accessToken;
    console.log('accessToken', accessToken);
    const pageAccessToken = instagramAccount?.pageAccessToken;
    console.log('pageAccessToken', pageAccessToken);

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const refreshResponse = await axios.post(
      "https://graph.instagram.com/refresh_access_token",
      null,
      {
        params: {
          grant_type: "ig_refresh_token",
          access_token: accessToken,
        },
      }
    );
    


    const newAccessToken = refreshResponse.data.access_token;

    const expiresIn = refreshResponse.data.expires_in || 60 * 24 * 60 * 60;

    if (!newAccessToken) {
      throw new Error("Failed to retrieve new access token");
    }

    await Instagram.findOneAndUpdate(
      { influencerId },
      {
        $set: {
          accessToken: newAccessToken,
          tokenExpiry: new Date(Date.now() + expiresIn * 1000),
          connected: true,
          lastConnected: new Date(),
        },
      }
    );
    return { accessToken: newAccessToken, expiresIn, pageAccessToken };
  } catch (error) {
    console.error("Instagram token refresh error:", error);
    throw new Error("Failed to refresh access token");
  }
}


export async function validateInstagramAccessToken(influencerId: string): Promise<{ accessToken: string, pageAccessToken: string }> {
  const instagramAccount = await Instagram.findOne({ influencerId });

  if (!instagramAccount?.accessToken) {
    throw new Error("No access token found");
  }

  const tokenExpiry = instagramAccount.tokenExpiry;
  const currentTime = new Date();

  if (!tokenExpiry || currentTime >= tokenExpiry) {
    const newTokens = await refreshAccessToken(influencerId);
    return { 
      accessToken: newTokens.accessToken, 
      pageAccessToken: newTokens.pageAccessToken 
    };
  }

  return { 
    accessToken: instagramAccount.accessToken, 
    pageAccessToken: instagramAccount.pageAccessToken
  };
}


// export async function disconnectInstagram(influencerId: string): Promise<void> {
//   await Instagram.findOneAndUpdate(
//     { influencerId },
//     { $set: { connected: false, lastConnected: new Date() } }
//   );
// }

export async function isInstagramConnected(influencerId: string): Promise<boolean> {
  const instagramAccount = await Instagram.findOne({ influencerId });
  return !!instagramAccount?.connected;
}
