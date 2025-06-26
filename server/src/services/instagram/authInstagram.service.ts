import axios from "axios";
import { Influencer } from "../../models/influencers.models";
import { Instagram } from "../../models/instagram.model";
import { config } from "../../config/configuration";
import { updateInstagramMetrics } from "./instagramPlatformData.service";

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

    const expires_in = tokenResponse.data.expires_in || 60 * 24 * 60 * 60;

    const updateInstagram = await Instagram.findOneAndUpdate(
      { influencerId },
      {
        $set: {
          accessToken: userAccessToken,
          pageAccessToken: pageAccessToken,
          tokenExpiry:  expires_in || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
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


/**
 * Refreshes Instagram access tokens before they expire
 * This function should be scheduled as a cron job
 */
export async function refreshAllInstagramTokens() {
  try {
    console.log("Starting Instagram token refresh job");
    
    // Find all Instagram accounts that need token refresh
    // Tokens that expire within the next 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const instagramAccounts = await Instagram.find({
      connected: true,
      tokenExpiry: { $lt: sevenDaysFromNow }
    });
    
    console.log(`Found ${instagramAccounts.length} Instagram accounts needing token refresh`);
    
    // Process each account
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const account of instagramAccounts) {
      try {
        console.log(`Refreshing token for influencer: ${account.influencerId}`);
        await refreshInstagramAccessToken(account.influencerId);
        results.success++;
      } catch (error) {
        console.error(`Failed to refresh token for influencer ${account.influencerId}:`, error);
        results.failed++;
        results.errors.push({
          influencerId: account.influencerId,
          error: error.message || "Unknown error"
        });
        
        // Mark as disconnected if we can't refresh
        if (error.message.includes("token") || error.response?.status === 400) {
          await Instagram.findOneAndUpdate(
            { influencerId: account.influencerId },
            { $set: { connected: false, lastDisconnected: new Date() } }
          );
          console.log(`Marked account ${account.influencerId} as disconnected due to token issues`);
        }
      }
    }
    
    console.log("Instagram token refresh job completed", results);
    return results;
  } catch (error) {
    console.error("Error in Instagram token refresh job:", error);
    throw error;
  }
}

/**
 * Updates Instagram metrics for all connected accounts
 * This function should be scheduled as a cron job
 */
export async function updateAllInstagramMetrics() {
  try {
    console.log("Starting Instagram metrics update job");
    
    // Find all connected Instagram accounts
    const instagramAccounts = await Instagram.find({ connected: true });
    
    console.log(`Found ${instagramAccounts.length} connected Instagram accounts`);
    
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    // Process each account
    for (const account of instagramAccounts) {
      try {
        console.log(`Updating metrics for influencer: ${account.influencerId}`);
        await updateInstagramMetrics(account.influencerId);
        results.success++;
      } catch (error) {
        console.error(`Failed to update metrics for influencer ${account.influencerId}:`, error);
        results.failed++;
        results.errors.push({
          influencerId: account.influencerId,
          error: error.message || "Unknown error"
        });
        
        // Handle token or permission issues
        if (error.message.includes("token") || 
            error.message.includes("permission") || 
            error.response?.status === 400 ||
            error.response?.status === 401) {
          // Try to refresh token first
          try {
            await refreshInstagramAccessToken(account.influencerId);
            // Try updating metrics again after token refresh
            await updateInstagramMetrics(account.influencerId);
            // Fix the count if it now succeeds
            results.failed--;
            results.success++;
            // Remove from errors
            const errorIndex = results.errors.findIndex(e => e.influencerId === account.influencerId);
            if (errorIndex !== -1) {
              results.errors.splice(errorIndex, 1);
            }
          } catch (refreshError) {
            // If refresh also fails, mark as disconnected
            await Instagram.findOneAndUpdate(
              { influencerId: account.influencerId },
              { $set: { connected: false, lastDisconnected: new Date() } }
            );
            console.log(`Marked account ${account.influencerId} as disconnected due to token/permission issues`);
          }
        }
      }
    }
    
    console.log("Instagram metrics update job completed", results);
    return results;
  } catch (error) {
    console.error("Error in Instagram metrics update job:", error);
    throw error;
  }
}

/**
 * Refreshes an Instagram access token
 * @param influencerId The ID of the influencer whose token to refresh
 */
