import ApiError from "../../utils/apiError";
// import FltBooking from "../../models/FltBooking";
import FltBooking from "../../models/FlightBooking";

import { BookingDraft, BookingRecord } from "../../types/booking.types";

export async function createBooking(draft: BookingDraft, userId?: string): Promise<BookingRecord> {
    // pick fields explicitly so the client can never set status / paymentRef / _id itself
    const doc = await FltBooking.create({
        userId,
        flight: draft.flight,
        passengers: draft.passengers,
        isInternational: draft.isInternational,
        travellers: draft.travellers,
        addons: draft.addons,
        insurance: draft.insurance,
        contact: draft.contact,
        appliedOffer: draft.appliedOffer,
        priceBreakup: draft.priceBreakup,
    });
    return doc.toJSON() as unknown as BookingRecord;
}

export async function getBooking(id: string): Promise<BookingRecord> {
    const doc = await FltBooking.findById(id);
    if (!doc) throw new ApiError(404, "Booking not found");
    return doc.toJSON() as unknown as BookingRecord;
}

export async function markBookingPaid(id: string, paymentRef: string): Promise<BookingRecord> {
    const doc = await FltBooking.findByIdAndUpdate(
        id,
        { status: "paid", paymentRef },
        { new: true }
    );
    if (!doc) throw new ApiError(404, "Booking not found");
    return doc.toJSON() as unknown as BookingRecord;
}





export interface FlightTripSummary {
    id: string;
    type: "flight";
    status: string;
    createdAt: number;
    totalPrice: number;
    passengers: number;
    flight: {
        airline: string;
        flightNumber: string;
        source: string;
        destination: string;
        departureTime: Date;
        arrivalTime: Date;
        stops: number;
        cabinClass: string;
    };
}


export async function listUserBookings(userId: string, page = 1, limit = 20) {
    const filter = { userId };

    const [docs, total] = await Promise.all([
        FltBooking.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select(
                "flight.airline flight.flightNumber flight.source flight.destination " +
                "flight.departureTime flight.arrivalTime flight.stops flight.cabinClass " +
                "passengers status priceBreakup.totalPrice createdAt"
            )
            .lean(),
        FltBooking.countDocuments(filter),
    ]);

    const trips: FlightTripSummary[] = docs.map((d: any) => ({
        id: d._id,
        type: "flight",
        status: d.status,
        createdAt: new Date(d.createdAt).getTime(),
        totalPrice: d.priceBreakup?.totalPrice ?? 0,
        passengers: d.passengers,
        flight: {
            airline: d.flight.airline,
            flightNumber: d.flight.flightNumber,
            source: d.flight.source,
            destination: d.flight.destination,
            departureTime: d.flight.departureTime,
            arrivalTime: d.flight.arrivalTime,
            stops: d.flight.stops ?? 0,
            cabinClass: d.flight.cabinClass,
        },
    }));

  

    return { trips, total, page, limit };
}

export async function getUserBooking(id: string, userId: string) {
    const doc = await FltBooking.findOne({ _id: id, userId });
    if (!doc) throw new ApiError(404, "Booking not found");
    return { ...(doc.toJSON() as any), type: "flight" as const };
}