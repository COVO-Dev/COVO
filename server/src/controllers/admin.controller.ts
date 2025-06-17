import { AdminService } from "../services/admin.service";
import { Request, Response } from "express";
import { asyncHandler, sendJsonResponse, isAdmin } from "../middleware/helper";

const adminService = new AdminService();

export class AdminController {
  /**
   * Fetch All Users with their details by admin
   */
  public getAllUsersByAdmin = asyncHandler(
    async (req: Request, res: Response) => {
      if (!isAdmin(req)) {
        throw new Error("You are not authorized to perform this action.");
      }
      const { adminId } = req.params;
      const users = await adminService.getAllUsersByAdmin(adminId);
      sendJsonResponse(res, users.status_code, users.message, users.data);
    }
  );

  /**
   * Update A User with their details
   */
  public updateUserByAdmin = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const { adminId } = req.params;
      const data = req.body;
      if (!isAdmin(req)) {
        throw new Error("You are not authorized to perform this action.");
      }

      const user = await adminService.updateUserByAdmin(adminId, id, data);
      sendJsonResponse(res, user.status_code, user.message, user.data);
    }
  );

  /**
   * Delete A User with their details
   */
  public deleteUserByAdmin = asyncHandler(
    async (req: Request, res: Response) => {
      const { adminId } = req.params;
      const { id } = req.params;
      if (!isAdmin(req)) {
        throw new Error("You are not authorized to perform this action.");
      }
      const user = await adminService.deleteUserByAdmin(adminId, id);
      sendJsonResponse(res, user.status_code, user.message, user.data);
    }
  );

  /**
   * Get platform Overview
   */
  public getPlatformData = asyncHandler(async (req: Request, res: Response) => {
    const { adminId } = req.params;
    if (!isAdmin(req)) {
        throw new Error("You are not authorized to perform this action.");
    }
    const overview = await adminService.getPlateformData(adminId);
    sendJsonResponse(
      res,
      overview.status_code,
      overview.message,
      overview.data
    );
  });
}
