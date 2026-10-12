

import crypto from "crypto";
import ApiError from "../../utils/apiError";
import { BookingDraft, BookingRecord } from "../../types/booking.types";

const bookings = new Map<string, BookingRecord>();

export function createBooking(draft: BookingDraft): BookingRecord {
    
    const id = crypto.randomUUID();
    const record: BookingRecord = {
        ...draft,
        id,
        status: "pending",
        createdAt: Date.now(),
    };
    bookings.set(id, record);
    return record;
}

export function getBooking(id: string): BookingRecord {
    const booking = bookings.get(id);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }
    return booking;
}

export function markBookingPaid(id: string, paymentRef: string): BookingRecord {
    const booking = getBooking(id);
    booking.status = "paid";
    booking.paymentRef = paymentRef;
    return booking;
}

