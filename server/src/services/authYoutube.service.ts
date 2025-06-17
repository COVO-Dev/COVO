import { google } from 'googleapis';
import { Youtube } from '../models/youtube.model';
import { config } from '../config/configuration';
import { Tokens } from '../types';

const oauth2Client = new google.auth.OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  config.REDIRECT_URI
);

export function generateAuthUrl(state: string) {
  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl',
    'https://www.googleapis.com/auth/youtubepartner'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state,
    prompt: 'consent',
    include_granted_scopes: true
  });
}

export const getYoutubeTokens = async (code: string, influencerId: string): Promise<Tokens> => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const { access_token, refresh_token, expiry_date } = tokens;

    if (!access_token || !refresh_token) {
      throw new Error('Invalid token response');
    }

    const youtube = google.youtube('v3');
    const channelResponse = await youtube.channels.list({
      auth: oauth2Client,
      part: ['snippet'],
      mine: true
    });

    const channelData = channelResponse.data.items?.[0];
    const platformUsername = channelData?.snippet?.title || '';
    const youtubeId = channelData?.id || '';

    const youtubeAccount = await Youtube.findOneAndUpdate(
      { influencerId }, 
      {
        $set: {
          youtubeId,
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiry: new Date(expiry_date),
          lastConnected: new Date()
        },
        $setOnInsert: {
          connected: true, influencerId
        },
      },
      { upsert: true, new: true }
    );

    return tokens as Tokens;
  } catch (error) {
    console.error('Error during token exchange:', error.response?.data || error.message);
    throw new Error('Failed to exchange authorization code for tokens');
  }
};

export const refreshYoutubeAccessToken = async (influencerId: string): Promise<Tokens> => {
  try {
    const youtubeAccount = await Youtube.findOne({ influencerId });
    if (!youtubeAccount) throw new Error('No YouTube account found for this influencer');

    oauth2Client.setCredentials({ refresh_token: youtubeAccount.refreshToken });
    const response = await oauth2Client.refreshAccessToken();
    const tokens = response.credentials;

    await Youtube.findOneAndUpdate(
      { influencerId },
      {
        $set: {
          accessToken: tokens.access_token,
          tokenExpiry: new Date(tokens.expiry_date),
          lastConnected: new Date()
        }
      }
    );

    return tokens as Tokens;
  } catch (error) {
    console.error('Error refreshing access token:', error.response?.data || error.message);
    throw new Error('Failed to refresh access token');
  }
};

export const validateYoutubeAccessToken = async (influencerId: string): Promise<string> => {
  const youtubeAccount = await Youtube.findOne({ influencerId });

  if (!youtubeAccount?.accessToken) {
    throw new Error('No access token found');
  }

  const tokenExpiry = youtubeAccount.tokenExpiry;
  const currentTime = new Date();

  if (!tokenExpiry || currentTime >= new Date(tokenExpiry.getTime() - 300000)) {
    const newTokens = await refreshYoutubeAccessToken(influencerId);
    return newTokens.access_token;
  }

  return youtubeAccount.accessToken;
};

// export const disconnectYoutube = async (influencerId: string): Promise<void> => {
//   await Youtube.findOneAndUpdate(
//     { influencerId },
//     {
//       $set: {
//         connected: false,
//         lastConnected: new Date()
//       }
//     }
//   );
// };

export const isYoutubeConnected = async (influencerId: string): Promise<boolean> => {
  const youtubeAccount = await Youtube.findOne({ influencerId });
  return !!youtubeAccount?.connected;
};
