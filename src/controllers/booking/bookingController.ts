import { Request, Response } from "express";
import asyncHandler from "../../middlewares/asyncHandler";
import ApiResponse from "../../utils/apiResponse";
import ApiError from "../../utils/apiError";
import { createBooking, getUserBooking, listUserBookings } from "../../services/booking/bookingService";
import { BookingDraft } from "../../types/booking.types";

// requireAuth puts the decoded JWT on req.user
const currentUserId = (req: Request): string => {
    if (!req.user) throw new ApiError(401, "Not logged in");
    return String(req.user.userId);
};

export const createBookingHandler = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const draft = req.body as BookingDraft;
    const booking = await createBooking(draft, currentUserId(req));
    return new ApiResponse(201, booking, "Booking created successfully").send(res);
});

export const listBookingsHandler = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const result = await listUserBookings(currentUserId(req), page, limit);
    return new ApiResponse(200, result, "Bookings fetched successfully").send(res);
});

export const getBookingHandler = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const booking = await getUserBooking(bookingId, currentUserId(req));
    return new ApiResponse(200, booking, "Booking fetched successfully").send(res);
});