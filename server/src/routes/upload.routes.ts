import express from "express";
import multer from "multer";
import {
  getFileUrl,
  deleteFile,
  uploadProfile,
  uploadLogo,
  uploadContentFile,
  removeProfile,
  removeLogo,
} from "../controllers/upload.controller";
import { authMiddleware } from "../middleware/auth";

const uploadRouter = express.Router();

const upload = multer();

// uploadRouter.post("/upload", upload.single("file"), uploadDoc);
// influencer profile upload
uploadRouter.post(
  "/upload/:influencerId/profile",
  authMiddleware,
  upload.single("file"),
  uploadProfile
);

// brand logo upload
uploadRouter.post(
  "/upload/:brandId/logo",
  authMiddleware,
  upload.single("file"),
  uploadLogo
);

// influencer file/content upload
uploadRouter.post(
  "/upload/:influencerId/content",
  authMiddleware,
  upload.single("file"),
  uploadContentFile
);

// // Get a file URL (Quick check)
// uploadRouter.head("/file/:fileName", getFileUrl);

// Get a file URL
uploadRouter.get("/file/:fileName", getFileUrl);

// Delete file
uploadRouter.delete("/file/:fileName", deleteFile);

// Remove Influencer profile picture
uploadRouter.patch(
  "/remove/:influencerId/profile/:fileName",
  authMiddleware,
  removeProfile
);

// Remove brand logo
uploadRouter.patch(
  "/remove/:brandId/logo/:fileName",
  authMiddleware,
  removeLogo
);

export { uploadRouter };
