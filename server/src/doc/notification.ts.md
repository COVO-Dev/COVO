# 🔔 Notification Service & Routes

This module provides functionality to **create**, **retrieve**, **update (mark read)**, and **delete** notifications. It supports real-time sending via WebSocket and fallback notification delivery.

---

## 📌 Endpoints

All routes except creation require `authMiddleware`.

| Method  | Endpoint                                     | Description                   |
|---------|----------------------------------------------|-------------------------------|
| POST    | `/notifications/:senderId`                    | Create a new notification      |
| GET     | `/notifications/:recipientId`                 | Get all notifications          |
| GET     | `/notifications/:recipientId/unread`          | Get unread notifications       |
| PATCH   | `/notifications/:recipientId/:notificationId/read` | Mark notification as read      |
| DELETE  | `/notifications/:recipientId/:notificationId` | Delete a notification          |

---

## 🔧 Service Methods

### `createNotification(senderId, receiverId, notificationData)`
- Creates a new notification from `senderId` to `receiverId`.
- Validates IDs and sender/receiver existence.
- Sends notification via WebSocket if connected, otherwise fallback method.
- Returns created notification data.

### `getNotifications(recipientId)`
- Retrieves all non-deleted notifications for a recipient.
- Sorted by most recent first.
- Throws error if no notifications found.

### `getUnreadNotifications(recipientId, populate = true)`
- Retrieves unread notifications for a recipient.
- Supports optional population of referenced documents.
- Throws error if none found.

### `deleteNotification(recipientId, notificationId)`
- Soft deletes a notification by marking `isDeleted`.
- Validates ownership and existence.
- Returns notification with deletion status.

### `markNotificationAsRead(recipientId, notificationId)`
- Marks a notification as read.
- Validates ownership and existence.
- Returns updated notification.

---

## ✅ Validation & Errors

- Validates object IDs and required fields.
- Uses custom errors:
  - `BadRequest` for invalid inputs
  - `ResourceNotFound` when notifications/users don’t exist
  - `InvalidInput` for malformed data

---

## 🧠 Notes

- Notifications support multiple roles and categories.
- Real-time notification delivery is attempted via WebSocket.
- Soft deletion implemented to preserve data integrity.
- Creation endpoint does **not** require authentication, others do.

