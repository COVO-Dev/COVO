import express from "express";
import { authMiddleware } from "../middleware/auth";
import { CovoSurveyController } from "../controllers/covoSurvey.controller";

const covoSurveyController = new CovoSurveyController();

const surveyRouters = express.Router();

surveyRouters.post("/submit-survey", authMiddleware, covoSurveyController.submitSurvey);
surveyRouters.get("/survey-history", authMiddleware, covoSurveyController.getSurveyHistory);

export { surveyRouters };
