import { InfluencerService } from "../services/influencer.service";
import { Influencer } from "../models/influencers.models";
import { influencerMoreInformationSchema } from "../schema/auth.schema";
import { HttpError, ResourceNotFound } from "../middleware/errors";

jest.mock("../models/influencers.models");

describe("InfluencerService", () => {
    const influencerService = new InfluencerService();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getInfluencerDetails", () => {
        test("should return influencer details", async () => {
            const mockInfluencer = { id: "123", name: "John Doe" };
            (Influencer.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockInfluencer),
            });

            const result = await influencerService.getInfluencerDetails({ id: "123" });
            expect(result.data).toEqual(mockInfluencer);
            expect(result.status_code).toBe(200);
        });

        test("should throw ResourceNotFound if influencer not found", async () => {
            (Influencer.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(null),
            });

            await expect(
                influencerService.getInfluencerDetails({ id: "123" })
            ).rejects.toThrow(ResourceNotFound);
        });

        test("should log error if unexpected error occurs", async () => {
            const spy = jest.spyOn(console, "error").mockImplementation(() => {});
            (Influencer.findById as jest.Mock).mockImplementation(() => {
              throw new Error("Unexpected failure");
            });
          
            await expect(
              influencerService.getInfluencerDetails({ id: "123" })
            ).rejects.toThrow("An error occurred while fetching influencer details");
          
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
          });   
          test("should throw ResourceNotFound if ID not provided", async () => {
            await expect(influencerService.getInfluencerDetails({ id: "" }))
                .rejects.toThrow(ResourceNotFound);
        });
               
    });

    describe("getInfluencerAndUpdate", () => {
        test("should update influencer successfully", async () => {
            const updatedInfluencer = { id: "123", firstName: "Updated" };
            jest.spyOn(influencerService as any, "validatePayload").mockImplementation(() => {});
            (Influencer.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedInfluencer);
        
            const result = await influencerService.getInfluencerAndUpdate(updatedInfluencer);
            expect(result.data).toEqual(updatedInfluencer);
            expect(result.status_code).toBe(200);
        });        
        test("should throw ResourceNotFound if influencer not found", async () => {
            (Influencer.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            const validPayload = {
                id: "123",
                bio: "just perhaps",
                contentAndAudience: {
                    primaryNiche: "Fashion",
                    brandGifting: false,
                    paidCollaborationsOnly: false,
                    contentSpecialisation: "Beauty",
                },
                location: {
                    country: "Nigeria",
                    city: "Lagos",
                },
                phoneNumber: "+1234567890"
            };

            await expect(
                influencerService.getInfluencerAndUpdate(validPayload as any)
            ).rejects.toThrow(ResourceNotFound);
        });


        test("should throw HttpError if validation fails", async () => {
            // Simulating invalid payload
            const invalidPayload = { id: "123" };
            await expect(
                influencerService.getInfluencerAndUpdate(invalidPayload)
            ).rejects.toThrow(HttpError);
        });

        test("should throw generic error on unexpected failure", async () => {
            (Influencer.findByIdAndUpdate as jest.Mock).mockImplementation(() => {
                throw new Error("Internal failure");
            });
        
            const payload = { id: "123", firstName: "Crash" };
        
            await expect(
                influencerService.getInfluencerAndUpdate(payload as any)
            ).rejects.toThrow("Internal failure");
        });
        
    });

    describe("updateInfluencer", () => {
        test("should update influencer", async () => {
            const updated = { id: "123", firstName: "Jane Doe" };

            jest.spyOn(influencerService as any, "validatePayload").mockImplementation(() => { });

            jest.spyOn(Influencer, 'findByIdAndUpdate').mockResolvedValue(updated);

            const result = await influencerService.updateInfluencer(updated);

            expect(result.data).toEqual(updated);
            expect(result.message).toMatch(/updated successfully/i);
        });

        test("should throw HttpError if update fails", async () => {
            (Influencer.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error("DB Error"));

            await expect(
                influencerService.updateInfluencer({ id: "123", name: "Error Test" } as any)
            ).rejects.toThrow(HttpError);
        });

        test("should throw HttpError for invalid payload", async () => {
            const invalidPayload = { id: "123", phoneNumber: "12345" };

            await expect(
                influencerService.updateInfluencer(invalidPayload as any)
            ).rejects.toThrow(HttpError);
        });
        test("updateInfluencer - should throw ResourceNotFound if influencer not found", async () => {
            (Influencer.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            await expect(
                influencerService.updateInfluencer({ id: "notFoundId", name: "x" } as any)
            ).rejects.toThrow(ResourceNotFound);
        });

        test("should fail if required field missing", async () => {
            const badPayload = { id: "123" }; // missing firstName, etc.

            await expect(
                influencerService.updateInfluencer(badPayload as any)
            ).rejects.toThrow(HttpError);
        });

        test("should throw HttpError when Mongoose validation fails", async () => {
            const err = new Error("Validation failed");
            (Influencer.findByIdAndUpdate as jest.Mock).mockRejectedValue(err);
        
            await expect(
                influencerService.updateInfluencer({ id: "123", firstName: "Fail" } as any)
            ).rejects.toThrow("Validation failed");
        });
        

    });

    describe("searchInfluencers", () => {
        test("should return paginated results", async () => {
            const mockData = [
                {
                    data: [{ id: "1", name: "John Doe" }],
                    totalCount: 1,
                },
            ];
            (Influencer.aggregate as jest.Mock).mockResolvedValue(mockData);

            const result = await influencerService.searchInfluencers({ username: "john" }, 1, 10);
            expect(result.status_code).toBe(200);
            expect(result.data.data.length).toBe(1);
        });

        test("should handle empty result set", async () => {
            (Influencer.aggregate as jest.Mock).mockResolvedValue([]);

            const result = await influencerService.searchInfluencers({}, 1, 10);
            expect(result.data.totalCount).toBe(0);
        });

        test("should throw error if DB fails", async () => {
            (Influencer.aggregate as jest.Mock).mockRejectedValue(new Error("Aggregation error"));

            await expect(
                influencerService.searchInfluencers({ name: "fail" }, 1, 10)
            ).rejects.toThrow(HttpError);
        });

        test("should handle multiple combined filters", async () => {
            const mockData = [{ data: [{ id: "1", username: "Filtered Influencer" }], totalCount: 1 }];
            (Influencer.aggregate as jest.Mock).mockResolvedValue(mockData);
        
            const filters = {
                username: "john",
                country: "nigeria",
                primaryNiche: "fashion",
                secondaryNiche: "beauty",
            };
        
            const result = await influencerService.searchInfluencers(filters, 1, 10);
            expect(result.data.data[0].username).toBe("Filtered Influencer");
        });        

        test("should return all influencers if no filters provided", async () => {
            (Influencer.aggregate as jest.Mock).mockResolvedValue([{ data: [], totalCount: 0 }]);

            const result = await influencerService.searchInfluencers({}, 1, 10);
            expect(result.status_code).toBe(200);
            expect(result.data.totalCount).toBe(0);
        });

        test("should return correct pagination details", async () => {
            const mockData = [{ data: Array(5).fill({ id: "1", firstName: "John Doe" }), totalCount: 25 }];
            (Influencer.aggregate as jest.Mock).mockResolvedValue(mockData);
        
            const result = await influencerService.searchInfluencers({}, 2, 5);
            expect(result.data.totalPages).toBe(5);
            expect(result.data.currentPage).toBe(2);
        }); 
        
        test("should throw HttpError for missing nested field", async () => {
            const invalidPayload = {
                id: "123",
                contentAndAudience: {
                    primaryNiche: "Fashion",
                },
            };
        
            await expect(
                influencerService.updateInfluencer(invalidPayload as any)
            ).rejects.toThrow(HttpError);
        });
        
        test("should work with undefined filters", async () => {
            const mockData = [{ data: [], totalCount: 0 }];
            (Influencer.aggregate as jest.Mock).mockResolvedValue(mockData);
        
            const result = await influencerService.searchInfluencers(undefined as any, 1, 10);
            expect(result.data.totalCount).toBe(0);
        });
        
    });
});
