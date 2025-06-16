import axios from "axios";
import { Influencer } from "../../models/influencers.models";
import { config } from "../../config/configuration";
import { Tokens } from "../../types";
import { Twitter } from "../../models/twitter.model";

export function generateAuthUrl(state: string, codeVerifier: string, codeChallenge: string) {
  const clientId = config.TWITTER_CLIENT_ID;
  const redirectUri = config.TWITTER_REDIRECT_URI;
  const codeChallengeMethod = config.CODE_CHALLENGE_METHOD;

  const twitterUrl = "https://twitter.com/i/oauth2/authorize?response_type=code";

  return `${twitterUrl}&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${state}&scope=${encodeURIComponent(
    "tweet.read users.read offline.access"
  )}&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}&access_type=offline`;
}

export const getTwitterTokens = async (
  code: string,
  codeVerifier: string,
  influencerId: string
): Promise<Tokens> => {
  try {
      const clientId = config.TWITTER_CLIENT_ID;
      const clientSecret = config.TWITTER_CLIENT_SECRET;
      const redirectUri = config.TWITTER_REDIRECT_URI;

      const response = await axios.post(
          "https://api.twitter.com/2/oauth2/token",
          new URLSearchParams({
              grant_type: "authorization_code",
              code,
              redirect_uri: redirectUri,
              code_verifier: codeVerifier,
              client_id: clientId
          }),
          {
              headers: {
                  Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
                  "Content-Type": "application/x-www-form-urlencoded"
              }
          }
      );

      const { access_token, refresh_token, expires_in } = response.data;

      const userResponse = await axios.get("https://api.twitter.com/2/users/me", {
          headers: { Authorization: `Bearer ${access_token}` }
      });

      const userData = userResponse.data.data;
      const expiryTime = new Date();
      expiryTime.setSeconds(expiryTime.getSeconds() + expires_in);

      const twitterAccount = await Twitter.findOneAndUpdate(
          { influencerId },
          {
              $set: {
                  twitterId: userData.id,
                  accessToken: access_token,
                  refreshToken: refresh_token,
                  tokenExpiry: expiryTime,
                  lastConnected: new Date(),
              },
              $setOnInsert: {
                connected: true, influencerId
              },
          },
          { upsert: true, new: true }
      );

      return { access_token, refresh_token, expires_in };
  } catch (error) {
      console.error("Error during token exchange:", error.response?.data || error.message);
      throw new Error("Failed to exchange authorization code for tokens");
  }
};

export const refreshTwitterAccessToken = async (influencerId: string): Promise<Tokens> => {
  try {
      const twitterAccount = await Twitter.findOne({ influencerId });
      if (!twitterAccount) throw new Error("No Twitter account found for this influencer");

      const refreshToken = twitterAccount.refreshToken;
      if (!refreshToken) throw new Error("No refresh token found");

      const clientId = config.TWITTER_CLIENT_ID;
      const clientSecret = config.TWITTER_CLIENT_SECRET;

      const response = await axios.post(
          "https://api.twitter.com/2/oauth2/token",
          new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: refreshToken,
              client_id: clientId
          }),
          {
              headers: {
                  Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
                  "Content-Type": "application/x-www-form-urlencoded"
              }
          }
      );

      const { access_token, refresh_token, expires_in } = response.data;
      const expiryTime = new Date();
      expiryTime.setSeconds(expiryTime.getSeconds() + expires_in);

      await Twitter.findOneAndUpdate(
          { influencerId },
          {
              $set: {
                  accessToken: access_token,
                  refreshToken: refresh_token,
                  tokenExpiry: expiryTime,
                  lastConnected: new Date()
              }
          }
      );

      return { access_token, refresh_token, expires_in };
  } catch (error) {
      console.error("Error refreshing access token:", error.response?.data || error.message);
      throw new Error("Failed to refresh access token");
  }
};

export const validateTwitterAccessToken = async (influencerId: string): Promise<string> => {
  try {
      const twitterAccount = await Twitter.findOne({ influencerId });
      if (!twitterAccount?.connected) throw new Error("Twitter not connected");

      const tokenExpiry = twitterAccount.tokenExpiry;
      const currentTime = new Date();

      if (!tokenExpiry || currentTime >= new Date(tokenExpiry.getTime() - 300000)) {
          const { access_token } = await refreshTwitterAccessToken(influencerId);
          return access_token;
      }

      return twitterAccount.accessToken;
  } catch (error) {
      console.error("Error validating access token:", error);
      throw error;
  }
};

// export const disconnectTwitter = async (influencerId: string): Promise<void> => {
//   await Twitter.findOneAndUpdate(
//       { influencerId },
//       {
//           $set: {
//               connected: false,
//               lastConnected: new Date()
//           }
//       }
//   );
// };

export const isTwitterConnected = async (influencerId: string): Promise<boolean> => {
  const twitterAccount = await Twitter.findOne({ influencerId });
  return !!twitterAccount?.connected;
};