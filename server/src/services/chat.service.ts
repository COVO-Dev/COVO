import { ChatRoom } from "../models/chat.model";
import { uploadFileToAws } from "./upload.service";
import { Message } from "../models/message.model";
import { IChat, IMessage, IUser, ServiceResponse } from "../types/index";
import { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { HttpError } from "../middleware/errors";

export class ChatService {
  /**
   * Create a new chat room
   * @param participants the participants in the chat room
   * @returns A promise that resolves with the created chat room
   */
  public async createChatRoom(
    // participants: IUser[]
    participants: Schema.Types.ObjectId[]
  ): Promise<ServiceResponse<IChat>> {
    try {
      const chatRoom = new ChatRoom({ participants });
      const newChat = await chatRoom.save();
      return {
        status_code: 201,
        message: "Chat room created successfully",
        data: newChat,
      };
    } catch (error) {
      console.error(`Error creating chat room: ${error}`);
      throw new Error(`Error creating chat room: ${error}`);
    }
  }

  /**
   * Send a message to the chat room
   * @param chatId  the chat id
   * @param senderId  the sender id
   * @param content the content of the chat
   * @returns A promise that resolves with the created chat
   */

  public async sendMessage(
    chatId: string,
    senderId: string,
    content: string
  ): Promise<ServiceResponse<IMessage>> {
    try {
      if (!chatId || !senderId || !content) {
        throw new Error("Missing required fields");
      }
      const newMessage = new Message({
        chatId,
        sender: senderId,
        content,
        read: false,
      });

      const savedMessage = await newMessage.save();
      // console.log("Saved message: ", savedMessage);

      const chatRoomUpdate = await ChatRoom.findByIdAndUpdate(chatId, {
        lastMessage: savedMessage._id,
      });
      if (!chatRoomUpdate) {
        throw new Error("Chat room not found");
      }

      return {
        status_code: 200,
        message: "Message sent successfully",
        data: savedMessage,
      };
    } catch (error) {
      throw new Error(`Error sending message: ${error}`);
    }
  }

  /**
   * Send a message with optional media to the chat room
   * @param chatId the chat id
   * @param senderId the sender id
   * @param content the text content of the message (can be null if media is present)
   * @param mediaFiles optional array of media files (images/videos)
   * @returns A promise that resolves with the created message
   */
  public async sendMessageWithMedia(
    chatId: string,
    senderId: string,
    content: string | null,
    mediaFiles?: Express.Multer.File[]
  ): Promise<ServiceResponse<IMessage>> {
    try {
      if (!chatId || !senderId) {
        throw new HttpError(400, "Chat ID and Sender ID are required.");
      }

      const hasContent = content && content.trim().length > 0;
      const hasMedia = mediaFiles && mediaFiles.length > 0;

      if (!hasMedia) {
        throw new HttpError(
          400,
          "Media must be provided."
        );
      }

      const uploadedMediaInfo: { url: string; type: "image" | "video" | "document" }[] = [];

      if (hasMedia && mediaFiles) {
        for (const file of mediaFiles) {
          console.log("sendMessageWithMedia service File type: ", file.mimetype, file);
          if (!file || !file.mimetype || !file.buffer || !file.originalname) {
            // Skip invalid file objects or throw an error
            console.warn("Invalid media file object provided, skipping.");
            continue;
          }

          const uniqueFileName = `${uuidv4()}-${file.originalname}`;
          const fileUrl = await uploadFileToAws(uniqueFileName, file.buffer);
          // const fileType = file.mimetype.startsWith("video/")
          //   ? "video"
          //   : 'image';
          let fileType;
          switch (file.mimetype.split("/")[0]) {
            case "image":
              fileType = "image";
              break;
            case "video":
              fileType = "video";
              break;
            default:
              fileType = "document"; // Default to document for unknown types
              break;
          }
          uploadedMediaInfo.push({ url: fileUrl, type: fileType });
        }
      }

      const newMessage = new Message({
        chatId,
        sender: senderId,
        content: hasContent ? content : null,
        media: uploadedMediaInfo,
        read: false,
      });

      const savedMessage = await newMessage.save();

      const chatRoomUpdate = await ChatRoom.findByIdAndUpdate(
        chatId,
        { $set: { lastMessage: savedMessage._id } },
        { new: true }
      );

      if (!chatRoomUpdate) {
        // Attempt to roll back message creation if chat room update fails
        await Message.findByIdAndDelete(savedMessage._id);
        throw new HttpError(
          404,
          "Chat room not found or failed to update last message."
        );
      }

      return {
        status_code: 201, // 201 for resource creation
        message: "Message sent successfully",
        data: savedMessage,
      };
    } catch (error) {
      console.error(`Error sending message with media: ${error}`);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(
        500,
        `Error sending message with media: ${error.message}`
      );
    }
  }

  /**
   * Upload images or videos to the specified chat room
   *
   */

  public async uploadMedia(
    chatId: string,
    senderId: string,
    media?: Express.Multer.File[]
  ): Promise<ServiceResponse<IMessage>> {
    try {
      if (!media || media.length === 0) {
        throw new Error("No media files provided");
      }

      if (!senderId || !chatId) {
        throw new Error("Sender id or chat id not provided");
      }

      const mediaUrls: { url: string; type: "image" | "video" }[] = [];
      for (const file of media) {
        if (typeof file === "string") {
          const fileType = (file as string).endsWith(".mp4")
            ? "video"
            : "image";
          mediaUrls.push({ url: file, type: fileType });
        } else if (file && file.mimetype) {
          if (!file.mimetype) {
            throw new Error("File mimetype is missing");
          }
          const uniqueFileName = `${uuidv4()}-${file.originalname}`;
          const fileUrl = await uploadFileToAws(uniqueFileName, file.buffer);

          const fileType = file.mimetype.endsWith(".mp4") ? "video" : "image";
          mediaUrls.push({ url: fileUrl, type: fileType });
        } else {
          throw new Error("Invalid media file");
        }
      }

      const newMessage = new Message({
        chatId,
        sender: senderId,
        media: mediaUrls,
        content: null,
        read: false,
      });

      const savedMessage = await newMessage.save();

      return {
        status_code: 200,
        message: "Media uploaded and message sent successfully",
        data: savedMessage,
      };
    } catch (err) {
      console.log("Error uploading message: " + err.message);
      throw new Error(`Error creating message: ${err.message}`);
    }
  }

  /**
   * Get All Messages from the chat.
   * @param chatId the chat id
   */

  // Get messages for a chat room
  public async getMessages(
    chatId: string
  ): Promise<ServiceResponse<IMessage[]>> {
    try {
      const message = await Message.find({ chatId });
      // .populate("sender");
      // .populate({ path: "sender", select: "_id" });
      if (message.length === 0) {
        return {
          status_code: 404,
          message: "No messages found",
          data: [],
        };
      }
      return {
        status_code: 200,
        message: "Messages retrieved successfully",
        data: message,
      };
    } catch (error) {
      console.error(`Error getting messages: ${error}`);
      // throw new Error(`Error getting messages: ${error}`);
      throw new HttpError(500, `Error getting messages: ${error}`);
    }
  }

  /**
   * Get chat room for a user.
   * @param userId User ID to send messages to the chat room
   * @returns
   */

  public async getChatRoomsForUser(
    userId: string
  ): Promise<ServiceResponse<IChat[]>> {
    try {
      // const chatroom = await ChatRoom.find({ participants: userId })
      //   .populate("participants")
      //   .populate("lastMessage");
      const chatroom = await ChatRoom.find({ participants: userId }).populate([
        {
          path: "participants",
          select: "_id firstName lastName role",
        },
        {
          path: "lastMessage",
        },
      ]);

      if (chatroom.length === 0) {
        return {
          status_code: 404,
          message: "No chat rooms found",
          data: [],
        };
      }

      return {
        status_code: 200,
        message: "Chat rooms retrieved successfully",
        data: chatroom,
      };
    } catch (error) {
      console.error(`Error getting chat rooms: ${error}`);
      throw new Error(`Error getting chat rooms: ${error}`);
    }
  }
}
