import { Router } from "express";
import {
  getAuthUrl,
  handleCallback,
} from "../controllers/authYoutube.controller";
import { authMiddleware } from "../middleware/auth";

const youtubeRoute = Router();

// youtubeRoute.get('/auth/url', authMiddleware, getAuthUrl);
youtubeRoute.get("/oauth/authorize/youtube", authMiddleware, getAuthUrl);
youtubeRoute.get("/oauth/callback", handleCallback);

export { youtubeRoute };
