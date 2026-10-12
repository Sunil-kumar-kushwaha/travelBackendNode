

import { Request, Response } from "express";
import asyncHandler from "../../middlewares/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { processPayment, PaymentMethod } from "../../services/payment/paymentService";

export const pay = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { bookingId, method, amount, details } = req.body as {
        bookingId: string;
        method: PaymentMethod;
        amount: number;
        details: Record<string, string>;
    };

    const result = await processPayment({ bookingId, method, amount, details: details || {} });
    return new ApiResponse(200, result, "Payment processed successfully").send(res);
});