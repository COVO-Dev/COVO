import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  uploadFileToAws,
  getFileUrlFromAws,
  deleteFileFromAws,
  isFileAvailableInAwsBucket,
} from "../services/upload.service";
import { asyncHandler, sendJsonResponse } from "../middleware/helper";
import { Influencer } from "../models/influencers.models";
import { Brand } from "../models/brands.models";

/**
 * Controller for retrieving a file URL from AWS S3.
 */

export const getFileUrl = asyncHandler(async (req: Request, res: Response) => {
  // const { fileName } = req.params;
  const { fileName: encodedFileName } = req.params;
  const fileName = decodeURIComponent(encodedFileName);
  const fileUrl = await getFileUrlFromAws(fileName);
  return sendJsonResponse(res, 200, "File URL retrieved successfully", fileUrl);
});

/**
 * Controller for deleting a file from AWS S3.
 */
export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  // const { fileName } = req.params;
  const { fileName: encodedFileName } = req.params;
  const fileName = decodeURIComponent(encodedFileName);
  await deleteFileFromAws(fileName);
  return sendJsonResponse(res, 200, "File deleted successfully");
});

/**
 * Controller for uploading influencer profile picture.
 */
export const uploadProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { influencerId } = req.params;
    console.log("User ID:", influencerId);

    const file = req.file;

    if (!file) {
      return sendJsonResponse(res, 400, "No file uploaded");
    }

    if (!mongoose.Types.ObjectId.isValid(influencerId)) {
      return sendJsonResponse(res, 400, "Invalid influencer ID format");
    }

    const fileUrl = await uploadFileToAws(file.originalname, file.buffer);

    const user = await Influencer.findByIdAndUpdate(
      influencerId,
      { profilePicture: fileUrl },
      { new: true }
    );

    if (!user) {
      return sendJsonResponse(res, 404, "Influencer not found");
    }

    return sendJsonResponse(res, 200, "Profile picture uploaded successfully", {
      profilePicture: fileUrl,
      user,
    });
  }
);

/**
 * Controller for removing influencer profile picture.
 */
export const removeProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { influencerId, fileName: encodedFileName } = req.params;
    const fileName = decodeURIComponent(encodedFileName);
    const fileResult = await isFileAvailableInAwsBucket(fileName);
    console.log("User ID:", influencerId, "FileName:\n", fileName);

    // const file = req.file;

    if (!fileName) {
      return sendJsonResponse(res, 400, "No file in request parameter");
    }

    if (!fileResult) {
      return sendJsonResponse(res, 400, "File does not exist in bucket");
    }
    await deleteFileFromAws(fileName);

    if (!mongoose.Types.ObjectId.isValid(influencerId)) {
      return sendJsonResponse(res, 400, "Invalid influencer ID format");
    }

    const user = await Influencer.findByIdAndUpdate(
      influencerId,
      { profilePicture: null },
      { new: true }
    );

    if (!user) {
      return sendJsonResponse(res, 404, "Influencer not found");
    }

    return sendJsonResponse(res, 200, "Profile picture removed successfully", {
      user,
    });
  }
);

/**
 * Controller for uploading brand logo picture.
 */

export const uploadLogo = asyncHandler(async (req: Request, res: Response) => {
  const { brandId } = req.params;
  const file = req.file;

  if (!file) {
    return sendJsonResponse(res, 400, "No file uploaded");
  }

  if (!mongoose.Types.ObjectId.isValid(brandId)) {
    return sendJsonResponse(res, 400, "Invalid Brand ID format");
  }

  const fileUrl = await uploadFileToAws(file.originalname, file.buffer);

  const user = await Brand.findByIdAndUpdate(
    brandId,
    { logo: fileUrl },
    { new: true }
  );

  if (!user) {
    return sendJsonResponse(res, 404, "Brand not found");
  }

  return sendJsonResponse(res, 200, "Logo uploaded successfully", {
    logo: fileUrl,
    user,
  });
});

/**
 * Controller for removing brand logo.
 */
export const removeLogo = asyncHandler(async (req: Request, res: Response) => {
  const { brandId, fileName: encodedFileName } = req.params;
  const fileName = decodeURIComponent(encodedFileName);
  const fileResult = await isFileAvailableInAwsBucket(fileName);
  console.log("User ID:", brandId, "FileName:\n", fileName);

  // const file = req.file;

  if (!fileName) {
    return sendJsonResponse(res, 400, "No file in request parameter");
  }

  if (!fileResult) {
    return sendJsonResponse(res, 400, "File does not exist in bucket");
  }
  await deleteFileFromAws(fileName);

  if (!mongoose.Types.ObjectId.isValid(brandId)) {
    return sendJsonResponse(res, 400, "Invalid influencer ID format");
  }

  const user = await Influencer.findByIdAndUpdate(
    brandId,
    { profilePicture: null },
    { new: true }
  );

  if (!user) {
    return sendJsonResponse(res, 404, "Influencer not found");
  }

  return sendJsonResponse(res, 200, "Profile picture removed successfully", {
    user,
  });
});

/**
 * Controller for uploading content file (rate card or media kit).
 */

export const uploadContentFile = asyncHandler(
  async (req: Request, res: Response) => {
    const { influencerId } = req.params;
    const { fileType } = req.body;

    const file = req.file;
    if (!file) {
      return sendJsonResponse(res, 400, "No file uploaded");
    }

    const fileUrl = await uploadFileToAws(file.originalname, file.buffer);

    const updateData: any = {};

    if (fileType === "rateCard") {
      updateData["contentAndAudience.rateCardUpload"] = fileUrl;
    } else if (fileType === "mediaKit") {
      updateData["contentAndAudience.mediaKitUpload"] = fileUrl;
    } else {
      return sendJsonResponse(res, 400, "Invalid file type");
    }

    const user = await Influencer.findByIdAndUpdate(
      influencerId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return sendJsonResponse(res, 404, "User not found");
    }

    return sendJsonResponse(res, 200, "File uploaded successfully", {
      fileUrl,
      user,
    });
  }
);
