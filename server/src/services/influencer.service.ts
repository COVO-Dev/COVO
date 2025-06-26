import { IInfluencer } from "../types";
import { Influencer } from "../models/influencers.models";
import { ServiceResponse, SearchResponse } from "../types";
import { HttpError } from "../middleware/errors";
import {
  influencerMoreInformationSchema,
} from "../schema/auth.schema";
import { ResourceNotFound } from "../middleware/errors";
import { ZodSchema } from "zod";

export class InfluencerService {
  /**
   * Reusable method to validate payload using Zod schema.
   */
  private validatePayload(payload: any, schema: ZodSchema) {
    const result = schema.safeParse(payload);
    console.log("validatePayload service: ", result?.error);
    if (!result.success) {
      const errorMessages = result.error.errors
        .map((err) => `${err.path.join(".")} ${err.message}`)
        .join(", ");
      throw new HttpError(400, errorMessages);
    }
  }

  /**
   * Get Influencer details.
   *
   * @param payload ID of the influencer
   * @returns A promise that is resolved when the request is made.
   */

  public async getInfluencerDetails(payload: {
    id: string;
  }): Promise<ServiceResponse<IInfluencer>> {
    try {
      // Validate payload ID
      if (!payload?.id) {
        throw new ResourceNotFound("Invalid influencer ID provided");
      }

      const influencer = await Influencer.findById(payload.id).select(
        "-password"
      );

      if (!influencer) {
        throw new ResourceNotFound("User not found");
      }

      return { status_code: 200, message: "User found", data: influencer };
    } catch (err) {
      console.error("Error fetching influencer details: ", err);

      if (err instanceof ResourceNotFound) {
        throw err;
      }
      throw new Error("An error occurred while fetching influencer details");
    }
  }

  /**
   * fetches influencer data and allows partial updates
   * @param payload
   * @returns A promise that resolves when the data is fetched and updated.
   */

  public async getInfluencerAndUpdate(
    payload: Partial<IInfluencer>
  ): Promise<ServiceResponse<IInfluencer>> {
    this.validatePayload(payload, influencerMoreInformationSchema);
    try {
      console.log("getInfluencerAndUpdate: ", payload);
      const influencer = await Influencer.findByIdAndUpdate(
        payload.id,
        payload,
        {
          new: true,
        }
      );
      if (!influencer) {
        throw new ResourceNotFound("User not found");
      }

      return { status_code: 200, message: "User updated", data: influencer };
    } catch (err) {
      if (err instanceof HttpError) {
        throw err;
      }
      throw new Error(err);
    }
  }

  /**
   * Update influencer details.
   *
   * @param payload Contains influencer ID and update fields
   * @returns A promise that resolves with the updated influencer data
   */
  public async updateInfluencer(
    payload: Partial<IInfluencer>
  ): Promise<ServiceResponse<IInfluencer>> {
    // Validate payload using schema
    this.validatePayload(payload, influencerMoreInformationSchema);

    try {
      // Find and update influencer by ID
      const updatedInfluencer = await Influencer.findByIdAndUpdate(
        payload.id,
        { $set: payload },
        { new: true, runValidators: true }
      );

      console.log("Updated influencer", updatedInfluencer);

      // Check if influencer exists
      if (!updatedInfluencer) {
        throw new ResourceNotFound("Influencer not found");
      }

      return {
        status_code: 200,
        message: "Influencer information updated successfully.",
        data: updatedInfluencer,
      };
    } catch (error) {
      if (error instanceof ResourceNotFound) {
        throw error
      }
      throw new HttpError(
        500,
        error.message || "Error updating influencer information"
      );
    }
  }

  /**
   * Search Influencers with pagination.
   * @param searchParams - Search parameters
   * @param page - Current page for pagination
   * @param limit - Number of results per page
   * @returns A list of influencers matching the search criteria
   */
  public async searchInfluencers(
    searchParams: {
      username?: string;
      primaryNiche?: string;
      secondaryNiche?: string;
      country?: string;
      name?: string;
    } = {},
    page: number = 1,
    limit: number = 10
  ): Promise<SearchResponse<IInfluencer>> {
    const { name, username, primaryNiche, secondaryNiche, country } =
      searchParams;

    try {
      // Build query
      const query: any = {};

      if (username) {
        query.username = { $regex: username, $options: "i" };
      }

      if (name) {
        query.name = { $regex: name, $options: "i" };
      }

      if (primaryNiche) {
        query["contentAndAudience.primaryNiche"] = {
          $regex: primaryNiche,
          $options: "i",
        };
      }

      if (secondaryNiche) {
        query["contentAndAudience.secondaryNiche"] = {
          $regex: secondaryNiche,
          $options: "i",
        };
      }

      if (country) {
        query["location.country"] = { $regex: country, $options: "i" };
      }

      const skip = (page - 1) * limit;

      const pipeline = [
        {
          $addFields: {
            name: { $concat: ["$firstName", " ", "$lastName"] },
          },
        },
        {
          $match: query,
        },
        {
          $facet: {
            data: [
              { $skip: skip },
              { $limit: limit },
              { $project: { password: 0 } },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
        {
          $unwind: {
            path: "$totalCount",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            data: 1,
            totalCount: { $ifNull: ["$totalCount.count", 0] },
          },
        },
      ];

      // Run the aggregation pipeline.
      const result = await Influencer.aggregate(pipeline);
      const { data, totalCount } = result[0] || { data: [], totalCount: 0 };

      return {
        status_code: 200,
        message: "Influencers found.",
        data: {
          data,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
        },
      };
    } catch (err) {
      throw new HttpError(500, err.message || "Error searching influencers.");
    }
  }
}
