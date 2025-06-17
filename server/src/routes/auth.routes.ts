import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authRoute = Router();
const authController = new AuthController();

// Register routes
authRoute.post("/register/influencer", authController.registerInfluencer);
authRoute.post("/register/brand", authController.registerBrand);
authRoute.post("/register/admin", authController.registerAdmin);

// Password reset routes
authRoute.post("/forgot-password", authController.forgetPassword);
authRoute.post("/reset-password", authController.resetPassword);

// Login route
authRoute.post("/login", authController.login);

export { authRoute };
