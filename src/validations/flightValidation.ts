import { z } from "zod";

export const searchFlightSchema = z.object({
    source: z.string().min(1, "Source is required"),
    destination: z.string().min(1, "Destination is required"),
});

export const AirportAutoCompleteSchema = z.object({
    countryCode: z.string().min(1, "Country code is required"),
});