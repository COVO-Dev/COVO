import { Request, Response } from "express";
import {
  getFacebookTokens,
  validateFacebookAccessToken,
  generateFacebookAuthUrl,
} from "../services/facebook/authFacebook.service";
import { config } from "../config/configuration";
import { randomBytes } from "crypto";
import { redisSave, redisRetrieve } from "../app";
import { AuthenticatedRequest } from "../types";
import { asyncHandler } from "../middleware/helper";


/**
 * Redirect user to Facebook login
 */
export const redirectToFacebookLogin = (
  req: AuthenticatedRequest,
  res: Response
) => {
  console.log("redirectToFacebookLogin:", req.user, req.headers);
  const state = randomBytes(16).toString("hex");

  redisSave(state, { facebookState: state, influencerId: req.user.userId });

  const authUrl = generateFacebookAuthUrl(state);

  console.log("redis key 1", req.user.userId);

  res.status(200).json({
    authUrl,
    state,
    influencerId: req.user.userId,
    message:
      "For Postman testing for facebook: 1. Open authUrl in browser 2. After auth, copy 'code' and 'state' from redirect URL",
  });
  // res.redirect(authUrl);
};

/**
 * Handle Facebook OAuth callback
 */
export const handleFacebookCallback = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    const retrievedRecord = await redisRetrieve(state.toString());

    if (!retrievedRecord) {
      return res.status(400).json({ error: "No record found for the user" });
    }

    const storedState = retrievedRecord.facebookState;

    console.log("Received state from Facebook:", state);
    console.log("Stored state from Redis:", storedState);

    const influencerId =
      typeof retrievedRecord.influencerId === "string"
        ? retrievedRecord.influencerId
        : undefined;

    if (typeof state !== "string" || typeof code !== "string") {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    if (!state || !storedState || state !== storedState) {
      return res.status(400).json({ error: "Invalid state parameter" });
    }

    if (!code) {
      return res.status(400).json({ error: "Authorization code missing" });
    }

    if (!influencerId) {
      return res.status(400).json({ error: "Influencer ID missing" });
    }

    const tokens = await getFacebookTokens(code, influencerId);

    await validateFacebookAccessToken(influencerId);

    return res.status(200).json({
      message: "Facebook account connected successfully",
      connected: true,
      tokens,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
