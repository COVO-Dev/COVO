import {
  getAuthUrl,
  handleCallback,
} from "../controllers/authTwitter.controller";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

const twitterRoutes = Router();

twitterRoutes.get("/oauth/authorize/twitter", authMiddleware, getAuthUrl);
twitterRoutes.get("/auth/twitter/callback", handleCallback);
export { twitterRoutes };
