import express from "express";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth";
import { isAdminAndHasPermission } from "../middleware/helper";


const adminController = new AdminController();

const adminRoute = express.Router();

adminRoute.get("/admin/:adminId/users", authMiddleware, isAdminAndHasPermission, adminController.getAllUsersByAdmin);
adminRoute.put("/admin/:adminId/users/:id", authMiddleware, adminController.updateUserByAdmin);
adminRoute.delete("/admin/:adminId/users/:id", authMiddleware, adminController.deleteUserByAdmin);
adminRoute.get("/admin/:adminId/platform", authMiddleware, adminController.getPlatformData);
export { adminRoute };
