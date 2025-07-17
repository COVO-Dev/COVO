// controllers/metrics.controller.ts
import { Request, Response } from 'express';
import { getMetricsFromUrl } from '../services/metrics.service';
import { sendJsonResponse, asyncHandler } from '../middleware/helper';

export const extractMetrics = asyncHandler(async (req: Request, res: Response) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Missing URL' });
    const data = await getMetricsFromUrl(url);
    sendJsonResponse(res, 200, "Metrics extracted successfully", data);
});
