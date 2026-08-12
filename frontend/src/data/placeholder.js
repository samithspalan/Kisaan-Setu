/**
 * Placeholder data for the redesigned pages.
 *
 * The visual/architecture pass in this changeset is decoupled from the
 * live backend on purpose — these pages render from fixture data so the
 * design can be reviewed on its own. Swap for real API calls (see
 * frontend/src/services/authService.js and config/api.js for the
 * pattern already used elsewhere) when wiring this up for real.
 */

export const mandiBoard = [
  { id: 1, commodity: 'Tomato', market: 'Udupi, Karnataka', price: 2500, unit: 'quintal', trend: 'up' },
  { id: 2, commodity: 'Onion', market: 'Bengaluru, Karnataka', price: 1800, unit: 'quintal', trend: 'down' },
  { id: 3, commodity: 'Paddy', market: 'Mandya, Karnataka', price: 2150, unit: 'quintal', trend: 'flat' },
  { id: 4, commodity: 'Coconut', market: 'Mangalore, Karnataka', price: 3200, unit: '100 nuts', trend: 'up' },
  { id: 5, commodity: 'Areca Nut', market: 'Shimoga, Karnataka', price: 42000, unit: 'quintal', trend: 'up' },
  { id: 6, commodity: 'Banana', market: 'Chikkaballapur, Karnataka', price: 1400, unit: 'quintal', trend: 'down' },
]

/**
 * Same raw shape as the real GET /api/market-prices records (state,
 * district, market, commodity, variety, modal_price, min_price,
 * max_price, arrival_date) — used by FarmerDashboard.jsx so its
 * existing filter/gainers/losers logic works unchanged against fixture
 * data instead of a live request.
 */
export const rawMarketPrices = [
  { state: 'Karnataka', district: 'Udupi', market: 'Udupi', commodity: 'Tomato', variety: 'Hybrid', modal_price: 2500, min_price: 2200, max_price: 2800, arrival_date: '04/07/2026' },
  { state: 'Karnataka', district: 'Bangalore Urban', market: 'Bengaluru', commodity: 'Onion', variety: 'Local', modal_price: 1800, min_price: 1600, max_price: 2000, arrival_date: '04/07/2026' },
  { state: 'Karnataka', district: 'Mandya', market: 'Mandya', commodity: 'Paddy', variety: 'Common', modal_price: 2150, min_price: 2050, max_price: 2250, arrival_date: '04/07/2026' },
  { state: 'Karnataka', district: 'Dakshina Kannada', market: 'Mangalore', commodity: 'Coconut', variety: 'Other', modal_price: 3200, min_price: 2900, max_price: 3500, arrival_date: '04/07/2026' },
  { state: 'Karnataka', district: 'Shimoga', market: 'Shimoga', commodity: 'Areca Nut', variety: 'Red', modal_price: 42000, min_price: 39000, max_price: 45000, arrival_date: '04/07/2026' },
  { state: 'Karnataka', district: 'Chikkaballapur', market: 'Chikkaballapur', commodity: 'Banana', variety: 'Robusta', modal_price: 1400, min_price: 1250, max_price: 1550, arrival_date: '04/07/2026' },
  { state: 'Karnataka', district: 'Chikmagalur', market: 'Chikmagalur', commodity: 'Coffee', variety: 'Arabica', modal_price: 18500, min_price: 17800, max_price: 19200, arrival_date: '04/07/2026' },
  { state: 'Karnataka', district: 'Belgaum', market: 'Belgaum', commodity: 'Sugarcane', variety: 'Common', modal_price: 320, min_price: 300, max_price: 340, arrival_date: '04/07/2026' },
]

export const listings = [
  {
    id: 'l1',
    commodity: 'Tomato',
    variety: 'Hybrid',
    quantity: 400,
    unit: 'kg',
    expectedPrice: 26,
    location: 'Udupi',
    farmer: 'Ravi Kumar',
    postedAgo: '2 hours ago',
  },
  {
    id: 'l2',
    commodity: 'Areca Nut',
    variety: 'Red',
    quantity: 8,
    unit: 'quintal',
    expectedPrice: 41500,
    location: 'Shimoga',
    farmer: 'Ganesh Bhat',
    postedAgo: '5 hours ago',
  },
  {
    id: 'l3',
    commodity: 'Banana',
    variety: 'Robusta',
    quantity: 1200,
    unit: 'kg',
    expectedPrice: 14,
    location: 'Chikkaballapur',
    farmer: 'Lakshmi Devi',
    postedAgo: '1 day ago',
  },
]

/*
 * `stats` (activeFarmers / weeklyVolumeTons / partnerMandis) was removed
 * deliberately. Those were invented numbers rendered on the landing page
 * as real platform metrics. Real counts now come from
 * GET /api/platform-stats — see backend/server.js.
 */
