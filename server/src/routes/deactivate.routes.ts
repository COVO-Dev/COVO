import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { DeactivationController } from "../controllers/deactivation.controller";


const deactivationRoute = Router();
const deactivationController = new DeactivationController();

// Deactivation routes
deactivationRoute.put("/deactivate/:userId", authMiddleware, deactivationController.deactivateUser);

// Reactivation routes
deactivationRoute.put("/reactivate/:userId", authMiddleware, deactivationController.reactivateUser);

// Disconnect social media account
deactivationRoute.post("/disconnect", authMiddleware, deactivationController.disconnectSocialMedia);

export { deactivationRoute };