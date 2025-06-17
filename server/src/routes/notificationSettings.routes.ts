import express from "express";
import { NotificationSettings } from "../controllers/notificationSettings.controller";
import { authMiddleware } from "../middleware/auth";

const notificationSettingsRoute = express.Router();
const notificationSettings = new NotificationSettings();

notificationSettingsRoute.get("/notification-settings/:recipientId", authMiddleware, notificationSettings.getNotificationSettings);

notificationSettingsRoute.put("/notification-settings/:recipientId", authMiddleware, notificationSettings.updateNotificationSettings);

notificationSettingsRoute.put("/notification-settings/:recipientId/reset", authMiddleware, notificationSettings.resetNotificationSettings);

export { notificationSettingsRoute };
