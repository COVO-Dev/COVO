# 🔧 Notification Settings Service & Routes

This module manages **retrieving**, **updating**, and **resetting** notification settings for users, primarily influencers.

---

## 📌 Endpoints

All routes are protected by `authMiddleware`.

| Method | Endpoint                             | Description                          |
|--------|------------------------------------|------------------------------------|
| GET    | `/notification-settings/:recipientId`         | Get notification settings by user  |
| PUT    | `/notification-settings/:recipientId`         | Update notification settings       |
| PUT    | `/notification-settings/:recipientId/reset`   | Reset notification settings to default |

---

## 🔧 Service Methods

### `getNotificationSettings(recipientId)`
- Retrieves notification settings for a specific user.
- Returns 404 if no settings found.

### `updateNotificationSettings(recipientId, settings)`
- Updates or creates notification settings for a user.
- Supports partial updates, including `doNotDisturb`.

### `resetNotificationSettings(recipientId)`
- Resets notification settings to default values.
- Defaults include `isEnabled: true` and all preference categories enabled.

---

## ✅ Validation & Errors

- Validates `recipientId` as a valid MongoDB ObjectId.
- Throws `BadRequest` error for invalid IDs.
- Returns errors with descriptive messages on failure.

---

## 🧠 Notes

- Uses MongoDB `findOneAndUpdate` with `upsert` to create settings if none exist.
- Default settings enable Promotions, Updates, Alerts, and clear Do Not Disturb times.
- Suitable for influencer users to control their notification preferences.
