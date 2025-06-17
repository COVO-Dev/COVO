import { BrandController } from "../controllers/brand.controller";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

const brandRoute = Router();
const brandController = new BrandController();

brandRoute.get("/brands", authMiddleware, brandController.getAllBrands);
brandRoute.get("/brands/search", authMiddleware, brandController.searchBrands);
brandRoute.get("/brand/:id", authMiddleware, brandController.getBrandDetails);
brandRoute.put("/brand/:id", authMiddleware, brandController.getBrandAndUpdate);
brandRoute.patch("/brand/:id", authMiddleware, brandController.updateBrand);

export { brandRoute };
