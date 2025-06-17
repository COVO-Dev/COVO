import { DeactivationService } from "../services/deactivation.service";
import { User } from "../models/users.models";
import { Deactivation } from "../models/deactivation.models";
import { HttpError } from "../middleware/errors";
import { Types } from "mongoose";
import { Influencer } from "../models/influencers.models";
import { getPlatformModel } from "../middleware/helper";

jest.mock("../models/influencers.models");
jest.mock("../middleware/helper");
jest.mock("../models/users.models");
jest.mock("../models/deactivation.models");
jest.mock("../middleware/errors")




jest.mock("../models/influencers.models", () => {
    return {
      Influencer: {
        findById: jest.fn(),
      },
    };
  });
  

describe("DeactivationService - deactivateUserAccount", () => {
    const service = new DeactivationService();

    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    describe("deactivateUserAccount", () => {
        const userId = new Types.ObjectId().toString();
        it("should deactivate user and save deactivation data", async () => {
            const mockUser = { _id: userId, toObject: () => ({ name: "John Doe" }) };
            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (Deactivation.prototype.save as jest.Mock).mockResolvedValue({});
            (User.findByIdAndDelete as jest.Mock).mockResolvedValue({});

            const res = await service.deactivateUserAccount(userId, "No longer needed");

            expect(res.status_code).toBe(200);
            expect(res.data).toBe("Account deactivated");
        });

        it("should throw error for invalid userId", async () => {
            await expect(
                service.deactivateUserAccount("invalid_id", "Reason")
            ).rejects.toThrow("Invalid user ID");
        });

        it("should throw error for user not found", async () => {
            (User.findById as jest.Mock).mockResolvedValue(null);

            await expect(
                service.deactivateUserAccount("507f1f77bcf86cd799439011", "Reason")
            ).rejects.toThrow("User not found");
        });

        it("should throw validation error for invalid reason", async () => {
            await expect(
                service.deactivateUserAccount("507f1f77bcf86cd799439011", "")
            ).rejects.toThrow("Error deactivating user account: ");
        });

        it("should throw error if save fails", async () => {
            const mockUser = { _id: userId, toObject: () => ({ name: "John Doe" }) };
            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (Deactivation.prototype.save as jest.Mock).mockRejectedValue(new Error("DB Error"));

            await expect(
                service.deactivateUserAccount(userId, "Some reason")
            ).rejects.toThrow("Error deactivating user account: DB Error");
        });
    })

    describe("ReactivateUserAccount", () => {
        it("should reactivate user account successfully", async () => {
            const mockDeactivatedUser = {
                toObject: () => ({
                    userData: { name: "John Doe", email: "john@example.com" },
                }),
                userData: { name: "John Doe", email: "john@example.com" },
            };

            (Deactivation.findOne as jest.Mock).mockResolvedValue(mockDeactivatedUser);
            (User.prototype.save as jest.Mock).mockResolvedValue({});
            (Deactivation.deleteOne as jest.Mock).mockResolvedValue({});

            const res = await service.reactivateUserAccount("507f1f77bcf86cd799439011");

            expect(res.status_code).toBe(200);
            expect(res.data).toBe("Account reactivated");
        });

        it("should throw error for invalid userId", async () => {
            await expect(
                service.reactivateUserAccount("invalid-id")
            ).rejects.toThrow("Invalid user ID");
        });

        it("should throw error if user not found in deactivation table", async () => {
            (Deactivation.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                service.reactivateUserAccount("507f1f77bcf86cd799439011")
            ).rejects.toThrow("User not found in deactivation table");
        });

        it("should throw error if saving restored user fails", async () => {
            const mockDeactivatedUser = {
                toObject: () => ({
                    userData: { name: "Jane Doe", email: "jane@example.com" },
                }),
                userData: { name: "Jane Doe", email: "jane@example.com" },
            };

            (Deactivation.findOne as jest.Mock).mockResolvedValue(mockDeactivatedUser);
            (User.prototype.save as jest.Mock).mockRejectedValue(new Error("DB Save Error"));

            await expect(
                service.reactivateUserAccount("507f1f77bcf86cd799439011")
            ).rejects.toThrow("Error reactivating user account: DB Save Error");
        });

        it("should throw error if deletion from deactivation fails", async () => {
            const mockDeactivatedUser = {
                toObject: () => ({
                    userData: { name: "Jane Doe", email: "jane@example.com" },
                }),
                userData: { name: "Jane Doe", email: "jane@example.com" },
            };

            (Deactivation.findOne as jest.Mock).mockResolvedValue(mockDeactivatedUser);
            (User.prototype.save as jest.Mock).mockResolvedValue({});
            (Deactivation.deleteOne as jest.Mock).mockRejectedValue(new Error("Delete Error"));

            await expect(
                service.reactivateUserAccount("507f1f77bcf86cd799439011")
            ).rejects.toThrow("Error reactivating user account: Delete Error");
        });
    });
    
    describe("DisconnectSocialPlatform", () => {
        const mockPlatformModel = {
            deleteMany: jest.fn().mockResolvedValue({}),
        };
        it("should disconnect platform successfully", async () => {
            (Influencer.findById as jest.Mock).mockResolvedValue({ _id: "influencer123" });
            (getPlatformModel as jest.Mock).mockReturnValue(mockPlatformModel);

            const result = await service.disconnectSocialPlatform("507f1f77bcf86cd799439011", "instagram");

            expect(mockPlatformModel.deleteMany).toHaveBeenCalledWith({ influencerId: "507f1f77bcf86cd799439011" });
            expect(result.status_code).toBe(200);
            expect(result.data).toBe("instagram disconnected");
        });

        it("should throw error for invalid influencerId", async () => {
            await expect(
                service.disconnectSocialPlatform("invalid-id", "instagram")
            ).rejects.toThrow("Invalid influencer ID");
        });

        it("should throw error if influencer not found", async () => {
            (Influencer.findById as jest.Mock).mockResolvedValue(null);

            await expect(
                service.disconnectSocialPlatform("507f1f77bcf86cd799439011", "instagram")
            ).rejects.toThrow("Influencer not found");
        });

        it("should throw error for invalid platform", async () => {
            (Influencer.findById as jest.Mock).mockResolvedValue({ _id: "influencer123" });
            (getPlatformModel as jest.Mock).mockReturnValue(undefined);

            await expect(
                service.disconnectSocialPlatform("507f1f77bcf86cd799439011", "unknownPlatform")
            ).rejects.toThrow("Invalid platform");
        });

        it("should throw error if platform deletion fails", async () => {
            (Influencer.findById as jest.Mock).mockResolvedValue({ _id: "influencer123" });
            (getPlatformModel as jest.Mock).mockReturnValue({
                deleteMany: jest.fn().mockRejectedValue(new Error("DB Delete Error")),
            });

            await expect(
                service.disconnectSocialPlatform("507f1f77bcf86cd799439011", "youtube")
            ).rejects.toThrow("Error disconnecting from platform: DB Delete Error");
        });
    });




});
