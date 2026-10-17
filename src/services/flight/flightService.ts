

import Flight from "../../models/Flight";
import AirportList from "../../models/AirportList";

import redisClient from "../../config/redis";
import { CITIES } from "../../utils/dummyData";
import { airportCountryData } from "../../static/airportcountry";
import logger from "../../utils/logger";
import { searchExternalSuppliers } from "./suppliers";
import { consolidateFlights, buildSearchMeta, ConsolidatableFlight } from "../../utils/consolidateFlights";

const SEARCH_CACHE_TTL = 120;
const INTERNAL_FETCH_CAP = 200; 

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


export const AutoCompleteAirportService = async ({ countryCode }: { countryCode: string }) => {
    const search = countryCode.trim().toLowerCase();
    if (!search) {
        return [];
    }

    const safe = escapeRegex(search);
    const rx = new RegExp(safe, "i");
    // return AirportList.find({ $or: [{ code: rx }, { city: rx }, { name: rx }, { country: rx }] })
    //     .select("-_id code name country city countryCode")
    //     .limit(5)
    //     .lean();

    return AirportList.aggregate([
        { $unwind: "$apts" },                                  
        { $replaceRoot: { newRoot: "$apts" } },                
        { $match: { $or: [{ code: rx }, { city: rx }, { name: rx }, { country: rx }] } },
        {
            $addFields: {                                      
                _rank: {
                    $switch: {
                        branches: [
                            { case: { $eq: [{ $toLower: "$code" }, search] }, then: 0 },
                            { case: { $regexMatch: { input: "$city", regex: `^${safe}`, options: "i" } }, then: 1 },
                        ],
                        default: 2,
                    },
                },
            },
        },
        { $sort: { _rank: 1, city: 1 } },
        { $limit: 5 },
        { $project: { _rank: 0, _id: 0 } },
    ]);
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
    if (!redisClient) {
        logger.warn("Redis is not configured");
        return;
    }

    const cacheKey = `flight-search:${source || "ALL"}:${destination || "ALL"}:${departureDate || ""}:${passengers}:${pageNum}:${limitNum}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

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


    // const dbFlights = await Flight.find(filter).limit(INTERNAL_FETCH_CAP).lean();

    const [dbFlights, supplierFlights] = await Promise.all([
        Flight.find(filter).limit(INTERNAL_FETCH_CAP).lean(),
        searchExternalSuppliers({ source, destination, departureDate }),
    ]);

    
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
        stops: flight.stops ?? 0, 
        supplier: "internal",
        fareKey: flight.flightId, 
    }));

    const merged = [...normalizedDbFlights, ...supplierFlights];
    // const merged = [...normalizedDbFlights];

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
        fareKey: flight.fareKey, 
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
        meta, 
    };

    await redisClient.set(
      cacheKey,
      JSON.stringify(response),
      "EX",
      SEARCH_CACHE_TTL
    );

    return response;
};