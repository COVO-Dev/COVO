import { NextFunction, Request, Response } from "express";
import { UserRole } from "../types/enum";
import { defineAdminAbility } from "../utils/ability";
import { Twitter } from "../models/twitter.model";
import { Facebook } from "../models/facebook.model";
import { Instagram } from "../models/instagram.model";
import { Youtube } from "../models/youtube.model";

/**
 * Sends a JSON response with a standard structure.
 *
 * @param res - The Express response object.
 * @param statusCode - The HTTP status code to send.
 * @param message - The message to include in the response.
 * @param data - The data to include in the response. Can be any type.
 * @param accessToken - Optional access token to include in the response.
 */
const sendJsonResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any,
  accessToken?: string,
) => {
  const responsePayload: any = {
    status: "success",
    message,
    status_code: statusCode,
    data,
  };

  if (accessToken) {
    responsePayload.access_token = accessToken;
  }

  res.status(statusCode).json(responsePayload);
};


/**
 * Async handler to wrap the API routes, this allows for async error handling.
 * @param fn Function to call for the API endpoint
 * @returns Promise with a catch statement
 */
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

export default function getUserData(req: Request): {
  userId: string;
  email: string;
  role: string[];
  firstName: string;
  lastName: string
} | null {
	const user = (req as Request & { user?: any }).user;
	if (user) {
		return user;
	} else {
		return null;
	}
}

export function isAdmin(req: Request): boolean {
  const user = getUserData(req);
  console.log('Checking admin status for user: ', user);
  return user && user.role.includes(UserRole.Admin);
}

export const isAdminAndHasPermission = (req: Request, res: Response, next: NextFunction) => {
  const user = getUserData(req);
  if (!user || !user.role.includes(UserRole.Admin)) {
    throw new Error("You are not authorized to perform this action.");
  }
  const ability = defineAdminAbility(user.userId);
  if (ability.can('manage', 'all')) {
    return next();
  }
  return {
    message: "You are not authorized to perform this action.",
    status_code: 403,
  }
};

export const getPlatformModel = (platform: string) => {
  switch (platform.toLocaleLowerCase()) {
    case "twitter": return Twitter;
    case "facebook": return Facebook;
    case "instagram": return Instagram;
    case "youtube": return Youtube;
    default: return null;
  }
};

export { sendJsonResponse, asyncHandler };