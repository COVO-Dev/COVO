import { extractMetrics } from "../controllers/metrics.controller";
import { Router } from "express";

const extractRouter = Router();

// Route to extract metrics from a URL
extractRouter.post("metrics/extract", extractMetrics);

export { extractRouter };