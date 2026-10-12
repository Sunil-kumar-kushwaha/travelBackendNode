

import { Request, Response } from "express";
import asyncHandler from "../../middlewares/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { getOffers, applyOfferCode } from "../../services/offer/offerService";

export const listOffers = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const offers = getOffers();
    return new ApiResponse(200, offers, "Offers fetched successfully").send(res);
});

export const applyOffer = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { code, baseAmount } = req.body as { code: string; baseAmount: number };
    const result = applyOfferCode(code, Number(baseAmount));
    return new ApiResponse(200, result, "Offer applied successfully").send(res);
});