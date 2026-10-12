

export interface ConsolidatableFlight {
    flightId: string;
    flightNumber: string;
    airline: string;
    source: string;
    destination: string;
    departureTime: string | Date;
    arrivalTime: string | Date;
    duration: string;
    price: number;
    availableSeats: number;
    cabinClass: string;
    stops?: number;
    supplier: string;
    fareKey: string;
}

export interface ConsolidatedFlight extends ConsolidatableFlight {
    id: string;
}

function getFingerprint(f: ConsolidatableFlight): string {
    const departISO = new Date(f.departureTime).toISOString();
    return [f.airline, f.flightNumber, f.source, f.destination, departISO].join("|");
}

export function consolidateFlights(flights: ConsolidatableFlight[]): ConsolidatedFlight[] {
    const cheapestByFingerprint = new Map<string, ConsolidatableFlight>();

    for (const flight of flights) {
        const fingerprint = getFingerprint(flight);
        const existing = cheapestByFingerprint.get(fingerprint);

        if (!existing || flight.price < existing.price) {
            cheapestByFingerprint.set(fingerprint, flight);
        }
    }

    return Array.from(cheapestByFingerprint.entries()).map(([fingerprint, flight]) => ({
        ...flight,
        id: fingerprint,
    }));
}

export interface SearchMeta {
    minPrice: number;
    maxPrice: number;
    airlines: { code: string; minFare: number }[];
    stopsAvailable: { stops: number; label: string; minFare: number }[];
}

const STOP_LABELS: Record<number, string> = { 0: "Non Stop", 1: "1 Stop" };

export function buildSearchMeta(results: ConsolidatedFlight[]): SearchMeta {
    if (results.length === 0) {
        return { minPrice: 0, maxPrice: 0, airlines: [], stopsAvailable: [] };
    }

    const prices = results.map((r) => r.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const airlineMap = new Map<string, { code: string; minFare: number }>();
    const stopsMap = new Map<number, number>();

    for (const r of results) {
        const existingAirline = airlineMap.get(r.airline);
        if (!existingAirline || r.price < existingAirline.minFare) {
            airlineMap.set(r.airline, { code: r.airline, minFare: r.price });
        }

        const stopBucket = (r.stops ?? 0) >= 2 ? 2 : r.stops ?? 0;
        const existingStopFare = stopsMap.get(stopBucket);
        if (existingStopFare === undefined || r.price < existingStopFare) {
            stopsMap.set(stopBucket, r.price);
        }
    }

    const stopsAvailable = Array.from(stopsMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([stops, minFare]) => ({ stops, label: STOP_LABELS[stops] || "2+ Stops", minFare }));

    return {
        minPrice,
        maxPrice,
        airlines: Array.from(airlineMap.values()).sort((a, b) => a.minFare - b.minFare),
        stopsAvailable,
    };
}