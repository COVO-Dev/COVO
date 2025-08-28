import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/helper';

// Simple health check endpoint
export const healthCheck = asyncHandler(async (req: Request, res: Response) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        services: {
            database: 'connected', // You can add actual DB connection check here
            redis: 'connected', // You can add actual Redis connection check here
        }
    };

    res.status(200).json(healthData);
});

// Detailed health check for monitoring
export const healthCheckDetailed = asyncHandler(async (req: Request, res: Response) => {
    // Add database connection check
    let dbStatus = 'connected';
    let redisStatus = 'connected';
    
    try {
        // Add your actual database connection check here
        // const dbConnection = await mongoose.connection.readyState;
        // dbStatus = dbConnection === 1 ? 'connected' : 'disconnected';
    } catch (error) {
        dbStatus = 'error';
    }

    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        services: {
            database: dbStatus,
            redis: redisStatus,
        },
        system: {
            platform: process.platform,
            nodeVersion: process.version,
            arch: process.arch,
        }
    };

    res.status(200).json(healthData);
});
