import {
  getAuthUrl,
  handleCallback,
} from "../controllers/authInstagram.controller";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

const InstagramRoute = Router();

InstagramRoute.get("/auth/authorize/instagram", authMiddleware, getAuthUrl);
InstagramRoute.get("/oauth/instagram/callback", handleCallback);
export { InstagramRoute };
