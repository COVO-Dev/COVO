import { Request, Response } from "express";
import { CovoSurveyService } from "../services/covoSurvey.service";
import { asyncHandler } from "../middleware/helper";
import { sendJsonResponse } from "../middleware/helper";
import { BadRequest } from "../middleware/errors";
import getUserData from "../middleware/helper";

const covoSurveyService = new CovoSurveyService();

export class CovoSurveyController {

    /**
     * Handles survey submission for both brand and influencer feedback.
     * Validates the user role and ensures the survey is not already submitted.
     */

    public submitSurvey = asyncHandler(async (req: Request, res: Response) => {
        const userData = getUserData(req);
        if (!userData) {
            throw new BadRequest("User not authenticated");
        }
        const survey = await covoSurveyService.submitSurvey(req.body, userData);
        sendJsonResponse(res, survey.status_code, survey.message, survey.data);
    })

    /**
     * Retrieves the survey history for the authenticated user.
     * Validates the user role and fetches the survey history.
     */

    public getSurveyHistory = asyncHandler(async (req: Request, res: Response) => {
        const userData = getUserData(req);
        if (!userData) {
            throw new BadRequest("User not authenticated");
        }
        const surveys = await covoSurveyService.getSurveyHistory(userData);
        sendJsonResponse(res, surveys.status_code, surveys.message, surveys.data);
    })
}