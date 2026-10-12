

interface SupplierAQuery {
    source: string;
    destination: string;
    departureDate: string; 
}

export interface SupplierFlight {
    flightId: string;
    flightNumber: string;
    airline: string;
    source: string;
    destination: string;
    departureTime: string; 
    arrivalTime: string; 
    duration: string;
    price: number;
    availableSeats: number;
    cabinClass: string;
    stops: number;
    supplier: string;
    fareKey: string; 
}

async function fetchRaw(query: SupplierAQuery) {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 400)); // simulated latency

    // --- dummy data — replace with a real fetch() to Supplier A's API ---
    return [
        {
            airline: "6E",
            flightNo: "6E-747",
            from: query.source,
            to: query.destination,
            departISO: `${query.departureDate}T17:55:00`,
            arriveISO: `${query.departureDate}T23:45:00`,
            stopCount: 1,
            price: 6091,
            seats: 4,
            cabin: "Economy",
            bookingRef: "SUPA-BOOKKEY-1",
        },
        {
            airline: "AI",
            flightNo: "AI-505",
            from: query.source,
            to: query.destination,
            departISO: `${query.departureDate}T09:10:00`,
            arriveISO: `${query.departureDate}T11:35:00`,
            stopCount: 0,
            price: 8062,
            seats: 9,
            cabin: "Economy",
            bookingRef: "SUPA-BOOKKEY-2",
        },
    ];
}

export async function searchSupplierA(query: SupplierAQuery): Promise<SupplierFlight[]> {
    const raw = await fetchRaw(query);

    return raw.map((f) => ({
        flightId: f.bookingRef,
        flightNumber: f.flightNo,
        airline: f.airline,
        source: f.from,
        destination: f.to,
        departureTime: f.departISO,
        arrivalTime: f.arriveISO,
        duration: formatDuration(f.departISO, f.arriveISO),
        price: f.price,
        availableSeats: f.seats,
        cabinClass: f.cabin,
        stops: f.stopCount,
        supplier: "supplierA",
        fareKey: f.bookingRef,
    }));
}

function formatDuration(departISO: string, arriveISO: string): string {
    const minutes = Math.round((new Date(arriveISO).getTime() - new Date(departISO).getTime()) / 60000);
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}