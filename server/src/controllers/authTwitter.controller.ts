import { Request, Response } from "express";
import { randomBytes } from "crypto";
import { AuthenticatedRequest } from "../types";
import { redisSave, redisRetrieve } from "../app";
import { generateCodeChallenge, generateCodeVerifier } from "../utils/pkce";
import {
  generateAuthUrl,
  getTwitterTokens,
  validateTwitterAccessToken,
  isTwitterConnected,
} from "../services/twitter/authTwitter.service";

export const getAuthUrl = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const state = randomBytes(16).toString("hex");
    console.log("State:", state);
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    await redisSave(state, {
      twitterState: state,
      influencerId: req.user.userId,
      codeVerifier,
      codeChallenge,
    });
    // redisSave(state, { twitterState: state, influencerId: req.user.userId, codeChallenge, codeVerifier });

    const authUrl = generateAuthUrl(state, codeVerifier, codeChallenge);

    res.status(200).json({
      authUrl,
      state,
      influencerId: req.user.userId,
      message:
        "For Postman testing: 1. Open authUrl in browser 2. After auth, copy 'code' and 'state' from redirect URL",
    });
  } catch (error) {
    console.error("Auth URL generation error:", error);
    res.status(500).json({ error: "Failed to generate authorization URL" });
  }
};

export const handleCallback = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { code, state } = req.query;

    const retrievedRecord = await redisRetrieve(state.toString());
    console.log('received record:', retrievedRecord);
    if (!retrievedRecord) {
      return res.status(400).json({ error: "No record found for the user" });
    }

    const storedState = retrievedRecord.twitterState;
    const influencerId = retrievedRecord.influencerId;
    const codeVerifier = retrievedRecord.codeVerifier;

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

    if (!codeVerifier) {
      return res.status(400).json({ error: "Code verifier missing" });
    }

    const tokens = await getTwitterTokens(code, codeVerifier, influencerId);
    await validateTwitterAccessToken(influencerId);

    return res.status(200).json({
      message: "Twitter account connected successfully",
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
};

export const checkTwitterConnection = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const influencerId = req.user.userId;
    const connected = await isTwitterConnected(influencerId);

    return res.status(200).json({
      connected,
    });
  } catch (error) {
    return res.status(200).json({
      connected: false,
      error: error.message,
    });
  }
};


