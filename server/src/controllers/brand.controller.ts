import { Request, Response } from "express";
import { BrandService } from "../services/brand.service";
import { asyncHandler, sendJsonResponse } from "../middleware/helper";
import { BadRequest } from '../middleware/errors'
import getUserData from '../middleware/helper';

const brandService = new BrandService();

export class BrandController {
  /**
   * Get all brands.
   */

  public getAllBrands = asyncHandler(async (req: Request, res: Response) => {
    const { message, data } = await brandService.getAllBrands();
    sendJsonResponse(res, 200, message, data);
  });

  /**
   * Get brand details
   */

  public getBrandDetails = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log(id);
    const userData = getUserData(req);
    console.log('\n', userData);

    if (!userData) {
      throw new BadRequest("You are not authenticated");
    }

    if (id !== userData.userId) {
      throw new BadRequest("You are not authorized to view this brand details");
    }

    const { message, data } = await brandService.getBrandDetails({ id });
    sendJsonResponse(res, 200, message, data);
  });


   /**
     * Get and update partial information about the user.
     */
  
    public getBrandAndUpdate = asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      const payload = req.body;

      const userData = getUserData(req);

      if (!userData) {
        throw new BadRequest("You are not authenticated");
      }

      if (id !== userData.userId) {
        throw new BadRequest("You are not authorized to view and update this brand details");
      }
  
      const result = await brandService.getBrandAndUpdate({ id, ...payload });
      sendJsonResponse(res, result.status_code, result.message, result.data);
    });
  
    /**
     * Update influencer details
     */
    public updateBrand = asyncHandler(
      async (req: Request, res: Response) => {
        const { id } = req.params;
        const userData = getUserData(req);

        if (!userData) {
          throw new BadRequest("You are not authenticated");
        }

        if (id !== userData.userId) {
          throw new BadRequest("You are not authorized to update this brand details");
        }
        const result = await brandService.updateBrand(
          {id, ...req.body}
        );
        sendJsonResponse(res, result.status_code, result.message, result.data);
      }
    );

  /**
   *  Search brands with pagination.
   */
   public searchBrands = asyncHandler(async (req: Request, res: Response) => {
      const { industry } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
  
      try {
        const searchParams = {
          industry: industry?.toString(),
        };
  
        const result = await brandService.searchBrands(
          searchParams,
          page,
          limit
        );
  
        sendJsonResponse(res, result.status_code, result.message, result.data);
      } catch (error) {
        sendJsonResponse(res, error.status_code || 500, error.message);
      }
    });
}
