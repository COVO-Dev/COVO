# 📴 User Deactivation & Social Disconnect Module

This module allows users to deactivate or reactivate their accounts, and disconnect social media platforms. It includes full data migration, payload validation, and platform-specific deletion.

---

## 🌟 Features

- Deactivate user accounts
- Persist deactivated user data for recovery
- Reactivate user accounts
- Disconnect social media platforms
- Zod-based validation
- MongoDB + Mongoose integration

---

## 📦 API Endpoints

All endpoints require authentication via `authMiddleware`.

### 🔹 PUT `/deactivate/:userId`

Deactivate a user account and store the user data.

**Params:**
- `userId`: The user's MongoDB ObjectId

**Body:**
```json
{
  "deactivationReason": "User requested removal"
}
```
### Response:
```json
{
  "status_code": 200,
  "message": "User account deactivated and data moved successfully",
  "data": "Account deactivated"
}
```
### PUT /reactivate/:userId
- Reactivate a previously deactivated account.
- Params:
    - userId: The user's MongoDB ObjectId

- Response:
```json
{
  "status_code": 200,
  "message": "User account reactivated successfully",
  "data": "Account reactivated"
}
```
### POST /disconnect
- Disconnect a social media platform from an influencer.

Body:

```json
{
  "influencerId": "influencerMongoId",
  "platform": "instagram" // (example: "instagram", "youtube", "tiktok")
}
```
Response:
```json
{
  "status_code": 200,
  "message": "instagram disconnected successfully",
  "data": "instagram disconnected"
}
``` 
### Core Service Logic
### Validation
- Uses Zod schema deactivateRequestSchema to validate payloads
- All user IDs are checked using isValidObjectId

## Data Handling
- On deactivation:
    - User data is copied to the Deactivation collection
    - Original user is deleted from User model

- On reactivation:
    - User data is restored to the User model
    - Entry is removed from the Deactivation model

- On disconnect:
    - Platform-specific data is removed from its model using getPlatformModel()
