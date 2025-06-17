import { Brand } from "../models/brands.models";
import { IBrand, ServiceResponse } from "../types";
import { HttpError, ResourceNotFound } from "../middleware/errors";
import { UserRole } from "../types/enum";
import { brandRegisterSchema } from "../schema/auth.schema";
import { SearchResponse } from "../types";
import { ZodSchema } from "zod";

export class BrandService {
  /**
   * Reusable method to validate payload using Zod schema.
   */

  private validatePayload(payload: any, schema: ZodSchema) {
    const result = schema.safeParse(payload);
    if (!result.success) {
      const errorMessages = result.error.errors
        .map((err) => `${err.path.join(".")} ${err.message}`)
        .join(", ");
      throw new HttpError(400, errorMessages);
    }
  }
  /**
   * Fetch All Brands with their details
   *
   * @returns A Promise that resolves to a list of all brands
   */

  public async getAllBrands(): Promise<ServiceResponse<IBrand>> {
    try {
      const brand = await Brand.find({}, "-password").populate('campaigns');
      if (!brand) {
        throw new ResourceNotFound("No brand found");
      }
      return { status_code: 200, message: "All brand found", data: brand };
    } catch (err) {
      console.log(err);
      if (err instanceof ResourceNotFound) {
        throw err;
      }
      throw new HttpError(500, "Internal server error");
    }
  }

  /**
   * Fetch a Brand details by ID
   *
   * @param payload - Brand ID
   * @returns A Promise that resolves to a single brand
   */

  public async getBrandDetails(payload: {
    id: string;
  }): Promise<ServiceResponse<IBrand>> {
    try {
      const brand = await Brand.findById(payload.id).select("-password");
      if (!brand) {
        throw new ResourceNotFound("User not found");
      }

      return { status_code: 200, message: "Brand Retrieved!", data: brand };
    } catch (err) {
      if (err instanceof ResourceNotFound) {
        throw err;
      }
      throw new HttpError(500, err.message || "Internal server error");
    }
  }

  /**
   * Update brand details. full update
   *
   * @param payload Contains brand ID and update fields
   * @returns A promise that resolves with the updated brand data
   */

  public async getBrandAndUpdate(
    payload: IBrand
  ): Promise<ServiceResponse<IBrand>> {
    try {
      const brand = await Brand.findByIdAndUpdate(payload.id, payload, {
        new: true,
      });
      if (!brand) {
        throw new ResourceNotFound("Brand not found");
      } else {
        return { status_code: 200, message: "Brand updated", data: brand };
      }
    } catch (err) {
      if (err instanceof ResourceNotFound) {
        throw err;
      }
      throw new HttpError(
        500, err.message || "Error updating brand information"
      );
    }
  }

  /**
   * Update brand details. Partial update
   *
   * @param payload Contains brand ID and update fields
   * @returns A promise that resolves with the updated brand data
   */
  public async updateBrand(payload: IBrand): Promise<ServiceResponse<IBrand>> {
    // Validate payload using schema
    this.validatePayload(payload, brandRegisterSchema);

    try {
      // Find and update brand by ID
      const updatedBrand = await Brand.findByIdAndUpdate(
        payload.id,
        { $set: payload },
        { new: true, runValidators: true }
      );

      console.log("Updated brand", updatedBrand);

      // Check if brand exists
      if (!updatedBrand) {
        throw new ResourceNotFound("brand not found");
      }

      return {
        status_code: 200,
        message: "brand information updated successfully.",
        data: updatedBrand,
      };
    } catch (error) {
      if (error instanceof ResourceNotFound) {
        throw error;
      }
      
      throw new HttpError(
        500,
        error.message || "Error updating brand information"
      );
    }
  }

  /**
   * Search brands with pagination.
   * @param searchParams - Search parameters
   * @param page - Current page for pagination
   * @param limit - Number of results per page
   * @returns A list of brands matching the search criteria
   */
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_LIMIT = 10;

  public async searchBrands(
    searchParams: { industry: string },
    page: number = this.DEFAULT_PAGE,
    limit: number = this.DEFAULT_LIMIT
  ): Promise<SearchResponse<IBrand>> {
    const { industry } = searchParams;

    try {
      const query: Record<string, any> = {};

      if (industry) query.industry = { $regex: industry, $options: "i" };

      const skip = (page - 1) * limit;

      const brand = await Brand.find(query)
        .skip(skip)
        .limit(limit)
        .select("-password");

      const totalCount = await Brand.countDocuments(query);

      return {
        status_code: 200,
        message: "brands found.",
        data: {
          data: brand,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
        },
      };
    } catch (err) {
      throw new HttpError(500, err.message || "Error searching brands.");
    }
  }
}
