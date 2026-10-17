

import { SupplierFlight } from "./supplierA";

interface SupplierBQuery {
    source: string;
    destination: string;
    departureDate: string;
}

async function fetchRaw(query: SupplierBQuery) {
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 600));

    // --- dummy data — replace with a real fetch() to Supplier B's API ---
    return [
        {
            // same physical flight as Supplier A's 6E-747, but cheaper here —
            // consolidateFlights.ts must catch this and keep only this one
            carrier_code: "6E",
            flight_number: "6E-747",
            src: query.source,
            dst: query.destination,
            depart: `${query.departureDate}T17:55:00`,
            arrive: `${query.departureDate}T23:45:00`,
            layovers: 1,
            stops : 1,
            fare: 5950, // cheaper than Supplier A's 6091 for the identical flight
            seatsLeft: 6,
            cabin: "Economy",
            fare_id: "SUPB-FAREID-1",
        },
        {
            carrier_code: "QP",
            flight_number: "QP-1121",
            src: query.source,
            dst: query.destination,
            depart: `${query.departureDate}T06:20:00`,
            arrive: `${query.departureDate}T08:45:00`,
            layovers: 0,
            stops: 1,
            fare: 8218,
            seatsLeft: 2,
            cabin: "Economy",
            fare_id: "SUPB-FAREID-2",
        },
    ];
}

export async function searchSupplierB(query: SupplierBQuery): Promise<SupplierFlight[]> {
    const raw = await fetchRaw(query);

    return raw.map((f) => ({
        flightId: f.fare_id,
        flightNumber: f.flight_number,
        airline: f.carrier_code,
        source: f.src,
        destination: f.dst,
        departureTime: f.depart,
        arrivalTime: f.arrive,
        duration: formatDuration(f.depart, f.arrive),
        price: f.fare,
        availableSeats: f.seatsLeft,
        cabinClass: f.cabin,
        stops: f.layovers,
        supplier: "supplierB",
        fareKey: f.fare_id,
    }));
}

function formatDuration(departISO: string, arriveISO: string): string {
    const minutes = Math.round((new Date(arriveISO).getTime() - new Date(departISO).getTime()) / 60000);
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}