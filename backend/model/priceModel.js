import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
    state: { type: String },
    district: { type: String },
    market: { type: String, required: true },
    commodity: { type: String, required: true },
    variety: { type: String, default: '' },
    modal_price: { type: Number, required: true },
    min_price: { type: Number },
    max_price: { type: Number },
    // As returned by data.gov.in: a DD/MM/YYYY string. Kept for display
    // and for the API contract the frontend already consumes.
    arrival_date: { type: String, required: true },
    // Parsed form of the above. The string version sorts lexicographically
    // (so 02/01 beats 30/12), which made "latest prices" queries wrong.
    arrival_date_iso: { type: Date },
    // When this row was last written by the refresh job — drives the
    // staleness check and the "prices from X" label in the UI.
    refreshedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Identity of a price quote. Makes the scheduled refresh an idempotent
// upsert instead of the old delete-everything-then-reinsert.
priceSchema.index(
    { market: 1, commodity: 1, variety: 1, arrival_date: 1 },
    { unique: true }
);

// Read paths: newest-first listings, and per-commodity lookups.
priceSchema.index({ arrival_date_iso: -1 });
priceSchema.index({ commodity: 1, arrival_date_iso: -1 });
priceSchema.index({ district: 1, commodity: 1 });

const Price = mongoose.model('Price', priceSchema);
export default Price;
