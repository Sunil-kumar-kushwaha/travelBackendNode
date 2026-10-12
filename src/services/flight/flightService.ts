

import Flight from "../../models/Flight";
// import redisClient from "../config/redis";
import { CITIES } from "../../utils/dummyData";
import { airportCountryData } from "../../static/airportcountry";
import { searchExternalSuppliers } from "./suppliers";
import { consolidateFlights, buildSearchMeta, ConsolidatableFlight } from "../../utils/consolidateFlights";

const SEARCH_CACHE_TTL = 120;
const INTERNAL_FETCH_CAP = 200; // safety cap — see trade-off note above

export const AutoCompleteAirportService = async ({ countryCode }: { countryCode: string }) => {
    const search = countryCode.trim().toLowerCase();

    if (!search) {
        return [];
    }
    return airportCountryData.apts
        .filter((airport) => {
            const code = airport.code?.toLowerCase() || "";
            const city = airport.city?.toLowerCase() || "";
            const name = airport.name?.toLowerCase() || "";
            return code.includes(search) || city.includes(search) || name.includes(search);
        })
        .slice(0, 10);
};

export const flightService = async ({
    source,
    destination,
    departureDate,
    passengers = 1,
    page = 1,
    limit = 15,
}: {
    source?: string;
    destination?: string;
    departureDate?: string;
    passengers?: number;
    page?: number;
    limit?: number;
}) => {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 15;

    const cacheKey = `flight-search:${source || "ALL"}:${destination || "ALL"}:${departureDate || ""}:${passengers}:${pageNum}:${limitNum}`;

    // const cached = await redisClient.get(cacheKey);
    // if (cached) {
    //   return JSON.parse(cached);
    // }

    const filter: any = { isActive: true };

    if (source) {
        filter.source = new RegExp(`^${source}$`, "i");
    }
    if (destination) {
        filter.destination = new RegExp(`^${destination}$`, "i");
    }
    if (departureDate) {
        const start = new Date(departureDate);
        const end = new Date(departureDate);
        end.setDate(end.getDate() + 1);
        filter.departureTime = { $gte: start, $lt: end };
    }

    // Fetch DB flights + external supplier flights in parallel — no skip/limit
    // here, since consolidation must run on the full matching set first.



    // const [dbFlights, supplierFlights] = await Promise.all([
    //     Flight.find(filter).limit(INTERNAL_FETCH_CAP).lean(),
    //     searchExternalSuppliers({ source, destination, departureDate }),
    // ]);

    const dbFlights = [
        {
            flightId: "FL001",
            flightNumber: "6E-201",
            airline: "IndiGo",
            source: "DEL",
            destination: "BLR",
            departureTime: new Date("2026-09-26T06:00:00"),
            arrivalTime: new Date("2026-09-26T08:45:00"),
            duration: "2h 45m",
            price: 4899,
            availableSeats: 32,
            cabinClass: "Economy",
            isActive: true,
        },
        {
            flightId: "FL002",
            flightNumber: "AI-501",
            airline: "Air India",
            source: "DEL",
            destination: "BLR",
            departureTime: new Date("2026-09-26T07:30:00"),
            arrivalTime: new Date("2026-09-26T10:20:00"),
            duration: "2h 50m",
            price: 5299,
            availableSeats: 24,
            cabinClass: "Economy",
            isActive: true,
        },
        {
            flightId: "FL003",
            flightNumber: "UK-811",
            airline: "Vistara",
            source: "DEL",
            destination: "BLR",
            departureTime: new Date("2026-09-26T09:00:00"),
            arrivalTime: new Date("2026-09-26T11:45:00"),
            duration: "2h 45m",
            price: 6499,
            availableSeats: 18,
            cabinClass: "Premium Economy",
            isActive: true,
        },
        {
            flightId: "FL004",
            flightNumber: "6E-215",
            airline: "IndiGo",
            source: "DEL",
            destination: "BLR",
            departureTime: new Date("2026-09-26T10:30:00"),
            arrivalTime: new Date("2026-09-26T13:15:00"),
            duration: "2h 45m",
            price: 4599,
            availableSeats: 41,
            cabinClass: "Economy",
            isActive: true,
        },
        {
            flightId: "FL005",
            flightNumber: "AI-803",
            airline: "Air India",
            source: "DEL",
            destination: "BLR",
            departureTime: new Date("2026-09-26T12:00:00"),
            arrivalTime: new Date("2026-09-26T14:50:00"),
            duration: "2h 50m",
            price: 5799,
            availableSeats: 27,
            cabinClass: "Economy",
            isActive: true,
        },
        {
            flightId: "FL006",
            flightNumber: "QP-142",
            airline: "Akasa Air",
            source: "DEL",
            destination: "BLR",
            departureTime: new Date("2026-09-26T14:30:00"),
            arrivalTime: new Date("2026-09-26T17:20:00"),
            duration: "2h 50m",
            price: 4299,
            availableSeats: 36,
            cabinClass: "Economy",
            isActive: true,
        },
        {
            flightId: "FL007",
            flightNumber: "6E-229",
            airline: "IndiGo",
            source: "DEL",
            destination: "BLR",
            departureTime: new Date("2026-09-26T16:00:00"),
            arrivalTime: new Date("2026-09-26T18:40:00"),
            duration: "2h 40m",
            price: 4999,
            availableSeats: 29,
            cabinClass: "Economy",
            isActive: true,
        },
        {
            flightId: "FL008",
            flightNumber: "IX-112",
            airline: "Air India Express",
            source: "DEL",
            destination: "BLR",
            departureTime: new Date("2026-09-26T18:30:00"),
            arrivalTime: new Date("2026-09-26T21:20:00"),
            duration: "2h 50m",
            price: 3899,
            availableSeats: 45,
            cabinClass: "Economy",
            isActive: true,
        },
        {
            flightId: "FL009",
            flightNumber: "AI-505",
            airline: "Air India",
            source: "DEL",
            destination: "BLR",
            departureTime: new Date("2026-09-26T20:00:00"),
            arrivalTime: new Date("2026-09-26T22:50:00"),
            duration: "2h 50m",
            price: 6999,
            availableSeats: 12,
            cabinClass: "Business",
            isActive: true,
        },
        {
            flightId: "FL010",
            flightNumber: "6E-241",
            airline: "IndiGo",
            source: "DEL",
            destination: "BLR",
            departureTime: new Date("2026-09-26T22:00:00"),
            arrivalTime: new Date("2026-09-27T00:40:00"),
            duration: "2h 40m",
            price: 5199,
            availableSeats: 22,
            cabinClass: "Economy",
            isActive: true,
        },
    ];

    // const supplierFlights = await searchExternalSuppliers({
    //     source,
    //     destination,
    //     departureDate,
    // });

    const normalizedDbFlights: ConsolidatableFlight[] = dbFlights.map((flight: any) => ({
        flightId: flight.flightId,
        flightNumber: flight.flightNumber,
        airline: flight.airline,
        source: flight.source,
        destination: flight.destination,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        duration: flight.duration,
        price: flight.price,
        availableSeats: flight.availableSeats,
        cabinClass: flight.cabinClass,
        stops: flight.stops ?? 0, // your Flight model may not have this field yet — defaults to non-stop
        supplier: "internal",
        fareKey: flight.flightId, // booking an internal flight uses its own flightId
    }));

    // const merged = [...normalizedDbFlights, ...supplierFlights];
    const merged = [...normalizedDbFlights];

    const consolidated = consolidateFlights(merged);
    consolidated.sort((a, b) => a.price - b.price);

    const meta = buildSearchMeta(consolidated);
    const total = consolidated.length;

    const skip = (pageNum - 1) * limitNum;
    const pageOfFlights = consolidated.slice(skip, skip + limitNum);

    const results = pageOfFlights.map((flight) => ({
        flightId: flight.flightId,
        flightNumber: flight.flightNumber,
        airline: flight.airline,
        source: flight.source,
        destination: flight.destination,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        duration: flight.duration,
        price: flight.price,
        availableSeats: flight.availableSeats,
        cabinClass: flight.cabinClass,
        stops: flight.stops,
        supplier: flight.supplier,
        fareKey: flight.fareKey, // needed downstream at booking time
    }));

    const response = {
        supportedCities: CITIES,
        source: source || null,
        destination: destination || null,
        departureDate: departureDate || null,
        passengers,
        total,
        page: pageNum,
        limit: limitNum,
        flights: results,
        meta, // for the filter sidebar — built from the FULL consolidated set, not just this page
    };

    // await redisClient.set(
    //   cacheKey,
    //   JSON.stringify(response),
    //   "EX",
    //   SEARCH_CACHE_TTL
    // );

    return response;
};