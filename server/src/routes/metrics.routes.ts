import { extractMetrics, downloadReferralReport } from "../controllers/metrics.controller";
import { Router } from "express";
import { authenticate, authMiddleware } from "../middleware/auth";

const extractRouter = Router();

// Route to extract metrics from a URL
extractRouter.post("metrics/extract", authMiddleware, extractMetrics);
extractRouter.get("metrics/download/:campaignId", authMiddleware, downloadReferralReport);

export { extractRouter };