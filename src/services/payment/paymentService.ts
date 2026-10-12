
// Dummy payment processor — simulates a gateway round trip and always
// succeeds (except a magic test card, for exercising the failure path in
// the UI). Replace processPayment()'s body with a real gateway call
// (Razorpay/Stripe/etc.) when you're ready — the function signature is
// the contract the rest of the app relies on.
// ============================================================

import crypto from "crypto";
import ApiError from "../../utils/apiError";
import { markBookingPaid, getBooking } from "../booking/bookingService";

export type PaymentMethod = "card" | "upi" | "paylater" | "wallet";

interface ProcessPaymentInput {
    bookingId: string;
    method: PaymentMethod;
    amount: number;
    details: Record<string, string>; // card number / UPI id / wallet provider, etc.
}

export async function processPayment({ bookingId, method, amount, details }: ProcessPaymentInput) {
    const booking = getBooking(bookingId); // throws 404 if missing

    if (booking.status === "paid") {
        throw new ApiError(400, "This booking has already been paid for");
    }

    
    await new Promise((r) => setTimeout(r, 900));

    if (method === "card" && details.cardNumber?.replace(/\s/g, "") === "4000000000000002") {
        throw new ApiError(402, "Payment declined by the bank. Please try another card.");
    }

    const paymentRef = `PAY-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const updated = markBookingPaid(bookingId, paymentRef);

    return { success: true, paymentRef, bookingId: updated.id, amountCharged: amount, method };
}