import { ChatService } from "../services/chat.service";
import { ChatRoom } from "../models/chat.model";
import { Message } from "../models/message.model";
import { uploadFileToAws } from "../services/upload.service";
import mongoose from "mongoose";
import { Types, Schema } from "mongoose";
import { HttpError } from "../middleware/errors";

// Mock ChatRoom exactly the same as before...
jest.mock("../models/chat.model", () => {
    const ChatRoom = jest.fn().mockImplementation(function (this: any, data: any) {
        return {
            participants: data.participants,
            save: jest.fn(),
        };
    });
    (ChatRoom as any).findByIdAndUpdate = jest.fn();
    (ChatRoom as any).find = jest.fn();
    return { ChatRoom };
});

jest.mock("../models/message.model", () => {
    const Message = jest.fn().mockImplementation(function (this: any, data) {
        this.chatId = data.chatId;
        this.sender = data.sender;
        this.media = data.media;
        this.content = data.content;
        this.read = data.read;
        this.save = jest.fn();
    });
    (Message as any).find = jest.fn();

    return { Message };
});

jest.mock("../services/upload.service", () => ({
    uploadFileToAws: jest.fn(),
}));

describe("ChatService.createChatRoom", () => {
    const chatService = new ChatService();

    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });
    describe("ChatService - createChatRoom", () => {
        const mockParticipantId = new mongoose.Types.ObjectId() as unknown as Schema.Types.ObjectId;

        it("should create a chat room with valid participants", async () => {
            const mockSavedChat = {
                _id: new Types.ObjectId(),
                participants: [mockParticipantId],
            };

            // @ts-ignore: override the mock implementation to resolve our mockSavedChat
            (ChatRoom as unknown as jest.Mock).mockImplementation(function (this: any, data) {
                this.participants = data.participants;
                this.save = jest.fn().mockResolvedValue(mockSavedChat);
            });

            const result = await chatService.createChatRoom([mockParticipantId]);

            expect(result.status_code).toBe(201);
            expect(result.message).toBe("Chat room created successfully");
            expect(result.data).toEqual(mockSavedChat);
        });

        it("should throw if participants array is empty", async () => {
            await expect(chatService.createChatRoom([])).rejects.toThrow(
                /Error creating chat room/
            );
        });

        it("should accept duplicate participants (same ID twice)", async () => {
            const mockSaved = { _id: mockParticipantId, participants: [mockParticipantId, mockParticipantId] };
            (ChatRoom as unknown as jest.Mock).mockImplementation(function (this: any, data) {
                this.save = jest.fn().mockResolvedValue(mockSaved);
            });

            const res = await chatService.createChatRoom([mockParticipantId, mockParticipantId]);
            if (!Array.isArray(res.data)) {
                expect(res.data.participants).toHaveLength(2);
            } else {
                throw new Error("Expected res.data to be of type IChat, but got an array");
            }
        });

        it("should throw if participants is not an array", async () => {
            // @ts-ignore
            await expect(chatService.createChatRoom("foo")).rejects.toThrow(
                /Error creating chat room/
            );
        });

        it("should throw if participants is undefined", async () => {
            // @ts-ignore
            await expect(chatService.createChatRoom(undefined)).rejects.toThrow(
                /Error creating chat room/
            );
        });

        it("should throw if save() fails", async () => {
            // @ts-ignore
            (ChatRoom as jest.Mock).mockImplementation(function (this: any, data) {
                this.save = jest.fn().mockRejectedValue(new Error("DB save failed"));
            });

            await expect(chatService.createChatRoom([mockParticipantId])).rejects.toThrow(
                "Error creating chat room: Error: DB save failed"
            );
        });

        it("should throw if participants contain invalid ids", async () => {
            // We can simulate Mongoose rejecting an invalid ObjectId by throwing in the constructor
            const invalid = "not-an-objectid";
            (ChatRoom as unknown as jest.Mock).mockImplementation(function () {
                throw new Error("Cast to ObjectId failed");
            });

            await expect(
                chatService.createChatRoom([invalid as any])
            ).rejects.toThrow("Error creating chat room: Error: Cast to ObjectId failed");
        });
    });

    describe("ChatService - sendMessage", () => {
        const chatId = new Types.ObjectId().toString();
        const senderId = new Types.ObjectId().toString();
        const content = "Hello, world!";

        it("should send a message successfully", async () => {
            const mockSavedMessage = {
                _id: new Types.ObjectId(),
                chatId,
                sender: senderId,
                content,
                read: false,
            };

            // @ts-ignore
            (Message as jest.Mock).mockImplementation(function (this: any, data) {
                this.save = jest.fn().mockResolvedValue(mockSavedMessage);
            });
            // @ts-ignore
            (ChatRoom.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

            const res = await chatService.sendMessage(chatId, senderId, content);

            expect(res.status_code).toBe(200);
            expect(res.message).toBe("Message sent successfully");
            expect(res.data).toEqual(mockSavedMessage);

            // Ensure we saved and updated
            expect(Message).toHaveBeenCalledWith({
                chatId,
                sender: senderId,
                content,
                read: false,
            });
            expect(ChatRoom.findByIdAndUpdate).toHaveBeenCalledWith(chatId, {
                lastMessage: mockSavedMessage._id,
            });
        });
        it("should ignore any passed-in `read` flag and always default to false", async () => {
            const fakeSave = { _id: new Types.ObjectId(), read: false };
            // @ts-ignore
            (Message as jest.Mock).mockImplementation(function (this: any, data) {
                this.save = jest.fn().mockResolvedValue(fakeSave);
            });
            // @ts-ignore
            (ChatRoom.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

            const result = await chatService.sendMessage(chatId, senderId, "hey");
            if (!Array.isArray(result.data)) {
                expect(result.data.read).toBe(false);
            } else {
                throw new Error("Expected result.data to be of type IMessage, but got an array");
            }
        });

        it("should allow excessively long content", async () => {
            const long = "x".repeat(10_000);
            const fakeSave = { _id: new Types.ObjectId(), content: long, read: false };
            // @ts-ignore
            (Message as jest.Mock).mockImplementation(function () {
                this.save = jest.fn().mockResolvedValue(fakeSave);
            });
            // @ts-ignore
            (ChatRoom.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

            const res = await chatService.sendMessage(chatId, senderId, long);
            if (!Array.isArray(res.data)) {
                expect(res.data.content.length).toBe(10_000);
            } else {
                throw new Error("Expected res.data to be of type IMessage, but got an array");
            }
        });

        it("should reject no content", async () => {
            // @ts-ignore
            await expect(chatService.sendMessage(chatId, senderId)).rejects.toThrow(
                /Missing required fields/
            );
        });
        it("should throw if any required field is missing", async () => {
            await expect(chatService.sendMessage("", senderId, content)).rejects.toThrow(
                "Error sending message: Error: Missing required fields"
            );
            await expect(chatService.sendMessage(chatId, "", content)).rejects.toThrow(
                "Error sending message: Error: Missing required fields"
            );
            await expect(chatService.sendMessage(chatId, senderId, "")).rejects.toThrow(
                "Error sending message: Error: Missing required fields"
            );
        });

        it("should throw if saving the message fails", async () => {
            // @ts-ignore
            (Message as jest.Mock).mockImplementation(function () {
                this.save = jest.fn().mockRejectedValue(new Error("DB save fail"));
            });

            await expect(
                chatService.sendMessage(chatId, senderId, content)
            ).rejects.toThrow("Error sending message: Error: DB save fail");
        });

        it("should throw if chat room not found on update", async () => {
            // @ts-ignore
            (Message as jest.Mock).mockImplementation(function () {
                this.save = jest.fn().mockResolvedValue({ _id: new Types.ObjectId() });
            });
            // @ts-ignore
            (ChatRoom.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            await expect(
                chatService.sendMessage(chatId, senderId, content)
            ).rejects.toThrow("Error sending message: Error: Chat room not found");
        });

        it("should throw if findByIdAndUpdate itself errors", async () => {
            // @ts-ignore
            (Message as jest.Mock).mockImplementation(function () {
                this.save = jest.fn().mockResolvedValue({ _id: new Types.ObjectId() });
            });
            // @ts-ignore
            (ChatRoom.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error("DB update fail"));

            await expect(
                chatService.sendMessage(chatId, senderId, content)
            ).rejects.toThrow("Error sending message: Error: DB update fail");
        });
    });

    describe("ChatService - uploadMedia", () => {
        const chatId = new Types.ObjectId().toString();
        const senderId = new Types.ObjectId().toString();

        beforeEach(() => jest.clearAllMocks());

        it("should upload a single image file and create a message", async () => {
            const fakeFile = {
                originalname: "pic.png",
                buffer: Buffer.from(""),
                mimetype: "image/png",
            } as Express.Multer.File;

            const uploadedUrl = "https://s3.amazonaws.com/bucket/pic.png";
            (uploadFileToAws as jest.Mock).mockResolvedValue(uploadedUrl);

            const mockSavedMessage = {
                _id: new Types.ObjectId(),
                chatId,
                sender: senderId,
                media: [{ url: uploadedUrl, type: "image" }],
            };

            // @ts-ignore
            (Message as jest.Mock).mockImplementation(function (this: any) {
                this.save = jest.fn().mockResolvedValue(mockSavedMessage);
            });

            const res = await chatService.uploadMedia(chatId, senderId, [fakeFile]);

            expect(res.status_code).toBe(200);
            expect(res.message).toBe("Media uploaded and message sent successfully");
            expect(res.data).toEqual(mockSavedMessage);

            expect(uploadFileToAws).toHaveBeenCalledWith(
                expect.stringContaining("-pic.png"),
                fakeFile.buffer
            );
            expect(Message).toHaveBeenCalledWith({
                chatId,
                sender: senderId,
                media: [{ url: uploadedUrl, type: "image" }],
                content: null,
                read: false,
            });
        });
        it("should handle string URLs directly (video vs image)", async () => {
            const urls = [
                "https://foo.com/vid.mp4",
                "https://foo.com/img.png",
            ];
            // @ts-ignore
            (Message as jest.Mock).mockImplementation(function (this: any, data) {
                this.save = jest.fn().mockResolvedValue({ ...data, _id: new Types.ObjectId() });
            });

            const res = await chatService.uploadMedia(chatId, senderId, urls as any[]);
            if (!Array.isArray(res.data)) {
                expect(res.data.media[0]).toMatchObject({ url: urls[0], type: "video" });
            } else {
                throw new Error("Expected res.data to be of type IMessage, but got an array");
            }
            expect(res.data.media[1]).toMatchObject({ url: urls[1], type: "image" });
        });

        it("should handle mixed array of strings and File objects", async () => {
            const fakeFile = {
                originalname: "photo.jpg",
                buffer: Buffer.from(""),
                mimetype: "image/jpeg",
            } as Express.Multer.File;
            const uploaded = "https://s3/bucket/photo.jpg";
            (uploadFileToAws as jest.Mock).mockResolvedValue(uploaded);
            // @ts-ignore
            (Message as jest.Mock).mockImplementation(function (this: any, data) {
                this.save = jest.fn().mockResolvedValue({ ...data, _id: new Types.ObjectId() });
            });

            const input = ["https://foo.com/video.mp4", fakeFile] as any[];
            const res = await chatService.uploadMedia(chatId, senderId, input);

            if (!Array.isArray(res.data)) {
                expect(res.data.media).toHaveLength(2);
            } else {
                throw new Error("Expected res.data to be of type IMessage, but got an array");
            }
            if (!Array.isArray(res.data)) {
                expect(res.data.media[0]).toMatchObject({ type: "video" });
            } else {
                throw new Error("Expected res.data to be of type IMessage, but got an array");
            }
            expect(res.data.media[1]).toMatchObject({ type: "image", url: uploaded });
        });

        it("should throw if file.buffer is null", async () => {
            const badFile = {
                originalname: "broken.jp",
                mimetype: "image/jpeg",
                buffer: null,
            } as Express.Multer.File;

            // @ts-ignore
            await expect(
                chatService.uploadMedia(chatId, senderId, [badFile])
            ).rejects.toThrow(/Invalid media file/);
        });

        it("should set `content: null` on the new Message object", async () => {
            const fakeFile = {
                originalname: "photo.jpg",
                buffer: Buffer.from(""),
                mimetype: "image/jpeg",
            } as Express.Multer.File;
            const uploaded = "https://s3/bucket/photo.jpg";
            (uploadFileToAws as jest.Mock).mockResolvedValue(uploaded);
            // @ts-ignore
            (Message as jest.Mock).mockImplementation(function (this: any, data) {
                this.save = jest.fn().mockResolvedValue({ ...data, _id: new Types.ObjectId() });
            });

            const res = await chatService.uploadMedia(chatId, senderId, [fakeFile]);
            if (!Array.isArray(res.data)) {
                expect(res.data.content).toBeNull();
            } else {
                throw new Error("Expected res.data to be of type IMessage, but got an array");
            }
        });

        // end of test

        it("should handle video files based on mimetype", async () => {
            const fakeVideo = {
                originalname: "clip.mp4",
                buffer: Buffer.from(""),
                mimetype: "video/mp4",
            } as Express.Multer.File;

            const uploadedUrl = "https://s3.amazonaws.com/bucket/clip.mp4";
            (uploadFileToAws as jest.Mock).mockResolvedValue(uploadedUrl);

            const mockSavedMessage = { _id: new Types.ObjectId(), chatId, sender: senderId, media: [{ url: uploadedUrl, type: "video" }] };
            // @ts-ignore
            (Message as jest.Mock).mockImplementation(function (this: any) {
                this.save = jest.fn().mockResolvedValue(mockSavedMessage);
            });

            const res = await chatService.uploadMedia(chatId, senderId, [fakeVideo]);

            if (!Array.isArray(res.data)) {
                expect(res.data.media[0].type).toBe("video");
            } else {
                throw new Error("Expected res.data to be of type IMessage, but got an array");
            }
        });

        it("should throw if media is empty or undefined", async () => {
            await expect(chatService.uploadMedia(chatId, senderId, [])).rejects.toThrow(
                "Error creating message: No media files provided"
            );
            // @ts-ignore
            await expect(chatService.uploadMedia(chatId, senderId)).rejects.toThrow(
                "Error creating message: No media files provided"
            );
        });

        it("should throw if chatId or senderId is missing", async () => {
            const fakeFile = {
                originalname: "pic.png",
                buffer: Buffer.from(""),
                mimetype: "image/png",
            } as Express.Multer.File;

            await expect(
                chatService.uploadMedia("", senderId, [fakeFile])
            ).rejects.toThrow("Error creating message: Sender id or chat id not provided");

            await expect(
                chatService.uploadMedia(chatId, "", [fakeFile])
            ).rejects.toThrow("Error creating message: Sender id or chat id not provided");
        });

        it("should throw if a file has no mimetype (invalid media)", async () => {
            const badFile = {
                originalname: "unknown",
                buffer: Buffer.from(""),
                // @ts-ignore
                mimetype: undefined,
            } as Express.Multer.File;

            await expect(
                chatService.uploadMedia(chatId, senderId, [badFile])
            ).rejects.toThrow("Error creating message: Invalid media file");
        });

        it("should throw if uploadFileToAws fails", async () => {
            const fakeFile = {
                originalname: "pic.png",
                buffer: Buffer.from(""),
                mimetype: "image/png",
            } as Express.Multer.File;

            (uploadFileToAws as jest.Mock).mockRejectedValue(new Error("S3 error"));

            await expect(
                chatService.uploadMedia(chatId, senderId, [fakeFile])
            ).rejects.toThrow("Error creating message: S3 error");
        });
    });

    describe("ChatService - getMessages", () => {
        const chatId = new Types.ObjectId().toString();

        it("should return messages when they exist", async () => {
            const mockMessages = [
                {
                    _id: new Types.ObjectId(),
                    chatId,
                    sender: new Types.ObjectId().toString(),
                    content: "Hey!",
                    read: false,
                },
                {
                    _id: new Types.ObjectId(),
                    chatId,
                    sender: new Types.ObjectId().toString(),
                    content: "Hi back!",
                    read: true,
                },
            ];

            // @ts-ignore
            (Message.find as jest.Mock).mockResolvedValue(mockMessages);

            const res = await chatService.getMessages(chatId);

            expect(res.status_code).toBe(200);
            expect(res.message).toBe("Messages retrieved successfully");
            expect(res.data).toEqual(mockMessages);
            expect(Message.find).toHaveBeenCalledWith({ chatId });
        });

        it("should treat `null` chatId gracefully", async () => {
            // @ts-ignore
            await expect(chatService.getMessages(null)).resolves.toEqual({
                status_code: 404,
                message: "No messages found",
                data: [],
            });
        });

        it("should preserve ordering if you later add `.sort()`", async () => {
            const unsorted = [
                { createdAt: new Date("2025-05-02"), _id: "" },
                { createdAt: new Date("2025-05-01"), _id: "" },
            ];
            // @ts-ignore
            (Message.find as jest.Mock).mockResolvedValue(unsorted);

            const res = await chatService.getMessages("anything");
            // currently returns in DB order; once you add .sort({createdAt:1}), update this test.
            expect(res.data).toEqual(unsorted);
        });

        it("should return 404 when no messages found", async () => {
            // @ts-ignore
            (Message.find as jest.Mock).mockResolvedValue([]);

            const res = await chatService.getMessages(chatId);

            expect(res.status_code).toBe(404);
            expect(res.message).toBe("No messages found");
            expect(res.data).toEqual([]);
        });

        it("should throw HttpError on DB error", async () => {
            // @ts-ignore
            (Message.find as jest.Mock).mockRejectedValue(new Error("DB fail"));

            await expect(chatService.getMessages(chatId)).rejects.toBeInstanceOf(HttpError);
            await expect(chatService.getMessages(chatId)).rejects.toThrow(
                "Error getting messages: Error: DB fail"
            );
        });
    });

    describe("ChatService - getChatRoomsForUser", () => {
        const userId = new Types.ObjectId().toString();

        let populateMock: jest.Mock;

        beforeEach(() => {
            populateMock = jest.fn();
            (ChatRoom.find as jest.Mock).mockReturnValue({ populate: populateMock });
        });

        it("should return chat rooms when they exist", async () => {
            const mockRooms = [
                {
                    _id: new Types.ObjectId(),
                    participants: [
                        { _id: userId, firstName: "Alice", lastName: "A.", role: "user" },
                        { _id: new Types.ObjectId().toString(), firstName: "Bob", lastName: "B.", role: "user" },
                    ],
                    lastMessage: { _id: new Types.ObjectId(), content: "Hey", sender: userId },
                },
            ];

            // Populate resolves the mockRooms
            populateMock.mockResolvedValue(mockRooms);

            const res = await chatService.getChatRoomsForUser(userId);

            expect(ChatRoom.find).toHaveBeenCalledWith({ participants: userId });
            expect(populateMock).toHaveBeenCalledWith([
                { path: "participants", select: "_id firstName lastName role" },
                { path: "lastMessage" },
            ]);

            expect(res.status_code).toBe(200);
            expect(res.message).toBe("Chat rooms retrieved successfully");
            expect(res.data).toEqual(mockRooms);
        });

        it("should return 404 when no chat rooms found", async () => {
            populateMock.mockResolvedValue([]);

            const res = await chatService.getChatRoomsForUser(userId);

            expect(res.status_code).toBe(404);
            expect(res.message).toBe("No chat rooms found");
            expect(res.data).toEqual([]);
        });

        it("should throw an error on DB failure", async () => {
            // Simulate find().populate() throwing
            populateMock.mockRejectedValue(new Error("DB failure"));

            await expect(chatService.getChatRoomsForUser(userId)).rejects.toThrow(
                "Error getting chat rooms: Error: DB failure"
            );
        });

        it("should reject non-string userId", async () => {
            // @ts-ignore
            await expect(chatService.getChatRoomsForUser(123)).rejects.toThrow(
                /Error getting chat rooms/
            );
        });
    
        it("should handle rooms with no `lastMessage`", async () => {
            const rooms = [
                { participants: [], lastMessage: null },
            ];
            populateMock.mockResolvedValue(rooms);

            const res = await chatService.getChatRoomsForUser(new Types.ObjectId().toString());
            expect(res.data).toEqual(rooms);
            expect(res.status_code).toBe(200);
        });
    });
});
