// ============================================================
// BACKEND FILE  (Node.js / Express)
// Project path: travelBackend/src/types/booking.types.ts
// ============================================================

export interface SelectedFlight {
    id: string;
    flightId: string;
    flightNumber: string;
    airline: string;
    source: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
    cabinClass: string;
    stops: number;
    supplier: string;
    fareKey: string;
}

export interface TravellerDetails {
    id: string;
    type: "adult" | "child" | "infant";
    isPrimary: boolean;
    firstName: string;
    lastName: string;
    gender: "Male" | "Female";
    passport?: {
        number: string;
        expiryDate: string;
        nationality: string;
    } | null;
}

export interface AddonSelection {
    travellerId: string;
    meal: { code: string; label: string; price: number } | null;
    baggage: { code: string; label: string; price: number } | null;
    seat: { code: string; label: string; price: number } | null;
}

export interface InsuranceSelection {
    opted: boolean;
    planPrice: number;
}

export interface AppliedOffer {
    code: string;
    discount: number;
    description: string;
}

export interface PriceBreakup {
    baseFare: number;
    taxes: number;
    addonsTotal: number;
    insuranceTotal: number;
    discount: number;
    totalPrice: number;
}

export interface BookingDraft {
    flight: SelectedFlight;
    passengers: number;
    isInternational: boolean;
    travellers: TravellerDetails[];
    addons: AddonSelection[];
    insurance: InsuranceSelection;
    contact: { email: string; phone: string };
    appliedOffer: AppliedOffer | null;
    priceBreakup: PriceBreakup;
}

export interface BookingRecord extends BookingDraft {
    id: string;
    status: "pending" | "paid";
    paymentRef?: string;
    createdAt: number;
}