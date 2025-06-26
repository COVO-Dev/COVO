import { Request, Response } from 'express';
import { SearchLogService } from '../services/searchLog.service';
import { asyncHandler, sendJsonResponse } from '../middleware/helper';
import { BadRequest } from '../middleware/errors';
import getUserData from '../middleware/helper';

const searchLogService = new SearchLogService();

export const searchLog = asyncHandler(async (req: Request, res: Response) => {
    const { brandId, filters } = req.body;
    const userData = getUserData(req);

    if (!userData) {
        throw new BadRequest("You are not authenticated");
    }

    // if (brandId !== userData.userId) {
    //     throw new BadRequest(
    //         "You are not authorized to perform this operation"
    //     );
    // }
    const { message, status_code, data } = await searchLogService.searchInfluencers(brandId, filters);
    sendJsonResponse(res, status_code, message, data);
});

