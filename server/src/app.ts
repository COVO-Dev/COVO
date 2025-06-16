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

dotenv.config();

const app: Express = express();
app.options("*", cors());
app.use(cookiesParser());

const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

redis.on('connect', () => {
  console.log('Connected to Redis successfully');
});


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 60 * 60 * 1000
  }
}));


app.use(
  cors({
    origin: "http://127.0.0.1:3000",
    credentials: false,
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "content-type",
      "Authorization",
    ],
  })
);


export const redisSave = async (key: string, value: any, expireTimeInMin?: number) => {
  if(expireTimeInMin === undefined || expireTimeInMin === 0) {
    expireTimeInMin = 60 * 60;
  } else {
    expireTimeInMin = expireTimeInMin * 60;
  }
  try {
    const result = await redis.set(key, JSON.stringify(value), 'EX', expireTimeInMin);
    console.log('Record saved:', result);
    return result;
  } catch (err) {
    console.error('Error saving record:', err);
    throw err;
  }
}

export const redisRetrieve = (key: string): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
  redis.get(key, (err, result) => {
    if (err) {
      console.error('Error retrieving record:', err);
      reject(err);
    } else {
      console.log('Return retrieved record:', result);
      resolve(JSON.parse(result));
    }
  });
});
}


app.use((req, res, next) => {
  console.log("Session ID!!:", req.session.id);
  console.log("Session Data!!:", req.session);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Influencer routes
app.use("/api/auth", authRoute);
app.use("/api", userRoute);

// Brand routes
app.use("/api", brandRoute);

// OTHERS
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

// Youtube routes (Google OAuth)
app.use("/api", youtubeRoute);
app.use("/api", youtubePlatformData);

// Instagram routes
app.use("/api", InstagramRoute);
app.use("/api", instagramPlatformData);

// Twitter routes
app.use("/api", twitterRoutes);
app.use("/api", twitterPlatformData);

// Facebook routes
app.use("/api", facebookRoute);
app.use("/api", facebookPlatformData);


app.use(routeNotFound);
app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "I am the express API responding to Covo API request",
  });
});

export default app;
