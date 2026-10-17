import { Schema, model, Document } from "mongoose";
import crypto from "crypto";
import { SelectedFlight, TravellerDetails, AddonSelection, InsuranceSelection, AppliedOffer, PriceBreakup } from "../types/booking.types";

// Dates are stored as real Date values (ISO strings from the client are cast automatically)
type WithDates<T, K extends keyof T> = Omit<T, K> & { [P in K]: Date };

export interface IFltBooking extends Document<string> {
    userId?: string;
    flight: WithDates<SelectedFlight, "departureTime" | "arrivalTime">;
    passengers: number;
    isInternational: boolean;
    travellers: TravellerDetails[];
    addons: AddonSelection[];
    insurance: InsuranceSelection;
    contact: { email: string; phone: string };
    appliedOffer: AppliedOffer | null;
    priceBreakup: PriceBreakup;
    status: "pending" | "paid" | "failed" | "cancelled";
    paymentRef?: string;
    createdAt: Date;
    updatedAt: Date;
}



const selectedFlightSchema = new Schema(
    {
        id: { type: String, trim: true },
        flightId: { type: String, required: true, trim: true },   // NOT unique: many bookings can share a flight
        flightNumber: { type: String, required: true, trim: true },
        airline: { type: String, required: true, trim: true },
        source: { type: String, required: true, trim: true, uppercase: true },
        destination: { type: String, required: true, trim: true, uppercase: true },
        departureTime: { type: Date, required: true },
        arrivalTime: { type: Date, required: true },
        duration: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        cabinClass: { type: String, enum: ["Economy", "Premium Economy", "Business", "First"], default: "Economy" },
        stops: { type: Number, default: 0, min: 0 },
        supplier: { type: String },
        fareKey: { type: String, required: true },
    },
    { _id: false }
);

const passportSchema = new Schema(
    {
        number: { type: String, required: true, trim: true, uppercase: true },
        expiryDate: { type: String, required: true },
        nationality: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const travellerSchema = new Schema(
    {
        id: { type: String, required: true },
        type: { type: String, enum: ["adult", "child", "infant"], required: true },
        isPrimary: { type: Boolean, default: false },
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        gender: { type: String, enum: ["Male", "Female"], required: true },
        passport: { type: passportSchema, default: null },   // only for international flights
    },
    { _id: false }
);

const addonItemSchema = new Schema(
    {
        code: { type: String, required: true },
        label: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const addonSelectionSchema = new Schema(
    {
        travellerId: { type: String, required: true },
        meal: { type: addonItemSchema, default: null },
        baggage: { type: addonItemSchema, default: null },
        seat: { type: addonItemSchema, default: null },
    },
    { _id: false }
);

const insuranceSchema = new Schema(
    {
        opted: { type: Boolean, default: false },
        planPrice: { type: Number, default: 0, min: 0 },
    },
    { _id: false }
);

const appliedOfferSchema = new Schema(
    {
        code: { type: String, required: true, uppercase: true, trim: true },
        discount: { type: Number, required: true, min: 0 },
        description: { type: String },
    },
    { _id: false }
);

const priceBreakupSchema = new Schema(
    {
        baseFare: { type: Number, required: true, min: 0 },
        taxes: { type: Number, required: true, min: 0 },
        addonsTotal: { type: Number, default: 0, min: 0 },
        insuranceTotal: { type: Number, default: 0, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        totalPrice: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

// ---------- main schema ----------

const fltBookingSchema = new Schema<IFltBooking>(
    {
        _id: { type: String, default: () => crypto.randomUUID() },   // booking id sent to the frontend as `id`
        userId: { type: String, index: true },                        // from your auth cookie / JWT, optional for guests

        flight: { type: selectedFlightSchema, required: true },
        passengers: { type: Number, required: true, min: 1, max: 9 },
        isInternational: { type: Boolean, default: false },
        travellers: { type: [travellerSchema], default: [] },
        addons: { type: [addonSelectionSchema], default: [] },
        insurance: { type: insuranceSchema, default: () => ({}) },
        contact: {
            email: { type: String, required: true, trim: true, lowercase: true },
            phone: { type: String, required: true, trim: true },
        },
        appliedOffer: { type: appliedOfferSchema, default: null },
        priceBreakup: { type: priceBreakupSchema, required: true },

        status: { type: String, enum: ["pending", "paid", "failed", "cancelled"], default: "pending", index: true },
        paymentRef: { type: String },
    },
    {
        timestamps: true,
        toJSON: {
            // keep the same response shape the frontend already expects
            transform(_doc, ret: any) {
                ret.id = ret._id;
                ret.createdAt = new Date(ret.createdAt).getTime();   // BookingRecord.createdAt is a number
                delete ret._id;
                delete ret.__v;
                delete ret.updatedAt;
                return ret;
            },
        },
    }
);

fltBookingSchema.pre("validate", function () {
    if (this.travellers.length !== this.passengers) {
        this.invalidate("travellers", `Expected ${this.passengers} traveller(s), got ${this.travellers.length}`);
    }
    if (this.travellers.filter((t) => t.isPrimary).length !== 1) {
        this.invalidate("travellers", "Exactly one primary traveller is required");
    }
    if (this.isInternational && this.travellers.some((t) => !t.passport)) {
        this.invalidate("travellers", "Passport details are required for international flights");
    }
});

fltBookingSchema.index({ userId: 1, createdAt: -1 });   // "My Trips" list
fltBookingSchema.index({ "contact.phone": 1 });
fltBookingSchema.index({ "flight.flightId": 1 });

const FltBooking = model<IFltBooking>("FltBooking", fltBookingSchema, "FltBooking");
export default FltBooking;