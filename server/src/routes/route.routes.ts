import express from "express";
import { redirectToFacebookLogin, handleFacebookCallback } from "../controllers/authFacebook.controller";

const facebookAuthRoute = express.Router();

facebookAuthRoute.get("/auth/facebook", redirectToFacebookLogin);

export { facebookAuthRoute };