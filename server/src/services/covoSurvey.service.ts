import { CovoSurvey } from "../models/covoSurverSchema.model";
import { Influencer } from "../models/influencers.models";
import { Brand } from "../models/brands.models";
import { HttpError } from "../middleware/errors";
import { Campaign } from "../models/campaign.models";
import { CovoSurveySchema } from "../schema/auth.schema";
import { ICovoSurvey } from "../types";
import { ServiceResponse } from "../types";
import { UserRole } from "../types/enum";


declare global {
    namespace Express {
        interface User {
            userId?: string;
            [key: string]: any;
        }
        interface Request {
            user?: User;
        }
    }
}

export class CovoSurveyService {

    /**
     *  Reusable method to calculate the creator's Covo score based on survey responses.
     * @param survey any
     * @returns 
     */

    private calculateCreatorCovoScore(survey: any): number {
        return (
            (survey.engagementPerception || 0) * 0.3 +
            (survey.deliveryConsistency || 0) * 0.25 +
            (survey.brandFeedback || 0) * 0.25 +
            (survey.audienceFit || 0) * 0.2
        );
    }

    /**
       *  Reusable method to calculate the brand's reliability score based on survey responses.
       * @param survey any
       * @returns 
       */

    private calculateBrandReliabilityScore(survey: any): number {
        return (
            (survey.communication || 0) * 0.4 +
            (survey.paymentTimeliness || 0) * 0.3 +
            (survey.respect || 0) * 0.3
        );
    }

    /**
       * Reusable method to validate payload using Zod schema.
       */
    private validatePayload(payload: any) {
        const result = CovoSurveySchema.safeParse(payload);
        if (!result.success) {
            const errorMessages = result.error.errors
                .map((err) => `${err.path.join(".")} ${err.message}`)
                .join(", ");
            throw new HttpError(400, `Invalid payload: ${errorMessages}`);
        }
    }

    /**
     * Submits a survey for either brand or influencer feedback.
     * Validates user authorization and checks if the survey has already been submitted.
     * Updates the Covo score for influencers and reliability rating for brands based on survey responses.
     *
     * @param data - The survey data to be submitted.
     * @param user - The user submitting the survey, containing role and ID.
     * @returns A service response with the status code, message, and submitted survey data.
     */

    public async submitSurvey(data: ICovoSurvey, user: any): Promise<ServiceResponse<any>> {
        this.validatePayload(data);

        const { campaignId, influencerId, brandId, type } = data;

        const isAuthorized =
            (type === "brand_feedback" && user.role === UserRole.Brand && user.userId.toString() === brandId.toString()) ||
            (type === "creator_feedback" && user.role === UserRole.Influencer && user.userId.toString() === influencerId.toString());

        if (!isAuthorized) throw new HttpError(403, "Unauthorized to submit this survey.");

        const exists = await CovoSurvey.findOne({ campaignId, influencerId, brandId, type });
        if (exists) throw new Error("Survey already submitted for this campaign and type.");

        const survey = new CovoSurvey(data);
        await survey.save();

        if (type === "brand_feedback") {
            const creatorSurvey = await CovoSurvey.find({ influencerId, type: "brand_feedback" });
            const avg =
                creatorSurvey.reduce((sum: number, s: any) => sum + this.calculateCreatorCovoScore(s), 0) /
                creatorSurvey.length;

            await Influencer.findByIdAndUpdate(influencerId, {
                $set: { "covoScore.overall": avg.toFixed(2) }
            });
        }

        if (type === "creator_feedback") {
            const brandSurvey = await CovoSurvey.find({ brandId, type: "creator_feedback" });
            const avg =
                brandSurvey.reduce((sum, s) => sum + this.calculateBrandReliabilityScore(s), 0) /
                brandSurvey.length;

            await Brand.findByIdAndUpdate(brandId, {
                $set: { "reliabilityRating.overall": avg.toFixed(2) }
            });
        }

        return {
            status_code: 200,
            message: "Survey submitted successfully",
            data: survey
        }
    }

    /**
     * Retrieves the survey history for the authenticated user.
     * Filters surveys based on user role (brand or influencer) and populates related campaign and user data.
     *
     * @param user - The user requesting the survey history, containing role and ID.
     * @returns A service response with the status code, message, and survey history data.
     */

    public async getSurveyHistory(user: any): Promise<ServiceResponse<any>> {
        const filter =
            user.role === UserRole.Brand
                ? { brandId: user.userId }
                : user.role === UserRole.Influencer
                    ? { influencerId: user.userId }
                    : {};

        const surveys = await CovoSurvey.find(filter)
            .sort({ createdAt: -1 })
            .populate("campaignId", "title")
            .populate("influencerId", "username")
            .populate("brandId", "companyName");

        return {
            status_code: 200,
            message: "Survey history fetched",
            data: surveys
        };
    }

}
