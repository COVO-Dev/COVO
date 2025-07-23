import { handleReferralClick } from "../controllers/clickLog.controller";
import Router from "express";

const clickLogRouter = Router();

clickLogRouter.post("/ref/:referralCode", handleReferralClick);

export { clickLogRouter };