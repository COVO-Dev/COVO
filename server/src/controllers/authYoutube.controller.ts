import { Request, Response } from "express";
import {
  generateAuthUrl,
  getYoutubeTokens,
  validateYoutubeAccessToken,
} from "../services/youtube/authYoutube.service";
import { AuthenticatedRequest } from "../types";
import { randomBytes } from "crypto";
import { redisSave, redisRetrieve } from "../app";
import { asyncHandler } from "../middleware/helper";


export const getAuthUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const state = randomBytes(16).toString("hex");

    await redisSave(state, { youtubeState: state, influencerId: req.user.userId });

    const authUrl = generateAuthUrl(state);

    res.status(200).json({
      authUrl,
      state,
      influencerId: req.user.userId,
      message:
        "For Postman testing: 1. Open authUrl in browser 2. After auth, copy 'code' and 'state' from redirect URL",
    });

    // res.redirect(authUrl);
  } catch (error) {
    console.error("Auth URL generation error:", error);
    res.status(500).json({ error: "Failed to generate authorization URL" });
  }
};

export const handleCallback = asyncHandler ( async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    console.log("Callback query parameters:", req.query);

    const { code, state } = req.query;

    const retrievedRecord = await redisRetrieve(state.toString());

    if (!retrievedRecord) {
      return res.status(400).json({ error: "No record found for the user" });
    }

    const storedState = retrievedRecord.youtubeState;
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

    const tokens = await getYoutubeTokens(code as string, influencerId);

    await validateYoutubeAccessToken(influencerId);

    return res.status(200).json({
      message: "YouTube account connected successfully",
      connected: true,
      tokens,
    });
  } catch (error) {
    console.error("Callback handling error:", error);
    return res.status(500).json({
      error: "Authorization failed",
      message: error.message,
    });
  }
});

export const checkYoutubeConnection = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const influencerId = req.user.userId;
    const accessToken = await validateYoutubeAccessToken(influencerId);

    return res.status(200).json({
      connected: true,
      valid: !!accessToken,
    });
  } catch (error) {
    return res.status(200).json({
      connected: false,
      error: error.message,
    });
  }
};
