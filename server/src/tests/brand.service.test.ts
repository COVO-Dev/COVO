jest.mock('../models/brands.models', () => ({
  Brand: {
    find: jest.fn(),
    findById: jest.fn()
  }
}));

function createMockFindChain(mockData: any[]) {
  return {
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnValue(mockData),
  };
}


import { Brand } from "../models/brands.models";
import { HttpError, ResourceNotFound } from "../middleware/errors";
import { BrandService } from "../services/brand.service";
import { IBrand } from "../types";

describe("BrandService - Brand Functions", () => {
  const brandService = new BrandService();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  test("should throw HttpError if payload validation fails", async () => {
    const invalidPayload = { id: "123" }; // missing required fields
    await expect(brandService.updateBrand(invalidPayload as any)).rejects.toThrow(HttpError);
  });
  

  describe("getAllBrands", () => {
    test("should return all brands successfully", async () => {
      const mockBrands = [
        { id: "brand1", name: "Brand One" },
        { id: "brand2", name: "Brand Two" }
      ];

      (Brand.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockBrands)
      });

      const response = await brandService.getAllBrands();

      expect(response.status_code).toBe(200);
      expect(response.message).toBe("All brand found");
      expect(response.data).toEqual(mockBrands);
    });

    test("should throw ResourceNotFound if no brands found", async () => {
      (Brand.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await expect(brandService.getAllBrands()).rejects.toThrow(ResourceNotFound);
    });

    test("should throw HttpError(500) if database error occurs", async () => {
      (Brand.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("Database error"))
      });

      await expect(brandService.getAllBrands()).rejects.toThrow(HttpError);
    });
  });

  describe("getBrandDetails", () => {
    test("should return brand details when found", async () => {
      const mockBrand = { id: "brand123", name: "Brand One" };

      (Brand.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockBrand)
      });

      const response = await brandService.getBrandDetails({ id: "brand123" });

      expect(response.status_code).toBe(200);
      expect(response.message).toBe("Brand Retrieved!");
      expect(response.data).toEqual(mockBrand);
    });

    test("should throw ResourceNotFound if brand not found", async () => {
      (Brand.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(brandService.getBrandDetails({ id: "brand123" }))
        .rejects.toThrow(ResourceNotFound);
    });

    test("should throw HttpError(500) if DB error occurs", async () => {
      (Brand.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error("Database Error"))
      });

      await expect(brandService.getBrandDetails({ id: "brand123" }))
        .rejects.toThrow(HttpError);
    });
  });

  jest.mock('../models/brands.models'); // mock the Brand model

  describe("BrandService - getBrandAndUpdate", () => {
    const brandService = new BrandService();

    beforeEach(() => {
      jest.resetAllMocks();
    });

    test("should update and return the brand", async () => {
      const mockBrand = { id: "brand123", position: "Updated Brand" };

      // Properly mock the findByIdAndUpdate method
      Brand.findByIdAndUpdate = jest.fn().mockResolvedValue(mockBrand);

      const response = await brandService.getBrandAndUpdate({ id: "brand123", position: "Updated Brand" } as unknown as IBrand);

      expect(response.status_code).toBe(200);
      expect(response.message).toBe("Brand updated");
      expect(response.data).toEqual(mockBrand);
    });

    test("should throw ResourceNotFound if brand not found", async () => {
      Brand.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await expect(
        brandService.getBrandAndUpdate({ id: "brand123", position: "Updated Brand" } as unknown as IBrand)
      ).rejects.toThrow(ResourceNotFound);
    });

    test("should throw HttpError if DB operation fails", async () => {
      Brand.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error("DB error"));

      await expect(
        brandService.getBrandAndUpdate({ id: "brand123", position: "Updated Brand" } as unknown as IBrand)
      ).rejects.toThrow(HttpError);
    });
  });

  describe("BrandService - updateBrand", () => {
    const brandService = new BrandService();

    beforeEach(() => {
      jest.resetAllMocks();
    });

    test("should update and return the brand after validation", async () => {
      const validPayload: IBrand = {
        id: "brand123",
        companyName: "Company ABC",
        password: "password123",
        email: "example@example.com",
        username: "user123",
        position: "CEO",
        industry: "Tech",
        logo: "https://example.com/logo.png",
      } as IBrand;

      const updatedBrand = {
        id: "brand123",
        name: "Updated Brand",
        password: "password123",
        email: "example@example.com",
        username: "user123",
        companyName: "Company ABC",
        position: "CEO",
        industry: "Tech",
        logo: "logo-url",
        // Add other required fields here
      };

      // Mocking the database update
      (Brand.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedBrand);

      const response = await brandService.updateBrand(validPayload);

      expect(response.status_code).toBe(200);
      expect(response.message).toBe("brand information updated successfully.");
      expect(response.data).toEqual(updatedBrand);
    });

    test("should throw ResourceNotFound if brand not found", async () => {
      const validPayload: IBrand = {
        id: "brand123",
        username: "Updated Brand",
        password: "password123",
        email: "example@example.com",
        companyName: "Company ABC",
        position: "CEO",
        industry: "Tech",
        logo: "https://example.com/logo.png",
      } as IBrand;

      (Brand.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(brandService.updateBrand(validPayload)).rejects.toThrow(ResourceNotFound);
    });

    test("should throw HttpError(400) if validation fails", async () => {
      const invalidPayload = {};

      await expect(brandService.updateBrand(invalidPayload as any)).rejects.toThrow(HttpError);
    });

    test("should throw HttpError(500) if update operation fails", async () => {
      const validPayload: IBrand = {
        id: "brand123",
        username: "user123",
        companyName: "Company ABC",
        password: "password123",
        email: "example@example.com",
        position: "CEO",
        industry: "Tech",
        logo: "https://example.com/logo.png",
      } as IBrand;

      (Brand.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error("DB error"));

      await expect(brandService.updateBrand(validPayload)).rejects.toThrow(HttpError);
    });
  });

  describe("BrandService - searchBrands", () => {
    const brandService = new BrandService();

    beforeEach(() => {
      jest.resetAllMocks();
    });

    test("should return brands matching search and pagination", async () => {
      const mockBrands = [{ id: "1", bio: "Fashion Brand" }];

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnValue(mockBrands),
      };

    (Brand.find as jest.Mock).mockReturnValue(mockQuery);
    (Brand.countDocuments as jest.Mock) = jest.fn();
    (Brand.countDocuments as jest.Mock).mockResolvedValue(1);

    const response = await brandService.searchBrands({ industry: "Fashion" }, 1, 10);

    expect(response.status_code).toBe(200);
    expect(response.message).toBe("brands found.");
    expect(response.data.data).toEqual(mockBrands);
    expect(response.data.totalCount).toBe(1);
    expect(response.data.totalPages).toBe(1);
    expect(response.data.currentPage).toBe(1);
  });

  test("should throw HttpError(500) if DB error occurs", async () => {
    (Brand.find as jest.Mock).mockImplementation(() => {
      throw new Error("DB error");
    });

    await expect(
      brandService.searchBrands({ industry: "Fashion" }, 1, 10)
    ).rejects.toThrow(HttpError);
  });

  test("should return all brands if no search parameter is provided", async () => {
    const mockBrands = [{ id: "1", industry: "Brand A" }];
    (Brand.find as jest.Mock).mockReturnValue(createMockFindChain(mockBrands));
    (Brand.countDocuments as jest.Mock).mockResolvedValue(1);
  
    const response = await brandService.searchBrands({ industry: "" }, 1, 10);
  
    expect(response.status_code).toBe(200);
    expect(response.data.data).toEqual(mockBrands);
  });  
});
});
