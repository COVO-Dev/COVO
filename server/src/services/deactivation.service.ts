import { ServiceResponse } from "../types";
import { HttpError } from "../middleware/errors";
import { IDeactivation } from "../types";
import { isValidObjectId } from "../utils/valid";
import { deactivateRequestSchema } from "../schema/auth.schema";
import { Deactivation } from "../models/deactivation.models";
import { User } from "../models/users.models";
import mongoose, { Mongoose } from "mongoose";
import { getPlatformModel } from "../middleware/helper";
import { Influencer } from "../models/influencers.models";

export class DeactivationService {
  /**
   * Reusable method to validate payload using Zod schema.
   */
  private validatePayload(payload: any) {
    const result = deactivateRequestSchema.safeParse(payload);
    if (!result.success) {
      const errorMessages = result.error.errors
        .map((err) => `${err.path.join(".")} ${err.message}`)
        .join(", ");
      throw new HttpError(400, `Invalid payload: ${errorMessages}`);
    }
  }

  /**
   * Deactivates the user.
   * @param userId The ID of the user
   * @param deactivation_reason The reason for the deactivation
   * @return A promise that resolves when the deactivation is complete
   */

  public async deactivateUserAccount(
    userId: string,
    deactivationReason: string
  ): Promise<ServiceResponse<string>> {
    try {
      this.validatePayload({ deactivationReason });
      
      if (!isValidObjectId(userId)) {
        throw new Error("Invalid user ID");
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const deactivationData = new Deactivation({
        userId: user._id,
        deactivationReason,
        user_data: user.toObject()
      });

      await deactivationData.save();

      await User.findByIdAndDelete(userId);

      return {
        status_code: 200,
        message: "User account deactivated and data moved successfully",
        data: "Account deactivated",
      };
    } catch (error) {
      throw new Error(`Error deactivating user account: ${error.message}`);
    }
  }

  /**
   * Reactivates the user.
   * 
   * @param userId The ID of the user
   */
  public async reactivateUserAccount(userId: string): Promise<ServiceResponse<string>> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
      }

      const deactivatedUser = await Deactivation.findOne({ userId });

      if (!deactivatedUser) {
        throw new Error("User not found in deactivation table");
      }

      const userObject = deactivatedUser.toObject();

      const restoredUserData = new User({
        ...deactivatedUser.userData as any,
        is_active: true,
        deactivated_reason: null,
        deactivated_at: null,
      });
       
      await restoredUserData.save();

      await Deactivation.deleteOne({ userId });

      return {
        status_code: 200,
        message: "User account reactivated successfully",
        data: "Account reactivated",
      };
    } catch (error) {
      throw new Error(`Error reactivating user account: ${error.message}`);
    }
  }

  /**
   * Disconnect from social platforms.
   * 
   * @param userId The ID of the user
   * @param platform The platform to disconnect from
   */

  public async disconnectSocialPlatform(
    influencerId: string,
    platform: string
  ): Promise<ServiceResponse<string>> {
  try {
    if (!isValidObjectId(influencerId)) {
      throw new Error("Invalid influencer ID");
    }

    const influencer = await Influencer.findById(influencerId);
    if (!influencer) {
      throw new Error("Influencer not found");
    }

    const PlatformModel = getPlatformModel(platform) as mongoose.Model<any>;
    if (!PlatformModel) {
      throw new Error("Invalid platform");
    }


    await PlatformModel.deleteMany({ influencerId });

    console.log(`${platform} disconnected successfully`);
    return {
      status_code: 200,
      message: `${platform} disconnected successfully`,
      data: `${platform} disconnected`,
    };
  } catch (error) {
    throw new Error(`Error disconnecting from platform: ${error.message}`);
  }
}
}
