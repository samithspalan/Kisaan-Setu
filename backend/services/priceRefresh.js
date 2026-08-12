/**
 * Mandi price ingestion.
 *
 * Previously every page view hit data.gov.in live: a request for
 * limit=5000 paged through 5 sequential upstream calls, each with a 30s
 * timeout and a retry, so a single dashboard load could hang for minutes
 * and 100 concurrent users meant ~500 upstream requests. Nothing was
 * cached.
 *
 * Now the upstream feed is pulled on a schedule into MongoDB and user
 * requests only ever read from the database. Prices are published daily,
 * so a few hours of staleness costs nothing and the app stays up even
 * when data.gov.in is slow or down.
 */
import axios from 'axios';
import Price from '../model/priceModel.js';

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

/** data.gov.in returns DD/MM/YYYY strings, which don't sort correctly. */
export const parseArrivalDate = (dateStr) => {
    if (!dateStr) return null;
    const [dd, mm, yyyy] = String(dateStr).split('/').map(Number);
    if (!dd || !mm || !yyyy) return null;
    return new Date(Date.UTC(yyyy, mm - 1, dd));
};

const toNumber = (value) => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : null;
};

/**
 * Fetches the most recent `days` of available price dates and upserts
 * them. Uses bulkWrite against the (market, commodity, variety,
 * arrival_date) unique index so a re-run is idempotent — the previous
 * implementation did deleteMany({}) then insertMany, which left the
 * collection empty if the insert failed partway.
 */
export async function refreshPrices({ days = 3, apiKey = process.env.API_KEY } = {}) {
    if (!apiKey) {
        throw new Error('API_KEY is not set; cannot refresh prices from data.gov.in');
    }

    const startedAt = Date.now();

    // Discover which dates the feed actually has — calendar dates don't
    // work because mandis don't report every day.
    const indexResponse = await axios.get(BASE_URL, {
        params: { 'api-key': apiKey, format: 'json', limit: 2000 },
        timeout: 20000,
    });

    const availableDates = Array.from(
        new Set((indexResponse.data.records || []).map((r) => r.arrival_date).filter(Boolean))
    )
        .sort((a, b) => (parseArrivalDate(b)?.getTime() || 0) - (parseArrivalDate(a)?.getTime() || 0))
        .slice(0, days);

    if (availableDates.length === 0) {
        return { ok: false, reason: 'no-dates-available', upserted: 0, dates: [] };
    }

    let allRecords = [];
    const perDate = [];

    for (const date of availableDates) {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    'api-key': apiKey,
                    format: 'json',
                    limit: 5000,
                    'filters[arrival_date]': date,
                },
                timeout: 20000,
            });
            const records = response.data.records || [];
            allRecords.push(...records);
            perDate.push({ date, records: records.length });
        } catch (error) {
            perDate.push({ date, error: error.message });
        }
    }

    if (allRecords.length === 0) {
        return { ok: false, reason: 'no-records-fetched', upserted: 0, dates: perDate };
    }

    const operations = allRecords
        .filter((r) => r.market && r.commodity && r.arrival_date)
        .map((r) => {
            const filter = {
                market: r.market,
                commodity: r.commodity,
                variety: r.variety || '',
                arrival_date: r.arrival_date,
            };
            return {
                updateOne: {
                    filter,
                    update: {
                        $set: {
                            ...filter,
                            state: r.state,
                            district: r.district,
                            modal_price: toNumber(r.modal_price) ?? 0,
                            min_price: toNumber(r.min_price),
                            max_price: toNumber(r.max_price),
                            arrival_date_iso: parseArrivalDate(r.arrival_date),
                            refreshedAt: new Date(),
                        },
                    },
                    upsert: true,
                },
            };
        });

    const result = await Price.bulkWrite(operations, { ordered: false });
    const upserted = (result.upsertedCount || 0) + (result.modifiedCount || 0);

    // Keep the collection bounded — old dates are never displayed.
    const cutoff = parseArrivalDate(availableDates[availableDates.length - 1]);
    if (cutoff) {
        await Price.deleteMany({ arrival_date_iso: { $lt: cutoff } });
    }

    return {
        ok: true,
        upserted,
        matched: result.matchedCount || 0,
        dates: perDate,
        durationMs: Date.now() - startedAt,
    };
}

/**
 * Returns true when the newest stored price row is older than
 * `maxAgeHours`. Used so a process restart doesn't re-hammer the
 * upstream feed when the data is already fresh.
 */
export async function pricesAreStale(maxAgeHours = 6) {
    const newest = await Price.findOne().sort({ refreshedAt: -1 }).select('refreshedAt').lean();
    if (!newest?.refreshedAt) return true;
    return Date.now() - new Date(newest.refreshedAt).getTime() > maxAgeHours * 60 * 60 * 1000;
}
