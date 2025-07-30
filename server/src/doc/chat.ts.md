# 🗨️ Chat Module

This module provides a comprehensive chat system for a platform that supports secure messaging between users. It includes features like chat room creation, text/media message handling, user blocking, message read status, and chat archiving.

## 📦 Features

- Create chat rooms for campaigns, pitches, or offers
- Send and receive messages (text + media)
- Upload media with AWS S3 integration
- View all messages in a chat
- View all chat rooms for a user
- Block and unblock users
- Archive, close, or mark chats as read
- Real-time chat logic ready (for future sockets)

---

## 🚀 API Endpoints

All routes are protected with `authMiddleware`.

### 🔹 POST `/chatrooms`

Create a chat room.

**Body Example:**
```json
{
  "participants": ["userId1", "userId2"],
  "title": "Campaign: CampaignName",
  "contextType": "campaign",
  "contextRef": "campaignId"
}
```

🔹 POST /messages
- Send a text message.

Body Example:
```
{
  "chatId": "chatRoomId",
  "senderId": "userId",
  "content": "Hello, this is a message"
}
```
🔹 POST /upload
- Upload media (image, video).
- Use multipart/form-data
- Field name: mediaFiles

## Additional fields: chatId, senderId

🔹 GET /messages/:chatId
- Retrieve all messages in a chat room.

🔹 GET /chatrooms/:userId
- Retrieve all chat rooms associated with a user.

🔹 POST /chat/block
- Block a user.

Body Example:
```
{
  "blockerId": "userId",
  "blockedId": "otherUserId",
  "reason": "Harassment"
}
```

## Core Service Methods
### createChatRoom(participants, title, contextType, contextRef)
- Ensures chat room is unique per context
- Prevents creation if either user has blocked the other

### sendMessage(chatId, senderId, content)
- Sends a text message
- Fails if chat is closed or blocked

### sendMessageWithMedia(chatId, senderId, content, mediaFiles)
- Supports file uploads (image, video, doc)
- Uses uploadFileToAws() helper

### uploadMedia(chatId, senderId, mediaFiles)
- Used by the /upload endpoint
- Handles AWS file upload and stores in DB

### getMessages(chatId, userId)
- Returns messages sorted by creation time
- Adds isUnread flag per message

### getChatRoomsForUser(userId)
- Returns chatrooms excluding archived
- Adds unreadCount for each room

### markMessagesAsRead(chatId, userId)
- Marks all unread messages as read for the given user

### blockUser(blockerId, blockedId, reason)
- Blocks the user
- Updates relevant chat room status to blocked

### unblockUser(blockerId, blockedId)
- Unblocks a user and reactivates chat