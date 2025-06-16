import axios from "axios";
import { Influencer } from "../models/influencers.models";
import { Facebook } from "../models/facebook.model";
import { config } from "../config/configuration";
import { Tokens } from "../types";

export function generateFacebookAuthUrl(state: string) {
  const appId = config.FACEBOOK_APP_ID;
  const redirectUri = encodeURIComponent(config.FACEBOOK_REDIRECT_URI);

  const scopes = [
    "pages_show_list",
    "pages_read_engagement",
    "pages_read_user_content",
    "instagram_basic",
    "instagram_manage_insights",
    "public_profile",
    "email",
  ].join(",");
  return `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}&response_type=code&auth_type=rerequest`;
}

export const getFacebookTokens = async (
  code: string,
  influencerId: string
): Promise<Tokens> => {
  try {
    const appId = config.FACEBOOK_APP_ID;
    const appSecret = config.FACEBOOK_APP_SECRET;
    const redirectUri = config.FACEBOOK_REDIRECT_URI;

    const tokenResponse = await axios.get(
      `https://graph.facebook.com/v22.0/oauth/access_token`,
      {
        params: {
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code,
        },
      }
    );

    console.log("Facebook Long-Lived Token Response:", tokenResponse.data);

    const shortLivedToken = tokenResponse.data.access_token;
    if (!shortLivedToken) throw new Error("Invalid token response");

    const longLivedResponse = await axios.get(
      `https://graph.facebook.com/v22.0/oauth/access_token`,
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortLivedToken,
        },
      }
    );

    console.log("Facebook Long-Lived Token Response:", longLivedResponse.data);

    const { access_token } = longLivedResponse.data;
    if (!access_token) throw new Error("Failed to get long-lived token");

    const expires_in = longLivedResponse.data.expires_in || 5184000;

    const parsedExpiresIn = Number(expires_in);
    if (isNaN(parsedExpiresIn)) {
      throw new Error(
        "Invalid expires_in value received from Facebook: " + expires_in
      );
    }

    const pagesResponse = await axios.get(
      `https://graph.facebook.com/v22.0/me/accounts`,
      {
        params: { access_token },
      }
    );

    console.log("Facebook Pages Response:", pagesResponse.data);


    const pages = pagesResponse.data?.data;
    if (!pages || pages.length === 0) {
      throw new Error("No Facebook page found for this user");
    }
    const pageData = pages[0];
    // const platformUsername = pageData?.name || "";
    const platformId = pageData?.id;
    const pageAccessToken = pageData?.access_token;

    if (!platformId || !pageAccessToken) {
      throw new Error("No Facebook page found for this user");
    }

    const updateResult = await Facebook.findOneAndUpdate(
      { influencerId },
      {
        $set: {
          accessToken: access_token,
          tokenExpiry: new Date(Date.now() + parsedExpiresIn * 1000),
          lastConnected: new Date(),
          pageAccessToken,
          facebookId: platformId,
        },
        $setOnInsert: {
          connected: true, influencerId
        },
      },
      { upsert: true, new: true }
    );

    if (!updateResult) {
      throw new Error("Failed to update influencer data");
    }

    return longLivedResponse.data;
  } catch (error) {
    console.error(
      "Error exchanging Facebook auth code:",
      error.response?.data || error.message
    );
    throw new Error("Failed to exchange authorization code for tokens");
  }
};


export const refreshFacebookAccessToken = async (
  influencerId: string
): Promise<Tokens> => {
  try {
    const influencer = await Facebook.findOne({ influencerId });
    const longLivedToken = influencer?.accessToken;

    if (!longLivedToken) {
      throw new Error("No long-lived token found for this influencer");
    }


    const tokenResponse = await axios.get(
      `https://graph.facebook.com/v22.0/oauth/access_token`,
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: config.FACEBOOK_APP_ID,
          client_secret: config.FACEBOOK_APP_SECRET,
          fb_exchange_token: longLivedToken,
        },
      }
    );

    const { access_token, expires_in } = tokenResponse.data;

    const pagesResponse = await axios.get(
      `https://graph.facebook.com/v22.0/me/accounts`,
      { params: { access_token } }
    );

    const pageData = pagesResponse.data.data?.[0];
    const pageAccessToken = pageData?.access_token;
    const platformId = pageData?.id;

    await Facebook.findOneAndUpdate(
      { influencerId },
      {
        $set: {
          "accessToken": access_token,
          "tokenExpiry": new Date(
            Date.now() + Number(expires_in) * 1000
          ),
          "lastConnected": new Date(),
          "pageAccessToken": pageAccessToken,
          "facebookId": platformId,
        },
      },
      { upsert: true, new: true }
    );

    return tokenResponse.data;
  } catch (error) {
    console.error(
      "Error refreshing Facebook access token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to refresh access token");
  }
};

export const validateFacebookAccessToken = async (
  influencerId: string
): Promise<string> => {
  const influencer = await Facebook.findOne({ influencerId });

  if (!influencer?.accessToken) {
    throw new Error("No Facebook access token found for this influencer");
  }

  const tokenExpiry = influencer.tokenExpiry;
  const currentTime = new Date();

  if (!tokenExpiry || currentTime >= new Date(tokenExpiry.getTime() - 300000)) {
    const newTokens = await refreshFacebookAccessToken(influencerId);
    return newTokens.access_token;
  }

  return influencer.accessToken;
};

// export const disconnectFacebook = async (
//   influencerId: string
// ): Promise<void> => {
//   await Facebook.findOneAndUpdate(
//     { influencerId },
//     {
//       $set: {
//         connected: false,
//         lastConnected: new Date(),
//         accessToken: "",
//         refreshToken: "",
//         pageAccessToken: null,
//         facebookId: null,
//       },
//     }
//   );
// };

export const isFacebookConnected = async (
  influencerId: string
): Promise<boolean> => {
  const facebookData = await Facebook.findOne({ influencerId });
  return !!facebookData?.connected;
};