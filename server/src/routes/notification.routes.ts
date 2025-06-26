import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authMiddleware } from "../middleware/auth";

const notificationRoute = Router();
const notificationController = new NotificationController();

notificationRoute.post("/notifications/:senderId", notificationController.createNotification);

notificationRoute.get(
  "/notifications/:recipientId",
  authMiddleware,
  notificationController.getNotifications
);

notificationRoute.delete(
  "/notifications/:recipientId/:notificationId",
  authMiddleware,
  notificationController.deleteNotification
);

notificationRoute.patch(
  "/notifications/:recipientId/:notificationId/read",
  authMiddleware,
  notificationController.markNotificationAsRead
);

notificationRoute.get(
  "/notifications/:recipientId/unread",
  authMiddleware,
  notificationController.getUnreadNotifications
);

export { notificationRoute };
