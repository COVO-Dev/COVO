import { Router } from 'express';
import { healthCheck, healthCheckDetailed } from '../controllers/health.controller';

const router = Router();

// Simple health check - no auth required
router.get('/health', healthCheck);

// Detailed health check - no auth required (but you can add auth if needed)
router.get('/health/detailed', healthCheckDetailed);

export default router;
