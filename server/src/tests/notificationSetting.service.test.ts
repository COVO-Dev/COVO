import NotificationSettings from "../models/notificationSettings.models";
import mongoose from "mongoose";
import { NotificationSettingsService } from "../services/notificationSettings.service";
import { BadRequest } from "../middleware/errors";

jest.mock("../models/notificationSettings.models");

const mockedSettings = NotificationSettings as jest.Mocked<typeof NotificationSettings>;

describe("NotificationSettingsService ", () => {
    const service = new NotificationSettingsService();
    const recipientId = new mongoose.Types.ObjectId().toString();
    const mockUpdated = { recipient: recipientId, isEnabled: false };

    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    describe("NotificationSettingsService - getNotificationSettings", () => {

        it("should return settings if found", async () => {
            const mockSettings = { recipient: recipientId, isEnabled: true };
            mockedSettings.findOne.mockResolvedValue(mockSettings);

            const result = await service.getNotificationSettings(recipientId);
            expect(result.status_code).toBe(200);
            expect(result.message).toBe("Notification settings retrieved successfully");
            expect(result.data).toEqual(mockSettings);
        });

        it("should return 404 if settings not found", async () => {
            mockedSettings.findOne.mockResolvedValue(null);

            const result = await service.getNotificationSettings(recipientId);
            expect(result.status_code).toBe(404);
            expect(result.message).toBe("Notification settings not found");
            expect(result.data).toBeNull();
        });

        it("should throw BadRequest for invalid recipientId", async () => {
            await expect(service.getNotificationSettings("bad-id")).rejects.toThrow(BadRequest);
        });

        it("should throw for internal errors", async () => {
            mockedSettings.findOne.mockRejectedValue(new Error("DB Error"));

            await expect(service.getNotificationSettings(recipientId)).rejects.toThrow(
                /Failed to retrieve notification settings/i
            );
        });
    });

    describe("NotificationSettingsService - updateNotificationSettings", () => {

        it("should update settings successfully", async () => {
            mockedSettings.findOneAndUpdate.mockResolvedValue(mockUpdated);

            const result = await service.updateNotificationSettings(recipientId, {
                isEnabled: false,
            });

            expect(result.status_code).toBe(200);
            expect(result.message).toBe("Notification settings updated successfully");
            expect(result.data).toEqual(mockUpdated);
        });

        it("should throw BadRequest for invalid recipientId", async () => {
            await expect(
                service.updateNotificationSettings("bad-id", { isEnabled: false })
            ).rejects.toThrow(BadRequest);
        });

        it("should throw for internal errors", async () => {
            mockedSettings.findOneAndUpdate.mockRejectedValue(new Error("DB error"));

            await expect(
                service.updateNotificationSettings(recipientId, { isEnabled: true })
            ).rejects.toThrow(/Failed to update notification settings/i);
        });
    });
});

