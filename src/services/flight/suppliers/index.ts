

import { searchSupplierA, SupplierFlight } from "./supplierA";
import { searchSupplierB } from "./supplierB";

const SUPPLIER_TIMEOUT_MS = 5000;

interface SupplierQuery {
    source: string;
    destination: string;
    departureDate: string;
}

const suppliers: Array<{ name: string; fn: (q: SupplierQuery) => Promise<SupplierFlight[]> }> = [
    { name: "supplierA", fn: searchSupplierA },
    { name: "supplierB", fn: searchSupplierB },
];

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
        promise.then(
            (val) => {
                clearTimeout(timer);
                resolve(val);
            },
            (err) => {
                clearTimeout(timer);
                reject(err);
            }
        );
    });
}

/**
 * Calls every external supplier in parallel. A supplier that errors or
 * times out is dropped (logged) rather than failing the whole search —
 * partial results beat no results when one integration hiccups.
 *
 * Requires source, destination, AND departureDate — external suppliers
 * can't generate a meaningful flight without a date, unlike your internal
 * DB search which tolerates an open-ended departureDate.
 */
export async function searchExternalSuppliers(query: {
    source?: string;
    destination?: string;
    departureDate?: string;
}): Promise<SupplierFlight[]> {
    if (!query.source || !query.destination || !query.departureDate) {
        return [];
    }

    const typedQuery: SupplierQuery = {
        source: query.source,
        destination: query.destination,
        departureDate: query.departureDate,
    };

    const settled = await Promise.allSettled(
        suppliers.map((s) => withTimeout(s.fn(typedQuery), SUPPLIER_TIMEOUT_MS, s.name))
    );

    const results: SupplierFlight[] = [];

    settled.forEach((outcome, i) => {
        const supplierName = suppliers[i].name;
        if (outcome.status === "fulfilled") {
            results.push(...outcome.value);
        } else {
            console.error(`[supplier:${supplierName}] failed: ${outcome.reason?.message || outcome.reason}`);
        }
    });

    return results;
}