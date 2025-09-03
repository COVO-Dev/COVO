import express, { Express, Response, Request } from "express";
import cors from "cors";
import { authRoute } from "./routes/auth.routes";
import { routeNotFound, errorHandler } from "./middleware/errors";
import { userRoute } from "./routes/influencer.routes";
import { brandRoute } from "./routes/brand.routes";
import { campaignRoute } from "./routes/campaign.routes";
import { uploadRouter } from "./routes/upload.routes";
import { notificationRoute } from "./routes/notification.routes";
import { notificationSettingsRoute } from "./routes/notificationSettings.routes";
import { deactivationRoute } from "./routes/deactivate.routes";
import { chatRoute } from "./routes/chat.routes";
import { adminRoute } from "./routes/admin.routes";
import session from "express-session";
import { config } from "./config/configuration";
import { youtubeRoute } from "./routes/authYoutube.routes";
import dotenv from "dotenv";
import cookiesParser from "cookie-parser";
import { InstagramRoute } from "./routes/authInstagram.routes";
import Redis from "ioredis";
import { youtubePlatformData } from "./routes/youtubePlatformData.routes";
import { twitterRoutes } from "./routes/authTwitter.routes";
import { twitterPlatformData } from "./routes/twitterPlatformData.routes";
import { facebookRoute } from "./routes/authFacebook.routes";
import { facebookPlatformData } from "./routes/facebookPlatformData.routes";
import { searchLogRoute } from "./routes/searchLog.routes";
import { instagramPlatformData } from "./routes/instagramPlatformData.routes";
import { milestoneRouter } from "./routes/campaignMilestone.routes";
import { surveyRouters } from "./routes/covoSurvey.route";
import { subscriptionRoute } from "./routes/subscription.routes";
import subscriptionService from "./services/subscription.service";
import { checkExpiredSubscriptions } from "./utils/subscription.utils";
import { paymentRouter } from "./routes/payment.routes";
import { clickLogRouter } from "./routes/clickLog.routes";

// Security imports
import { 
  securityHeaders, 
  generalRateLimit, 
  securityLogger, 
  sanitizeInput, 
  requestTimeout,
  corsConfig 
} from "./middleware/security";
import { secureLog } from "./utils/secureLogger";

import "./cron/scheduler.cron"

dotenv.config();

const app: Express = express();

// Trust proxy if behind reverse proxy (nginx, load balancer, etc.)
if (config.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

// Security headers - should be first
app.use(securityHeaders);

// Request timeout
app.use(requestTimeout(30000)); // 30 seconds

// Security logging
app.use(securityLogger);

// Rate limiting
app.use(generalRateLimit);

// Input sanitization
app.use(sanitizeInput);

// CORS
app.use(cors(corsConfig));

// Handle preflight requests
app.options("*", cors(corsConfig));

// Cookie parser
app.use(cookiesParser());

// Redis connection for sessions and caching
const redis = new Redis({
  host: config.REDIS_HOST || 'redis',
  port: Number(config.REDIS_PORT) || 6379,
  password: config.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  secureLog('INFO', `Connected to Redis successfully at ${config.REDIS_HOST}:${config.REDIS_PORT}`);
});

redis.on('error', (err) => {
  secureLog('ERROR', 'Redis connection error', { error: err.message });
});

// Session store setup with in-memory store for now (can be improved later)
app.use(session({
  secret: config.NODE_ENV === 'production' ? config.PRODUCTION_SESSION_SECRET : config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on activity
  cookie: {
    secure: config.COOKIE_SECURE,
    httpOnly: true,
    sameSite: config.COOKIE_SAME_SITE as any,
    maxAge: config.COOKIE_MAX_AGE,
  },
  name: 'covo.sid', // Custom session name
}));

// Secure Redis utility functions
export const redisSave = async (key: string, value: any, expireTimeInMin?: number) => {
  if (expireTimeInMin === undefined || expireTimeInMin === 0) {
    expireTimeInMin = 60 * 60;
  } else {
    expireTimeInMin = expireTimeInMin * 60;
  }
  try {
    const result = await redis.set(key, JSON.stringify(value), 'EX', expireTimeInMin);
    secureLog('DEBUG', 'Redis record saved', { key: key.substring(0, 20) + '...', ttl: expireTimeInMin });
    return result;
  } catch (err) {
    secureLog('ERROR', 'Error saving Redis record', { 
      key: key.substring(0, 20) + '...', 
      error: err instanceof Error ? err.message : 'Unknown error' 
    });
    throw err;
  }
}

export const redisRetrieve = (key: string): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    redis.get(key, (err, result) => {
      if (err) {
        secureLog('ERROR', 'Error retrieving Redis record', { 
          key: key.substring(0, 20) + '...', 
          error: err.message 
        });
        reject(err);
      } else {
        secureLog('DEBUG', 'Redis record retrieved', { key: key.substring(0, 20) + '...' });
        resolve(result ? JSON.parse(result) : null);
      }
    });
  });
}

// Request logging middleware (remove sensitive session logging)
app.use((req, res, next) => {
  if (config.NODE_ENV === 'development') {
    secureLog('DEBUG', 'Request received', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID ? req.sessionID.substring(0, 8) + '...' : 'none',
    });
  }
  next();
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use("/api/auth", authRoute);
app.use("/api", userRoute);
app.use("/api", brandRoute);
app.use("/api", campaignRoute);
app.use("/api", uploadRouter);
app.use("/api", notificationRoute);
app.use("/api", notificationSettingsRoute);
app.use("/api", deactivationRoute);
app.use("/api", chatRoute);
app.use("/api", adminRoute);
app.use("/api", searchLogRoute);
app.use("/api", milestoneRouter);
app.use("/api", surveyRouters);

// Platform integration routes
app.use("/api", youtubeRoute);
app.use("/api", youtubePlatformData);
app.use("/api", InstagramRoute);
app.use("/api", instagramPlatformData);
app.use("/api", twitterRoutes);
app.use("/api", twitterPlatformData);
app.use("/api", facebookRoute);
app.use("/api", facebookPlatformData);

// Business routes
app.use("/api/subscription", subscriptionRoute);
app.use("/api/payment", paymentRouter);
app.use("/api", clickLogRouter);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: config.NODE_ENV,
  });
});

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "COVO API Server",
    version: "1.0.0",
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Payment success endpoint
app.get('/payment-success', (req, res) => {
  res.json({
    success: true,
    message: '🎉 Payment was successful!',
    timestamp: new Date().toISOString(),
  });
});

// Error handlers (must be last)
app.use(routeNotFound);
app.use(errorHandler);

export default app;
