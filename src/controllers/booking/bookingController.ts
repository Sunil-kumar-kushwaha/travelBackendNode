

import { Request, Response } from "express";
import asyncHandler from "../../middlewares/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import { createBooking, getBooking } from "../../services/booking/bookingService";
import { BookingDraft } from "../../types/booking.types";

export const createBookingHandler = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const draft = req.body as BookingDraft;
    const booking = createBooking(draft);
    return new ApiResponse(201, booking, "Booking created successfully").send(res);
});

export const getBookingHandler = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const booking = getBooking(bookingId);
    return new ApiResponse(200, booking, "Booking fetched successfully").send(res);
});