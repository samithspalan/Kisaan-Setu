# KisanSetu — Project Status

For setup instructions see [QUICK_START.md](QUICK_START.md); for architecture and API details see [BACKEND_SETUP_SUMMARY.md](BACKEND_SETUP_SUMMARY.md) and [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md).

## What's built

- **Auth**: email/password + Google OAuth, server-enforced `farmer`/`customer` role, JWT in httpOnly cookies
- **Listings**: farmers create/edit/delete crop listings; customers browse all listings
- **Chat**: real-time messaging between farmers and customers (Socket.IO + HTTP fallback)
- **Market data**: live prices from data.gov.in with a MongoDB fallback, plus Gemini-based crop analysis
- **Frontend**: React + Vite, dark/light theme, i18n, farmer location map

## Security posture

- Role (`farmer`/`customer`) is decided and enforced server-side — the JWT carries it, and the frontend re-validates against `/api/auth/me` rather than trusting client-side storage
- Password hashes are never returned in API responses
- No API keys or secrets are hardcoded in source; everything required lives in `.env` (see `.env.example` in `backend/` and `frontend/`)
- Auth endpoints are rate-limited

## Backlog

- Password reset / email verification
- Admin dashboard
- Payments / notifications
- Automated test suite

## Running locally

```bash
cd backend && npm install && npm run dev    # http://localhost:5000
cd frontend && npm install && npm run dev   # http://localhost:5173
```

Both need a `.env` file (copy the corresponding `.env.example`) with real values — the backend will refuse to start without `MONGO_URI` and `JWT_SECRET` set.