export async function refreshInstagramAccessToken(influencerId: string) {
  try {
    const instagramAccount = await Instagram.findOne({ influencerId });

    if (!instagramAccount) {
      throw new Error("Instagram account not found");
    }
    
    const accessToken = instagramAccount?.accessToken;
    const pageAccessToken = instagramAccount?.pageAccessToken;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    // For Instagram tokens, use the appropriate refresh endpoint
    const refreshResponse = await axios.get(
      "https://graph.instagram.com/refresh_access_token",
      {
        params: {
          grant_type: "ig_refresh_token",
          access_token: accessToken,
        },
      }
    );

    if (!refreshResponse.data || !refreshResponse.data.access_token) {
      throw new Error("Invalid response when refreshing token");
    }

    const newAccessToken = refreshResponse.data.access_token;
    const expiresIn = refreshResponse.data.expires_in || 60 * 24 * 60 * 60; // Default 60 days if not specified

    // Calculate new expiry date
    const newExpiryDate = new Date();
    newExpiryDate.setSeconds(newExpiryDate.getSeconds() + expiresIn);

    // Update token in database
    await Instagram.findOneAndUpdate(
      { influencerId },
      {
        $set: {
          accessToken: newAccessToken,
          tokenExpiry: newExpiryDate,
          connected: true,
          lastConnected: new Date(),
        },
      }
    );
    
    console.log(`Successfully refreshed token for influencer ${influencerId}, new expiry: ${newExpiryDate}`);
    return { accessToken: newAccessToken, expiresIn, pageAccessToken };
  } catch (error) {
    console.error(`Instagram token refresh error for influencer ${influencerId}:`, error.response?.data || error);
    throw new Error(`Failed to refresh access token: ${error.message || "Unknown error"}`);
  }
}

/**
 * Validates an Instagram access token and refreshes if needed
 * @param influencerId The ID of the influencer whose token to validate
 */
export async function validateInstagramAccessToken(influencerId: string): Promise<{ accessToken: string, pageAccessToken: string }> {
  const instagramAccount = await Instagram.findOne({ influencerId });

  if (!instagramAccount?.accessToken) {
    throw new Error("No access token found");
  }

  const tokenExpiry = instagramAccount.tokenExpiry;
  const currentTime = new Date();
  
  // Buffer time: refresh token if it expires within 48 hours
  const bufferTime = new Date();
  bufferTime.setHours(bufferTime.getHours() + 48);

  if (!tokenExpiry || currentTime >= tokenExpiry || bufferTime >= tokenExpiry) {
    console.log(`Token for influencer ${influencerId} needs refresh (expires: ${tokenExpiry})`);
    const newTokens = await refreshInstagramAccessToken(influencerId);
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

/**
 * Disconnects an Instagram account
 * @param influencerId The ID of the influencer to disconnect
 */
export async function disconnectInstagram(influencerId: string): Promise<void> {
  await Instagram.findOneAndUpdate(
    { influencerId },
    { 
      $set: { 
        connected: false, 
        lastDisconnected: new Date() 
      } 
    }
  );
  console.log(`Disconnected Instagram account for influencer ${influencerId}`);
}

/**
 * Checks if an Instagram account is connected
 * @param influencerId The ID of the influencer to check
 */
export async function isInstagramConnected(influencerId: string): Promise<boolean> {
  const instagramAccount = await Instagram.findOne({ influencerId });
  return !!instagramAccount?.connected;
}



// export async function refreshInstagramAccessToken(influencerId: string) {
//   try {
//     const instagramAccount = await Instagram.findOne({ influencerId });

//     if (!instagramAccount) {
//       throw new Error("Instagram account not found");
//     }
//     const accessToken = instagramAccount?.accessToken;
//     console.log('accessToken', accessToken);
//     const pageAccessToken = instagramAccount?.pageAccessToken;
//     console.log('pageAccessToken', pageAccessToken);

//     if (!accessToken) {
//       throw new Error("No access token found");
//     }

//     const refreshResponse = await axios.post(
//       "https://graph.instagram.com/refresh_access_token",
//       null,
//       {
//         params: {
//           grant_type: "ig_refresh_token",
//           access_token: accessToken,
//         },
//       }
//     );
    


//     const newAccessToken = refreshResponse.data.access_token;

//     const expiresIn = refreshResponse.data.expires_in || 60 * 24 * 60 * 60;

//     if (!newAccessToken) {
//       throw new Error("Failed to retrieve new access token");
//     }

//     await Instagram.findOneAndUpdate(
//       { influencerId },
//       {
//         $set: {
//           accessToken: newAccessToken,
//           tokenExpiry: new Date(Date.now() + expiresIn * 1000),
//           connected: true,
//           lastConnected: new Date(),
//         },
//       }
//     );
//     return { accessToken: newAccessToken, expiresIn, pageAccessToken };
//   } catch (error) {
//     console.error("Instagram token refresh error:", error);
//     throw new Error("Failed to refresh access token");
//   }
// }


// export async function validateInstagramAccessToken(influencerId: string): Promise<{ accessToken: string, pageAccessToken: string }> {
//   const instagramAccount = await Instagram.findOne({ influencerId });

//   if (!instagramAccount?.accessToken) {
//     throw new Error("No access token found");
//   }

//   const tokenExpiry = instagramAccount.tokenExpiry;
//   const currentTime = new Date();

//   if (!tokenExpiry || currentTime >= tokenExpiry) {
//     const newTokens = await refreshInstagramAccessToken(influencerId);
//     return { 
//       accessToken: newTokens.accessToken, 
//       pageAccessToken: newTokens.pageAccessToken 
//     };
//   }

//   return { 
//     accessToken: instagramAccount.accessToken, 
//     pageAccessToken: instagramAccount.pageAccessToken
//   };
// }


// export async function isInstagramConnected(influencerId: string): Promise<boolean> {
//   const instagramAccount = await Instagram.findOne({ influencerId });
//   return !!instagramAccount?.connected;
// }
