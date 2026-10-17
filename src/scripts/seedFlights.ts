import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db";
import Flight from "../models/Flight";
// npx tsx src/scripts/seedFlights.ts --fresh --days=30

const args = process.argv.slice(2);
const FRESH = args.includes("--fresh");
const DAYS = Number(args.find((a) => a.startsWith("--days="))?.split("=")[1]) || 30;


const PAIRS: [string, string, number, number][] = [
    ["DEL", "BOM", 130, 5200],
    ["DEL", "BLR", 165, 5600],
    ["DEL", "HYD", 135, 4800],
    ["DEL", "CCU", 140, 5400],
    ["DEL", "MAA", 175, 6000],
    ["DEL", "GOI", 150, 6200],
    ["BOM", "BLR", 100, 3800],
    ["BOM", "GOI", 70, 3000],
    ["BOM", "HYD", 90, 3500],
];

const AIRLINES = [
    { name: "IndiGo", code: "6E" },
    { name: "Air India", code: "AI" },
    { name: "Akasa Air", code: "QP" },
    { name: "Air India Express", code: "IX" },
    { name: "SpiceJet", code: "SG" },
];

const SLOTS = ["06:00", "07:30", "09:00", "10:30", "12:00", "14:30", "16:00", "18:30", "20:00", "22:00"];
const FLIGHTS_PER_ROUTE_PER_DAY = 8;

// small seeded random generator so every run produces the same data
function makeRng(seed: number) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
    };
}

const pad = (n: number) => String(n).padStart(2, "0");
const fmtDuration = (mins: number) => `${Math.floor(mins / 60)}h ${pad(mins % 60)}m`;
const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

// expand pairs into both directions
const ROUTES = PAIRS.flatMap(([a, b, mins, price]) => [
    { from: a, to: b, mins, price },
    { from: b, to: a, mins, price },
]);

function buildFlights() {
    const rng = makeRng(42);
    const docs: any[] = [];

    for (let day = 0; day < DAYS; day++) {
        const dayStart = new Date();
        dayStart.setHours(0, 0, 0, 0);
        dayStart.setDate(dayStart.getDate() + day);
        const weekend = [0, 5, 6].includes(dayStart.getDay());

        ROUTES.forEach((route, routeIdx) => {
            // pick 8 of the 10 slots, in time order
            const slots = [...SLOTS].sort(() => rng() - 0.5).slice(0, FLIGHTS_PER_ROUTE_PER_DAY).sort();

            slots.forEach((slot, i) => {
                const [hh, mm] = slot.split(":").map(Number);
                const airline = AIRLINES[Math.floor(rng() * AIRLINES.length)];

                const stops = rng() < 0.12 ? 1 : 0;
                const minutes = route.mins + (stops ? 70 + Math.floor(rng() * 40) : Math.floor(rng() * 15));

                const departureTime = new Date(dayStart);
                departureTime.setHours(hh, mm, 0, 0);
                const arrivalTime = new Date(departureTime.getTime() + minutes * 60000);

                let cabinClass: "Economy" | "Premium Economy" | "Business" = "Economy";
                let multiplier = 0.8 + rng() * 0.6;                 // 0.8x to 1.4x
                let seats = 10 + Math.floor(rng() * 50);
                if (i % 7 === 6) { cabinClass = "Business"; multiplier *= 2.4; seats = 4 + Math.floor(rng() * 12); }
                else if (i % 5 === 4) { cabinClass = "Premium Economy"; multiplier *= 1.5; seats = 6 + Math.floor(rng() * 20); }
                if (weekend) multiplier *= 1.12;
                if (stops) multiplier *= 0.85;

                const flightNumber = `${airline.code}-${100 + routeIdx * 20 + i}`;

                docs.push({
                    flightId: `${route.from}${route.to}-${ymd(dayStart)}-${flightNumber}`,
                    flightNumber,
                    airline: airline.name,
                    source: route.from,
                    destination: route.to,
                    departureTime,
                    arrivalTime,
                    duration: fmtDuration(minutes),
                    price: Math.round((route.price * multiplier) / 10) * 10,
                    availableSeats: seats,
                    cabinClass,
                    stops,
                    isActive: true,
                });
            });
        });
    }
    return docs;
}

async function seed() {
    await connectDB();

    if (FRESH) {
        const { deletedCount } = await Flight.deleteMany({});
        console.log(`Cleared ${deletedCount} existing flights`);
    }
    await Flight.syncIndexes(); // drops the old unique index on flightNumber, if it exists

    const docs = buildFlights();
    try {
        const inserted = await Flight.insertMany(docs, { ordered: false });
        console.log(`Inserted ${inserted.length} flights (${ROUTES.length} routes x ${DAYS} days)`);
    } catch (err: any) {
        // ordered:false keeps going past duplicates, so re-running the seed is safe
        const ok = err?.insertedDocs?.length ?? 0;
        console.warn(`Finished with some duplicates skipped. Inserted ${ok}. (${err.message.slice(0, 120)})`);
    }

    await disconnectDB();
}

seed().catch(async (e) => {
    console.error("Seed failed:", e);
    await disconnectDB();
    process.exit(1);
});