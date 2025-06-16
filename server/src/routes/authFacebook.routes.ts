import express from "express";
import { redirectToFacebookLogin, handleFacebookCallback } from "../controllers/authFacebook.controller";
import { authMiddleware } from "../middleware/auth";

const facebookRoute = express.Router();

facebookRoute.get("/oauth/authorize/facebook", authMiddleware, redirectToFacebookLogin);
facebookRoute.get("/oauth/facebook/callback", handleFacebookCallback);
export { facebookRoute };
