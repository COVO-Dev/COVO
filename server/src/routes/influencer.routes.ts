import { Router } from "express";
import { InfluencerController } from "../controllers/influencer.controller";
import { authMiddleware } from "../middleware/auth";

const userRoute = Router();
const influencerController = new InfluencerController();

// Influencer routes
userRoute.get("/influencer/search", authMiddleware, influencerController.searchInfluencerController);
userRoute.get("/influencer/:id", authMiddleware, influencerController.getInfluencerDetails);
userRoute.put("/influencer/:id", authMiddleware, influencerController.getInfluencer); // partial update
userRoute.patch("/influencer/:id", authMiddleware, influencerController.updateInfluencerController) // full update

export { userRoute };
