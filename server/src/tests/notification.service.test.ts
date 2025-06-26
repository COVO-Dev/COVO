import { NotificationService } from "../services/notification.service";
import { User } from "../models/users.models"
import { Notification } from "../models/notification.models";
import { sendNotification } from "../utils/sendNotification";
import WebSocket from "ws";
import mongoose from "mongoose";
import { UserRole } from "../types/enum";
import { NotificationCategory } from "../types/enum";
import { BadRequest, ResourceNotFound, InvalidInput } from "../middleware/errors";
import { emailQueue } from "../utils/redis";
import { connectedClients } from "../services/notification.service";


jest.mock("../models/users.models");
jest.mock("../models/notification.models");
jest.mock("../utils/sendNotification");

jest.mock("bull", () => {
    return jest.fn().mockImplementation(() => ({
        add: jest.fn(),
        process: jest.fn(),
        on: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined),
    }));
});


const mockedUser = User as jest.Mocked<typeof User>;
const mockedNotification = Notification as jest.Mocked<any>;
const mockedSendNotification = sendNotification as jest.Mock;

describe("NotificationService", () => {

    const service = new NotificationService;
    const validSenderId = new mongoose.Types.ObjectId().toString();
    const validReceiverId = new mongoose.Types.ObjectId().toString();
    const notificationId = new mongoose.Types.ObjectId().toString();

    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
        connectedClients.clear();
    });

    describe("NotificationService - createNotification", () => {
        const mockNotificationData = {
            subject: "New Message",
            body: "You have a new message",
            type: "message",
            role: UserRole.Influencer,
            category: NotificationCategory.Social,
        };

        afterAll(async () => {
            if (emailQueue && typeof emailQueue.close === "function") {
                await emailQueue.close(); // clean up Redis connection mock
            }
        });


        it("should create a notification and send via WebSocket and fallback", async () => {
            mockedUser.findById
                .mockResolvedValueOnce({ _id: validSenderId })
                .mockResolvedValueOnce({ _id: validReceiverId });

            mockedNotification.prototype.save.mockResolvedValue({
                ...mockNotificationData,
                senderId: validSenderId,
                recipientId: validReceiverId,
                status: "unread",
                timestamp: new Date(),
            });

            mockedSendNotification.mockResolvedValue({ status_code: 200 });

            // Mock WebSocket map
            const mockWs = {
                readyState: WebSocket.OPEN,
                send: jest.fn(),
            } as any;

            connectedClients.set(validReceiverId, mockWs);

            const result = await service.createNotification(
                validSenderId,
                validReceiverId,
                mockNotificationData
            );

            expect(result.status_code).toBe(201);
            expect(mockWs.send).toHaveBeenCalled();
            expect(mockedSendNotification).toHaveBeenCalled();
        });

        it("should fail if senderId is invalid", async () => {
            await expect(
                service.createNotification("invalid-id", validReceiverId, mockNotificationData)
            ).rejects.toThrow(BadRequest);
        });

        it("should fail if sender is not found", async () => {
            mockedUser.findById.mockResolvedValueOnce(null);

            await expect(
                service.createNotification(validSenderId, validReceiverId, mockNotificationData)
            ).rejects.toThrow(ResourceNotFound);
        });

        it("should fail if receiverId is invalid", async () => {
            mockedUser.findById.mockResolvedValueOnce({ _id: validSenderId }); // sender ok

            await expect(
                service.createNotification(validSenderId, "invalid-id", mockNotificationData)
            ).rejects.toThrow(BadRequest);
        });

        it("should warn if sendNotification fails but notification is saved", async () => {
            mockedUser.findById
                .mockResolvedValueOnce({ _id: validSenderId }) // sender
                .mockResolvedValueOnce({ _id: validReceiverId }); // receiver

            mockedNotification.prototype.save.mockResolvedValue({
                ...mockNotificationData,
                senderId: validSenderId,
                recipientId: validReceiverId,
                status: "unread",
                timestamp: new Date(),
            });

            mockedSendNotification.mockResolvedValue({ status_code: 500, data: null });

            const result = await service.createNotification(
                validSenderId,
                validReceiverId,
                mockNotificationData
            );

            expect(result.status_code).toBe(201);
            expect(result.message).toMatch(/fail to send/i);
        });

        it("should not send WebSocket if client not connected", async () => {
            mockedUser.findById
                .mockResolvedValueOnce({ _id: validSenderId })
                .mockResolvedValueOnce({ _id: validReceiverId });

            mockedNotification.prototype.save.mockResolvedValue({
                ...mockNotificationData,
                senderId: validSenderId,
                recipientId: validReceiverId,
                status: "unread",
                timestamp: new Date(),
            });

            mockedSendNotification.mockResolvedValue({ status_code: 200 });

            (global as any).connectedClients = new Map(); // no receiver in map

            const result = await service.createNotification(
                validSenderId,
                validReceiverId,
                mockNotificationData
            );

            expect(result.status_code).toBe(201);
        });

        it("should not send if WebSocket is not OPEN", async () => {
            mockedUser.findById
                .mockResolvedValueOnce({ _id: validSenderId })
                .mockResolvedValueOnce({ _id: validReceiverId });

            mockedNotification.prototype.save.mockResolvedValue({
                ...mockNotificationData,
                senderId: validSenderId,
                recipientId: validReceiverId,
                status: "unread",
                timestamp: new Date(),
            });

            mockedSendNotification.mockResolvedValue({ status_code: 200 });

            const mockWs = {
                readyState: WebSocket.CLOSED,
                send: jest.fn(),
            } as any;

            (global as any).connectedClients = new Map([[validReceiverId, mockWs]]);

            const result = await service.createNotification(
                validSenderId,
                validReceiverId,
                mockNotificationData
            );

            expect(mockWs.send).not.toHaveBeenCalled();
        });
    });

    describe("NotificationService - getNotifications", () => {
        it("should return notifications successfully", async () => {
            const mockData = [
                { _id: "notif1", subject: "Hello", status: "unread", isDeleted: false },
            ];

            mockedNotification.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockData),
            });

            const result = await service.getNotifications(validReceiverId.toString());
            expect(result.status_code).toBe(200);
            expect(result.data).toEqual(mockData);
        });

        it("should throw if recipientId is invalid", async () => {
            await expect(service.getNotifications("invalid-id")).rejects.toThrow(
                InvalidInput
            );
        });

        it("should throw if no notifications found", async () => {
            mockedNotification.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue([]),
            });

            await expect(service.getNotifications(validReceiverId.toString())).rejects.toThrow(
                ResourceNotFound
            );
        });

        it("should handle database errors", async () => {
            mockedNotification.find.mockImplementation(() => {
                throw new Error("DB error");
            });

            await expect(service.getNotifications(validReceiverId.toString())).rejects.toThrow(
                /Failed to retrieve notifications/i
            );
        });
    });

    describe("NotificationService - getUnreadNotifications", () => {

        it("should return unread notifications with population", async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                equals: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue([
                    { _id: "notif1", status: "unread", isDeleted: false },
                ]),
            };

            mockedNotification.find.mockReturnValue(mockQuery as any);

            const result = await service.getUnreadNotifications(validReceiverId.toString());
            expect(result.status_code).toBe(200);
            expect(result.data.length).toBeGreaterThan(0);
        });

        it("should return unread notifications without population", async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                equals: jest.fn().mockResolvedValue([
                    { _id: "notif2", status: "unread", isDeleted: false },
                ]),
            };

            mockedNotification.find.mockReturnValue(mockQuery as any);

            const result = await service.getUnreadNotifications(validReceiverId.toString(), false);
            expect(result.status_code).toBe(200);
        });

        it("should throw if recipientId is invalid", async () => {
            await expect(service.getUnreadNotifications("invalid-id")).rejects.toThrow(
                BadRequest
            );
        });

        it("should throw if no unread notifications found", async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                equals: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue([]),
            };

            mockedNotification.find.mockReturnValue(mockQuery as any);

            await expect(
                service.getUnreadNotifications(validReceiverId.toString())
            ).rejects.toThrow(ResourceNotFound);
        });

        it("should handle internal errors", async () => {
            mockedNotification.find.mockImplementation(() => {
                throw new Error("Unexpected failure");
            });

            await expect(
                service.getUnreadNotifications(validReceiverId.toString())
            ).rejects.toThrow(/Error retrieving notifications/i);
        });
    });

    describe("NotificationService - deleteNotification", () => {

        it("should delete notification successfully", async () => {
            const mockNotification = {
                _id: notificationId,
                recipientId: validReceiverId,
                isDeleted: false,
                save: jest.fn().mockResolvedValue(true),
            };

            mockedNotification.findOne.mockResolvedValue(mockNotification);

            const result = await service.deleteNotification(validReceiverId.toString(), notificationId);
            expect(result.status_code).toBe(200);
            expect(result.message).toBe("Notification deleted successfully");
            expect(mockNotification.save).toHaveBeenCalled();
        });

        it("should return if notification is already deleted", async () => {
            const mockNotification = {
                _id: notificationId,
                recipientId: validReceiverId,
                isDeleted: true,
            };

            mockedNotification.findOne.mockResolvedValue(mockNotification);

            const result = await service.deleteNotification(validReceiverId.toString(), notificationId);
            expect(result.status_code).toBe(200);
            expect(result.message).toBe("Notification is already deleted");
        });

        it("should throw if recipientId or notificationId is invalid", async () => {
            await expect(
                service.deleteNotification("bad-id", notificationId)
            ).rejects.toThrow(InvalidInput);

            await expect(
                service.deleteNotification(validReceiverId.toString(), "bad-id")
            ).rejects.toThrow(InvalidInput);
        });

        it("should throw if notification is not found", async () => {
            mockedNotification.findOne.mockResolvedValue(null);

            await expect(
                service.deleteNotification(validReceiverId.toString(), notificationId)
            ).rejects.toThrow(ResourceNotFound);
        });

        it("should handle internal errors", async () => {
            mockedNotification.findOne.mockImplementation(() => {
                throw new Error("DB error");
            });

            await expect(
                service.deleteNotification(validReceiverId.toString(), notificationId)
            ).rejects.toThrow(/Error deleting notification/i);
        });
    });

    describe("NotificationService - markNotificationAsRead", () => {

        it("should mark notification as read successfully", async () => {
            const mockNotification = {
                _id: notificationId,
                recipientId: validReceiverId,
                status: "read",
            };

            mockedNotification.findOneAndUpdate.mockResolvedValue(mockNotification);

            const result = await service.markNotificationAsRead(validReceiverId.toString(), notificationId);
            expect(result.status_code).toBe(200);
            expect(result.message).toBe("Notification marked as read successfully");
            expect(result.data).toEqual(mockNotification);
        });

        it("should throw if recipientId or notificationId is invalid", async () => {
            await expect(
                service.markNotificationAsRead("bad-id", notificationId)
            ).rejects.toThrow(InvalidInput);

            await expect(
                service.markNotificationAsRead(validReceiverId.toString(), "bad-id")
            ).rejects.toThrow(InvalidInput);
        });

        it("should throw if notification is not found", async () => {
            mockedNotification.findOneAndUpdate.mockResolvedValue(null);

            await expect(
                service.markNotificationAsRead(validReceiverId.toString(), notificationId)
            ).rejects.toThrow(ResourceNotFound);
        });

        it("should handle internal errors", async () => {
            mockedNotification.findOneAndUpdate.mockImplementation(() => {
                throw new Error("DB failure");
            });

            await expect(
                service.markNotificationAsRead(validReceiverId.toString(), notificationId)
            ).rejects.toThrow(/Error marking notification as read/i);
        });
    });


});
