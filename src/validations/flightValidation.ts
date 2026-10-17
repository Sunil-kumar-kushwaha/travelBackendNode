import { z } from "zod";


export const searchFlightSchema = z.object({
    source: z.string().trim().min(1, "Source is required"),

    destination: z.string().trim().min(1, "Destination is required"),

    departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
        .refine((date) => {
            const parsed = new Date(`${date}T00:00:00.000Z`);

            return (
                !Number.isNaN(parsed.getTime()) &&
                parsed.toISOString().slice(0, 10) === date
            );
        }, "Invalid departure date"),

    passengers: z.coerce.number().int("Passengers must be an integer").min(1, "At least 1 passenger is required").max(9, "Maximum 9 passengers allowed"),
});

export const AirportAutoCompleteSchema = z.object({
    countryCode: z.string().min(1, "Country code is required"),
});