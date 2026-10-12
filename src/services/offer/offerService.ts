

import ApiError from "../../utils/apiError";

interface Offer {
    code: string;
    description: string;
    discount: number; 
    type: "flat" | "percent";
    
    applicable: boolean;
}


const OFFERS: Offer[] = [
    { code: "CTDOM", description: "Flat discount on domestic flights", discount: 300, type: "flat", applicable: true },
    { code: "CTUPI", description: "Extra discount when paying via UPI", discount: 390, type: "flat", applicable: true },
    {
        code: "CTHSBCTRAVELONE",
        description: "Discount with HSBC Travel One card",
        discount: 640,
        type: "flat",
        applicable: false, // requires that specific card at payment — apply there instead
    },
    { code: "HDFCREGALIACT", description: "Discount with HDFC Regalia credit card", discount: 298, type: "flat", applicable: true },
];

export function getOffers(): Offer[] {
    return OFFERS;
}

export function applyOfferCode(code: string, baseAmount: number) {
    const offer = OFFERS.find((o) => o.code.toUpperCase() === code.trim().toUpperCase());

    if (!offer) {
        throw new ApiError(400, "Invalid or expired coupon code");
    }
    if (!offer.applicable) {
        throw new ApiError(400, `${offer.code} requires a specific payment method — apply it on the payment page`);
    }

    const discount = offer.type === "flat" ? offer.discount : Math.round(baseAmount * (offer.discount / 100));

    return { code: offer.code, discount, description: offer.description };
}