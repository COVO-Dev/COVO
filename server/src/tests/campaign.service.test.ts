jest.mock("../models/campaign.models", () => {
    const saveMock = jest.fn();

    // Create a mock instance of the Campaign
    const CampaignMock = jest.fn().mockImplementation(() => ({
        save: saveMock,
        populate: jest.fn().mockResolvedValue({
            _id: "cmp1",
            title: "Test Campaign",
            brandId: {
                firstName: "Jane",
                lastName: "Doe",
            },
            influencerId: [
                {
                    name: "John Doe",
                },
            ],
        }),
    }));

    // Mock static methods
    (CampaignMock as unknown as { find: jest.Mock }).find = jest.fn().mockReturnThis();
    (CampaignMock as unknown as { countDocuments: jest.Mock }).countDocuments = jest.fn();
    (CampaignMock as unknown as { findById: jest.Mock }).findById = jest.fn();
    (CampaignMock as unknown as { findByIdAndUpdate: jest.Mock }).findByIdAndUpdate = jest.fn();
    (CampaignMock as unknown as { findOne: jest.Mock }).findOne = jest.fn().mockReturnThis();
    (CampaignMock as unknown as { findOneAndUpdate: jest.Mock }).findOneAndUpdate = jest.fn().mockReturnThis();
    (CampaignMock as unknown as { findOneAndDelete: jest.Mock }).findOneAndDelete = jest.fn().mockReturnThis();
    (CampaignMock as unknown as { populate: jest.Mock }).populate = jest.fn().mockReturnThis();

    return {
        Campaign: CampaignMock
    };
});


jest.mock("../models/brands.models", () => ({
    Brand: {
        findById: jest.fn().mockResolvedValue({ _id: "brand1", campaigns: [] }),
        findByIdAndUpdate: jest.fn().mockResolvedValue({ _id: "brand1", campaigns: [] }),
        findOne: jest.fn().mockResolvedValue({ _id: "brand1", campaigns: [] }),

    }
}));

jest.mock("../models/influencers.models", () => ({
    Influencer: {
        findById: jest.fn().mockResolvedValue({ _id: "influencer1" }),
        findOne: jest.fn().mockResolvedValue({ _id: "influencer1" }),
    }
}));



import { CampaignProvider } from "../services/campaign.service";
import mongoose from "mongoose";
import { Campaign } from "../models/campaign.models";
import { Brand } from "../models/brands.models";
import { Influencer } from "../models/influencers.models";
import { ICampaign } from "../types";
import { HttpError, ResourceNotFound, BadRequest } from "../middleware/errors";

describe("Campaign Service - Brand Functions", () => {
    const campaignService = new CampaignProvider();
    const mockBrandId = new mongoose.Types.ObjectId();
    const campaignId = new mongoose.Types.ObjectId();
    const influencerId = new mongoose.Types.ObjectId();
    const brandId = new mongoose.Types.ObjectId();
    const message = "Excited to join!";
    const offer = 300;
    const appliedAt = new Date(Date.now() - 2 * 60 * 60 * 1000);

    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    describe("getAllCampaignsNoId", () => {
        test("should return paginated campaigns successfully", async () => {
            const mockCampaigns = [
                { id: "cmp1", name: "Campaign 1", brandId: { firstName: "Jane", lastName: "Doe" } }
            ];

            (Campaign.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockCampaigns)
            });

            (Campaign.countDocuments as jest.Mock).mockResolvedValue(1);

            const response = await campaignService.getAllCampaignsNoId(1, 10);

            expect(response.status_code).toBe(200);
            expect(response.message).toBe("Campaigns retrieved successfully");
            expect(response.data.data).toEqual(mockCampaigns);
        });

        test("should throw ResourceNotFound if no campaigns are found", async () => {
            (Campaign.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([])
            });

            await expect(campaignService.getAllCampaignsNoId(1, 10))
                .rejects.toThrow(ResourceNotFound);
        });

        test("should throw generic error if database error occurs", async () => {
            (Campaign.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockRejectedValue(new Error("DB failure"))
            });

            await expect(campaignService.getAllCampaignsNoId(1, 10))
                .rejects.toThrow("Error retrieving campaigns: DB failure");
        });

        test("should throw HttpError if invalid page or limit is provided", async () => {
            await expect(campaignService.getAllCampaignsNoId(-1, 10))
                .rejects.toThrow(Error);
            await expect(campaignService.getAllCampaignsNoId(1, -10))
                .rejects.toThrow(Error);
        });

        test("should throw HttpError if page or limit is not a number", async () => {
            await expect(campaignService.getAllCampaignsNoId(NaN, 10))
                .rejects.toThrow(Error);
            await expect(campaignService.getAllCampaignsNoId(1, NaN))
                .rejects.toThrow(Error);
        });
    });

    describe("createCampaign", () => {
        const payload: ICampaign = {
            brandId: mockBrandId,
            influencerId: [new mongoose.Types.ObjectId()],
            title: "Test Campaign",
            startDate: new Date(),
            endDate: new Date(),
            budgetRange: 5000,
            currency: "USD",
            targetAudience: "Adults",
            primaryGoals: ["Increase Awareness"],
            influencerType: "Micro",
            geographicFocus: "Global",
            collaborationPreferences: {
                hasWorkedWithInfluencers: true,
                exclusiveCollaborations: false,
                type: "Collaborative",
                styles: ["Casual"]
            },
            trackingAndAnalytics: {
                performanceTracking: true,
                metrics: ["CTR", "ROI"],
                reportFrequency: "Weekly"
            },
            status: "active",
            isDeleted: false,
            applications: [],
            recommendedInfluencers: []
        };
        test("should create a campaign successfully", async () => {
            (Brand.findById as jest.Mock).mockResolvedValue({ _id: mockBrandId });
            const saveMock = jest.fn().mockResolvedValue({
                ...payload,
                brandId: mockBrandId,
                populate: jest.fn().mockResolvedValue({
                    ...payload,
                    brandId: mockBrandId
                })
            });

            (Campaign.prototype.save as jest.Mock) = saveMock;
            (Brand.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

            const result = await campaignService.createCampaign(mockBrandId.toString(), payload);

            expect(result.status_code).toBe(201);
            expect(result.message).toBe("Campaign created successfully");
        });


        test("should throw BadRequest if the brand ID is invalid", async () => {
            const invalidBrandId = "invalidBrandId";

            await expect(campaignService.createCampaign(invalidBrandId, payload))
                .rejects.toThrow(new BadRequest("Invalid brand ID"));
        });

        test("should throw BadRequest if brand not found", async () => {

            (Brand.findById as jest.Mock).mockResolvedValue(null);

            await expect(campaignService.createCampaign(mockBrandId.toString(), payload))
                .rejects.toThrow("Brand not found");
        });

        test("should handle database errors gracefully", async () => {
            // Mock Brand.findById to throw an error (simulate database error)
            (Brand.findById as jest.Mock).mockRejectedValue(new Error("DB failure"));

            await expect(campaignService.createCampaign(mockBrandId.toString(), payload))
                .rejects.toThrowError("Error creating campaign: DB failure");
        });

        test("should throw error if the payload is invalid", async () => {
            const invalidPayload = { ...payload, title: undefined }; // Invalid payload (missing title)

            // Mock Brand.findById to return a valid brand
            (Brand.findById as jest.Mock).mockResolvedValue({ _id: mockBrandId });

            // Simulate validation error
            await expect(campaignService.createCampaign(mockBrandId.toString(), invalidPayload))
                .rejects.toThrow("title Required");
        });
    });

    describe("CampaignService - getAllCampaigns", () => {
        test("should return campaigns successfully", async () => {
            const mockCampaigns = [{ _id: "1", title: "Campaign A", brandId: "brand123" }];

            (Campaign.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    skip: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue(mockCampaigns),
                    }),
                }),
            });

            (Campaign.countDocuments as jest.Mock).mockResolvedValue(1);

            const result = await campaignService.getAllCampaigns(mockBrandId.toString(), 1, 10);

            expect(result.status_code).toBe(200);
            expect(result.data.data).toEqual(mockCampaigns);
            expect(result.data.totalPages).toBe(1);
            expect(result.data.totalCount).toBe(1);
            expect(result.data.currentPage).toBe(1);
        });

        test("should throw BadRequest for invalid brand ID", async () => {
            const invalidBrandId = "invalid-id";

            await expect(campaignService.getAllCampaigns(invalidBrandId)).rejects.toThrow(BadRequest);
        });

        test("should throw ResourceNotFound if no campaigns found", async () => {
            const validBrandId = "507f1f77bcf86cd799439011";

            (Campaign.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    skip: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([]),
                    }),
                }),
            });

            await expect(campaignService.getAllCampaigns(validBrandId)).rejects.toThrow(ResourceNotFound);
        });

        test("should throw Error if unexpected exception occurs", async () => {
            const validBrandId = "507f1f77bcf86cd799439011";

            (Campaign.find as jest.Mock).mockImplementation(() => {
                throw new Error("DB error");
            });

            await expect(campaignService.getAllCampaigns(validBrandId)).rejects.toThrow("Error retrieving campaigns: DB error");
        });
    });

    describe("CampaignService - getCampaignById", () => {
        test("should return campaign successfully", async () => {
            const campaign = {
                _id: "campaign123",
                brandId: "brand123",
                title: "Test Campaign",
            };

            (Campaign.findOne as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(campaign),
            });

            const result = await campaignService.getCampaignById("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439022");

            expect(result.status_code).toBe(200);
            expect(result.data).toEqual(campaign);
        });

        test("should throw BadRequest for invalid brand ID", async () => {
            await expect(
                campaignService.getCampaignById("invalid", "507f1f77bcf86cd799439022")
            ).rejects.toThrow(BadRequest);
        });

        test("should throw BadRequest for invalid campaign ID", async () => {
            await expect(
                campaignService.getCampaignById("507f1f77bcf86cd799439011", "invalid")
            ).rejects.toThrow(BadRequest);
        });

        test("should throw ResourceNotFound if campaign not found", async () => {
            (Campaign.findOne as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(
                campaignService.getCampaignById("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439022")
            ).rejects.toThrow(ResourceNotFound);
        });

        test("should throw Error if unexpected exception occurs", async () => {
            (Campaign.findOne as jest.Mock).mockImplementation(() => {
                throw new Error("Unexpected error");
            });

            await expect(
                campaignService.getCampaignById("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439022")
            ).rejects.toThrow("Error retrieving campaign: Unexpected error");
        });
    });

    describe("CampaignService - rejectInfluencerForCampaign", () => {
        test("should reject influencer and update campaign", async () => {
            const updatedCampaign = { _id: campaignId, brandId: mockBrandId, applications: [] };

            (Campaign.findOneAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(updatedCampaign),
            });

            const result = await campaignService.rejectInfluencerForCampaign(
                mockBrandId.toString(),
                campaignId.toString(),
                { influencerId: [influencerId] }
            );

            expect(result.status_code).toBe(200);
            expect(result.data).toEqual(updatedCampaign);
        });

        test("should throw BadRequest for invalid brand ID", async () => {
            await expect(
                campaignService.rejectInfluencerForCampaign("invalid", campaignId.toString(), {
                    influencerId: [influencerId],
                })
            ).rejects.toThrow(BadRequest);
        });

        test("should throw ResourceNotFound if campaign not found", async () => {
            (Campaign.findOneAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(
                campaignService.rejectInfluencerForCampaign(
                    mockBrandId.toString(),
                    campaignId.toString(),
                    { influencerId: [influencerId] }
                )
            ).rejects.toThrow(ResourceNotFound);
        });

        test("should throw generic error if something goes wrong", async () => {
            (Campaign.findOneAndUpdate as jest.Mock).mockImplementation(() => {
                throw new Error("DB error");
            });

            await expect(
                campaignService.rejectInfluencerForCampaign(
                    mockBrandId.toString(),
                    campaignId.toString(),
                    { influencerId: [influencerId] }
                )
            ).rejects.toThrow("Error updating campaign: DB error");
        });
    });

    describe("CampaignService - acceptInfluencerForCampaign", () => {
        test("should accept influencer and update campaign", async () => {
            const updatedCampaign = {
                _id: campaignId,
                brandId: mockBrandId,
                influencerId: [influencerId],
                applications: [],
            };

            (Campaign.findOneAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(updatedCampaign),
            });

            const result = await campaignService.acceptInfluencerForCampaign(
                mockBrandId.toString(),
                campaignId.toString(),
                { influencerId: [influencerId] }
            );

            expect(result.status_code).toBe(200);
            expect(result.data).toEqual(updatedCampaign);
        });

        test("should throw BadRequest for invalid brand ID", async () => {
            await expect(
                campaignService.acceptInfluencerForCampaign("invalidBrandId", campaignId.toString(), {
                    influencerId: [influencerId],
                })
            ).rejects.toThrow(BadRequest);
        });

        test("should throw BadRequest for invalid campaign ID", async () => {
            await expect(
                campaignService.acceptInfluencerForCampaign(mockBrandId.toString(), "invalidCampaignId", {
                    influencerId: [influencerId],
                })
            ).rejects.toThrow(BadRequest);
        });

        test("should throw BadRequest for invalid influencer ID", async () => {
            await expect(
                campaignService.acceptInfluencerForCampaign(mockBrandId.toString(), campaignId.toString(), {
                    influencerId: ["invalidInfluencerId"],
                } as any)
            ).rejects.toThrow(BadRequest);
        });

        test("should throw ResourceNotFound if campaign not found", async () => {
            (Campaign.findOneAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(
                campaignService.acceptInfluencerForCampaign(
                    mockBrandId.toString(),
                    campaignId.toString(),
                    { influencerId: [influencerId] }
                )
            ).rejects.toThrow(ResourceNotFound);
        });

        test("should throw generic error if something goes wrong", async () => {
            (Campaign.findOneAndUpdate as jest.Mock).mockImplementation(() => {
                throw new Error("DB error");
            });

            await expect(
                campaignService.acceptInfluencerForCampaign(
                    mockBrandId.toString(),
                    campaignId.toString(),
                    { influencerId: [influencerId] }
                )
            ).rejects.toThrow("Error updating campaign: DB error");
        });
    });

    describe("CampaignService - updateCampaign", () => {
        const payload = {
            title: "Updated Campaign Title",
            budget: 5000,
        };

        test("should successfully update campaign", async () => {
            const updatedCampaign = {
                _id: campaignId,
                brandId: mockBrandId,
                ...payload,
            };

            (Campaign.findOneAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(updatedCampaign),
            });

            const result = await campaignService.updateCampaign(
                mockBrandId.toString(),
                campaignId.toString(),
                payload
            );

            expect(result.status_code).toBe(200);
            expect(result.data).toEqual(updatedCampaign);
        });

        test("should throw BadRequest for invalid brand ID", async () => {
            await expect(
                campaignService.updateCampaign("invalidBrandId", campaignId.toString(), payload)
            ).rejects.toThrow(BadRequest);
        });

        test("should throw BadRequest for invalid campaign ID", async () => {
            await expect(
                campaignService.updateCampaign(mockBrandId.toString(), "invalidCampaignId", payload)
            ).rejects.toThrow(BadRequest);
        });

        test("should throw ResourceNotFound if campaign not found", async () => {
            (Campaign.findOneAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(
                campaignService.updateCampaign(
                    mockBrandId.toString(),
                    campaignId.toString(),
                    payload
                )
            ).rejects.toThrow(ResourceNotFound);
        });

        test("should throw generic error if something goes wrong", async () => {
            (Campaign.findOneAndUpdate as jest.Mock).mockImplementation(() => {
                throw new Error("Unexpected DB error");
            });

            await expect(
                campaignService.updateCampaign(
                    mockBrandId.toString(),
                    campaignId.toString(),
                    payload
                )
            ).rejects.toThrow("Error updating campaign: Unexpected DB error");
        });
    });

    describe("CampaignService - deleteCampaign", () => {
        test("should successfully soft-delete a campaign", async () => {
            const deletedCampaign = { _id: campaignId, brandId, is_deleted: true };

            (Campaign.findOneAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(deletedCampaign),
            });

            const result = await campaignService.deleteCampaign(brandId.toString(), campaignId.toString());

            expect(result.status_code).toBe(200);
            expect(result.data).toEqual(deletedCampaign);
        });

        test("should throw BadRequest for invalid brand ID", async () => {
            await expect(
                campaignService.deleteCampaign("invalidBrand", campaignId.toString())
            ).rejects.toThrow(BadRequest);
        });

        test("should throw BadRequest for invalid campaign ID", async () => {
            await expect(
                campaignService.deleteCampaign(brandId.toString(), "invalidCampaign")
            ).rejects.toThrow(BadRequest);
        });

        test("should throw ResourceNotFound if campaign not found", async () => {
            (Campaign.findOneAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(
                campaignService.deleteCampaign(brandId.toString(), campaignId.toString())
            ).rejects.toThrow(ResourceNotFound);
        });

        test("should throw generic error if something fails", async () => {
            (Campaign.findOneAndUpdate as jest.Mock).mockImplementation(() => {
                throw new Error("DB crash");
            });

            await expect(
                campaignService.deleteCampaign(brandId.toString(), campaignId.toString())
            ).rejects.toThrow("Error deleting campaign: DB crash");
        });
    });

    describe("CampaignService - applyToCampaign", () => {
        test("should successfully apply to a campaign", async () => {
            const mockCampaign = {
                _id: campaignId,
                applications: [],
                influencerId: [],
            };
            const mockInfluencer = { _id: influencerId };

            (Campaign.findById as jest.Mock).mockResolvedValue(mockCampaign);
            (Influencer.findById as jest.Mock).mockResolvedValue(mockInfluencer);
            (Campaign.findByIdAndUpdate as jest.Mock).mockResolvedValue({
                ...mockCampaign,
                applications: [
                    {
                        influencerId,
                        message,
                        offer,
                        appliedAt: expect.any(Date),
                    },
                ],
            });

            const result = await campaignService.applyToCampaign(
                campaignId.toString(),
                influencerId.toString(),
                message,
                offer
            );

            expect(result.status_code).toBe(200);
            expect(result.message).toMatch(/success/i);
            if (!Array.isArray(result.data) && result.data?.applications) {
                expect(result.data.applications).toHaveLength(1);
            } else {
                throw new Error("Unexpected data structure");
            }
        });

        test("should throw BadRequest for invalid campaign ID", async () => {
            await expect(
                campaignService.applyToCampaign("invalid", influencerId.toString(), message, offer)
            ).rejects.toThrow(BadRequest);
        });

        test("should throw BadRequest for invalid influencer ID", async () => {
            await expect(
                campaignService.applyToCampaign(campaignId.toString(), "invalid", message, offer)
            ).rejects.toThrow(BadRequest);
        });

        test("should throw ResourceNotFound if campaign not found", async () => {
            (Campaign.findById as jest.Mock).mockResolvedValue(null);

            await expect(
                campaignService.applyToCampaign(campaignId.toString(), influencerId.toString(), message, offer)
            ).rejects.toThrow(ResourceNotFound);
        });

        test("should throw ResourceNotFound if influencer not found", async () => {
            (Campaign.findById as jest.Mock).mockResolvedValue({ _id: campaignId, applications: [], influencerId: [] });
            (Influencer.findById as jest.Mock).mockResolvedValue(null);

            await expect(
                campaignService.applyToCampaign(campaignId.toString(), influencerId.toString(), message, offer)
            ).rejects.toThrow(ResourceNotFound);
        });

        test("should throw BadRequest if already applied", async () => {
            (Campaign.findById as jest.Mock).mockResolvedValue({
                _id: campaignId,
                applications: [{ influencerId }],
                influencerId: [],
            });
            (Influencer.findById as jest.Mock).mockResolvedValue({ _id: influencerId });

            await expect(
                campaignService.applyToCampaign(campaignId.toString(), influencerId.toString(), message, offer)
            ).rejects.toThrow("Influencer has already applied to this campaign");
        });

        test("should throw BadRequest if already enrolled", async () => {
            (Campaign.findById as jest.Mock).mockResolvedValue({
                _id: campaignId,
                applications: [],
                influencerId: [influencerId],
            });
            (Influencer.findById as jest.Mock).mockResolvedValue({ _id: influencerId });

            await expect(
                campaignService.applyToCampaign(campaignId.toString(), influencerId.toString(), message, offer)
            ).rejects.toThrow("Influencer is already enrolled to this campaign");
        });

        test("should throw generic error", async () => {
            (Campaign.findById as jest.Mock).mockImplementation(() => {
                throw new Error("Random failure");
            });

            await expect(
                campaignService.applyToCampaign(campaignId.toString(), influencerId.toString(), message, offer)
            ).rejects.toThrow("Error sending application: Random failure");
        });
    });

    describe("getCampaignsAppliedByInfluencerForBrand", () => {
        it("should return campaigns that influencer applied to", async () => {
            const mockCampaigns = [{ _id: "1" }, { _id: "2" }];
            (Campaign.find as jest.Mock).mockResolvedValue(mockCampaigns);

            const result = await campaignService.getCampaignsAppliedByInfluencerForBrand(
                influencerId.toString(),
                brandId.toString()
            );

            expect(result.status_code).toBe(200);
            expect(result.data).toEqual(mockCampaigns);
            expect(Campaign.find).toHaveBeenCalledWith({
                brandId: brandId.toString(),
                "applications.influencerId": influencerId.toString(),
            });
        });

        it("should throw ResourceNotFound if no campaigns found", async () => {
            (Campaign.find as jest.Mock).mockResolvedValue([]);

            await expect(
                campaignService.getCampaignsAppliedByInfluencerForBrand(influencerId.toString(), brandId.toString())
            ).rejects.toThrow(ResourceNotFound);
        });

        it("should throw BadRequest if influencerId is invalid", async () => {
            await expect(
                campaignService.getCampaignsAppliedByInfluencerForBrand("invalid_id", brandId.toString())
            ).rejects.toThrow(BadRequest);
        });

        it("should throw BadRequest if brandId is invalid", async () => {
            await expect(
                campaignService.getCampaignsAppliedByInfluencerForBrand(influencerId.toString(), "invalid_id")
            ).rejects.toThrow(BadRequest);
        });
    });

    describe("getRecommendedInfluencers", () => {
        it("should return recommended influencers for a valid campaign", async () => {
            const mockCampaign = {
                _id: campaignId,
                brandId,
                recommendedInfluencers: [
                    { influencer: "inf1", score: 90 },
                    { influencer: "inf2", score: 85 },
                ],
            };
            (Campaign.findOne as jest.Mock).mockResolvedValue(mockCampaign);

            const result = await campaignService.getRecommendedInfluencers(brandId.toString(), campaignId.toString());

            expect(result.status_code).toBe(200);
            expect(result.data.length).toBe(2);
            expect(result.data[0].influencer).toBe("inf1");
            expect(Campaign.findOne).toHaveBeenCalledWith({ _id: campaignId.toString(), brandId: brandId.toString() });
        });

        it("should throw ResourceNotFound if no campaign is found", async () => {
            (Campaign.findOne as jest.Mock).mockResolvedValue(null);

            await expect(
                campaignService.getRecommendedInfluencers(brandId.toString(), campaignId.toString())
            ).rejects.toThrow(ResourceNotFound);
        });

        it("should throw ResourceNotFound if no recommended influencers", async () => {
            const mockCampaign = {
                _id: campaignId,
                brandId,
                recommendedInfluencers: [],
            };
            (Campaign.findOne as jest.Mock).mockResolvedValue(mockCampaign);

            await expect(
                campaignService.getRecommendedInfluencers(brandId.toString(), campaignId.toString())
            ).rejects.toThrow(ResourceNotFound);
        });

        it("should throw BadRequest if brandId or campaignId is invalid", async () => {
            await expect(
                campaignService.getRecommendedInfluencers("invalid", campaignId.toString())
            ).rejects.toThrow(BadRequest);

            await expect(
                campaignService.getRecommendedInfluencers(brandId.toString(), "invalid")
            ).rejects.toThrow(BadRequest);
        });
    });

    describe("getCampaignsRegisteredByInfluencer", () => {
        it("should return campaigns the influencer is registered to", async () => {
            const mockCampaigns = [{ _id: "c1", name: "Campaign 1" }];
            const populateMock = jest.fn().mockResolvedValue(mockCampaigns);

            (Campaign.find as jest.Mock).mockReturnValue({ populate: populateMock });

            const result = await campaignService.getCampaignsRegisteredByInfluencer(influencerId.toString());

            expect(result.status_code).toBe(200);
            expect(result.data).toEqual(mockCampaigns);
            expect(Campaign.find).toHaveBeenCalledWith({
                influencerId: { $in: [influencerId.toString()] },
            });
            expect(populateMock).toHaveBeenCalledWith({
                path: "brandId",
                select: "firstName lastName -role",
            });
        });

        it("should throw ResourceNotFound if no registered campaigns found", async () => {
            const populateMock = jest.fn().mockResolvedValue([]);
            (Campaign.find as jest.Mock).mockReturnValue({ populate: populateMock });

            await expect(
                campaignService.getCampaignsRegisteredByInfluencer(influencerId.toString())
            ).rejects.toThrow(ResourceNotFound);
        });

        it("should throw BadRequest if influencerId is invalid", async () => {
            await expect(
                campaignService.getCampaignsRegisteredByInfluencer("invalid_id")
            ).rejects.toThrow(BadRequest);
        });
    });

    describe("getCampaignsAppliedByInfluencer", () => {
        it("should return campaigns the influencer applied for", async () => {
            const mockCampaigns = [{ _id: "c2", name: "Campaign 2" }];
            (Campaign.find as jest.Mock).mockResolvedValue(mockCampaigns);

            const result = await campaignService.getCampaignsAppliedByInfluencer(influencerId.toString());

            expect(result.status_code).toBe(200);
            expect(result.data).toEqual(mockCampaigns);
            expect(Campaign.find).toHaveBeenCalledWith({
                "applications.influencerId": influencerId.toString(),
            });
        });

        it("should throw ResourceNotFound if no applications found", async () => {
            (Campaign.find as jest.Mock).mockResolvedValue([]);

            await expect(
                campaignService.getCampaignsAppliedByInfluencer(influencerId.toString())
            ).rejects.toThrow(ResourceNotFound);
        });

        it("should throw BadRequest if influencerId is invalid", async () => {
            await expect(
                campaignService.getCampaignsAppliedByInfluencer("invalid_id")
            ).rejects.toThrow(BadRequest);
        });
    });

    describe("editApplication", () => {
        const mockApplication = {
            influencerId,
            message: "Old message",
            offer: 100,
            appliedAt,
            lastEditedAt: null,
        };

        const mockCampaign: any = {
            applications: [mockApplication],
            save: jest.fn().mockResolvedValue(true),
        };

        it("should edit the application successfully", async () => {
            (Campaign.findById as jest.Mock).mockResolvedValue(mockCampaign);
            (Influencer.findById as jest.Mock).mockResolvedValue({ _id: influencerId.toString() });

            const result = await campaignService.editApplication(
                influencerId.toString(),
                campaignId.toString(),
                "New message",
                200
            );

            expect(result.status_code).toBe(200);
            expect(result.message).toBe("Application edited successfully");
            expect(mockCampaign.save).toHaveBeenCalled();
            expect(mockCampaign.applications[0].message).toBe("New message");
            expect(mockCampaign.applications[0].offer).toBe(200);
        });

        it("should allow partial update (only message)", async () => {
            (Campaign.findById as jest.Mock).mockResolvedValue(mockCampaign);
            (Influencer.findById as jest.Mock).mockResolvedValue({ _id: influencerId });

            const result = await campaignService.editApplication(
                influencerId.toString(),
                campaignId.toString(),
                "Updated message"
            );

            expect(result.data.message).toBe("Updated message");
            expect(result.data.offer).toBe(200);
        });

        it("should throw if influencerId is invalid", async () => {
            await expect(
                campaignService.editApplication("invalid_id", campaignId.toString(), "msg")
            ).rejects.toThrow(BadRequest);
        });

        it("should throw if campaignId is invalid", async () => {
            await expect(
                campaignService.editApplication(influencerId.toString(), "invalid_id", "msg")
            ).rejects.toThrow(BadRequest);
        });

        it("should throw if campaign is not found", async () => {
            (Campaign.findById as jest.Mock).mockResolvedValue(null);
            await expect(
                campaignService.editApplication(influencerId.toString(), campaignId.toString(), "msg")
            ).rejects.toThrow(ResourceNotFound);
        });

        it("should throw if influencer is not found", async () => {
            (Campaign.findById as jest.Mock).mockResolvedValue(mockCampaign);
            (Influencer.findById as jest.Mock).mockResolvedValue(null);
            await expect(
                campaignService.editApplication(influencerId.toString(), campaignId.toString(), "msg")
            ).rejects.toThrow(ResourceNotFound);
        });

        it("should throw if application is not found in campaign", async () => {
            const campaignNoApp = {
                applications: [],
            };
            (Campaign.findById as jest.Mock).mockResolvedValue(campaignNoApp);
            (Influencer.findById as jest.Mock).mockResolvedValue({ _id: influencerId.toString });

            await expect(
                campaignService.editApplication(influencerId.toString(), campaignId.toString(), "msg")
            ).rejects.toThrow(ResourceNotFound);
        });

        it("should throw if application is older than 5 hours", async () => {
            const oldApp = {
                influencerId,
                appliedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
            };
            const campaignWithOldApp = {
                applications: [oldApp],
            };
            (Campaign.findById as jest.Mock).mockResolvedValue(campaignWithOldApp);
            (Influencer.findById as jest.Mock).mockResolvedValue({ _id: influencerId.toString });

            await expect(
                campaignService.editApplication(influencerId.toString(), campaignId.toString(), "msg")
            ).rejects.toThrow(BadRequest);
        });
    });

    describe("getInfluencerApplicationInCampaign", () => {
        const mockApplication = {
            influencerId,
            message: "Application msg",
            offer: 200,
        };

        const campaignWithApp = {
            applications: [mockApplication],
        };

        it("should return the influencer application", async () => {
            (Campaign.findById as jest.Mock).mockResolvedValue(campaignWithApp);

            const result = await campaignService.getInfluencerApplicationInCampaign(
                influencerId.toString(),
                campaignId.toString()
            );

            expect(result.status_code).toBe(200);
            expect(result.data).toEqual(mockApplication);
        });

        it("should throw if influencerId is invalid", async () => {
            await expect(
                campaignService.getInfluencerApplicationInCampaign("bad_id", campaignId.toString())
            ).rejects.toThrow(BadRequest);
        });

        it("should throw if campaignId is invalid", async () => {
            await expect(
                campaignService.getInfluencerApplicationInCampaign(influencerId.toString(), "bad_id")
            ).rejects.toThrow(BadRequest);
        });

        it("should throw if campaign is not found", async () => {
            (Campaign.findById as jest.Mock).mockResolvedValue(null);

            await expect(
                campaignService.getInfluencerApplicationInCampaign(influencerId.toString(), campaignId.toString())
            ).rejects.toThrow(ResourceNotFound);
        });

        it("should throw if influencer has not applied", async () => {
            const campaignNoApp = {
                applications: [],
            };
            (Campaign.findById as jest.Mock).mockResolvedValue(campaignNoApp);

            await expect(
                campaignService.getInfluencerApplicationInCampaign(influencerId.toString(), campaignId.toString())
            ).rejects.toThrow(ResourceNotFound);
        });
    });

    describe("getAllInfluencerApplications", () => {
        it("should return all applications of the influencer", async () => {
          const mockApplications = [
            {
              influencerId,
              message: "First",
              offer: 100,
            },
            {
              influencerId,
              message: "Second",
              offer: 200,
            },
          ];
      
          const campaignsWithApplications = [
            {
              _id: new mongoose.Types.ObjectId(),
              applications: [mockApplications[0]],
            },
            {
              _id: new mongoose.Types.ObjectId(),
              applications: [mockApplications[1], { influencerId: "other" }],
            },
          ];
      
          (Influencer.findById as jest.Mock).mockResolvedValue({ _id: influencerId });
          (Campaign.find as jest.Mock).mockResolvedValue(campaignsWithApplications);
      
          const result = await campaignService.getAllInfluencerApplications(
            influencerId.toString()
          );
      
          expect(result.status_code).toBe(200);
          expect(result.data.length).toBe(2);
          expect(result.data[0].application.message).toBe("First");
          expect(result.data[1].application.offer).toBe(200);
        });
      
        it("should return empty list if influencer has no applications", async () => {
          (Influencer.findById as jest.Mock).mockResolvedValue({ _id: influencerId.toString() });
          (Campaign.find as jest.Mock).mockResolvedValue([]);
      
          const result = await campaignService.getAllInfluencerApplications(
            influencerId.toString()
          );
      
          expect(result.status_code).toBe(200);
          expect(result.data).toEqual([]);
        });
      
        it("should throw if influencerId is invalid", async () => {
          await expect(
            campaignService.getAllInfluencerApplications("bad_id")
          ).rejects.toThrow(BadRequest);
        });
      
        it("should throw if influencer is not found", async () => {
          (Influencer.findById as jest.Mock).mockResolvedValue(null);
      
          await expect(
            campaignService.getAllInfluencerApplications(influencerId.toString())
          ).rejects.toThrow(ResourceNotFound);
        });
      
        it("should handle applications from multiple campaigns with mixed influencer IDs", async () => {
          const campaigns = [
            {
              _id: new mongoose.Types.ObjectId(),
              applications: [
                { influencerId, message: "Keep me" },
                { influencerId: "someone-else", message: "Skip me" },
              ],
            },
          ];
      
          (Influencer.findById as jest.Mock).mockResolvedValue({ _id: influencerId.toString() });
          (Campaign.find as jest.Mock).mockResolvedValue(campaigns);
      
          const result = await campaignService.getAllInfluencerApplications(
            influencerId.toString()
          );
      
          expect(result.data.length).toBe(1);
          expect(result.data[0].application.message).toBe("Keep me");
        });
      });
});