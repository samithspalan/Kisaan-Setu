# KisanSetu — Backend & Architecture Summary

## What's implemented

### Backend infrastructure
- Express 5 server (`backend/server.js`), MongoDB via Mongoose, Socket.IO for real-time chat
- Startup fails fast with a clear error if `MONGO_URI` or `JWT_SECRET` is missing
- CORS restricted to the origins listed in `FRONTEND_ORIGIN`
- Rate limiting on auth endpoints (signup/login/google)

### Authentication & roles
- Email/password signup and login, plus Google OAuth
- Every account has a server-assigned `role` (`farmer` or `customer`), embedded in the JWT and returned from every auth endpoint — the frontend never decides a user's role on its own
- Passwords hashed with bcryptjs, JWTs stored in httpOnly cookies (7-day expiry)
- Password hashes are never included in API responses

### Farmer/customer features
- Farmers create and manage crop **listings** (`/api/listings`)
- Customers browse all listings and see live/derived market prices for each commodity
- Real-time **chat** between farmers and customers via Socket.IO, with an HTTP fallback and conversation history
- **Market price** data from data.gov.in with a MongoDB fallback, plus Gemini-based crop analysis

### Documentation
- `backend/API_DOCUMENTATION.md` — full endpoint reference
- `QUICK_START.md` — quick reference for running the app
- `backend/.env.example` / `frontend/.env.example` — required environment variables (fill these in yourself; never commit the real `.env`)

---

## Project structure

```
Stack_Overlords/
├── backend/
│   ├── config/
│   │   └── token.js
│   ├── controller.js/
│   │   └── auth.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── model/
│   │   ├── model.js        (User: Username, email, password, role)
│   │   ├── Listing.js
│   │   ├── Message.js
│   │   └── priceModel.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── listings.js
│   │   └── messages.js
│   ├── services/
│   │   └── geminiService.js
│   ├── server.js
│   ├── .env.example
│   ├── package.json
│   └── API_DOCUMENTATION.md
│
├── frontend/
│   └── src/
│       ├── services/
│       │   └── authService.js
│       ├── pages/           (Farmer/Customer login, signup, dashboards, chat, listings, market analysis)
│       ├── components/
│       └── context/
│           └── ThemeContext.jsx
│
├── BACKEND_SETUP_SUMMARY.md  (this file)
└── QUICK_START.md
```

---

## Security notes

- **Role enforcement is server-side.** The JWT carries the account's role; the frontend caches it in `localStorage` purely as a UI convenience and re-validates it against the server on every page load via `/api/auth/me`.
- **No secrets in source.** All API keys/connection strings live in `.env` (gitignored). If you're setting this up fresh, copy `backend/.env.example` and `frontend/.env.example` and fill in your own values — do not paste real credentials into any tracked file.
- Auth endpoints are rate-limited; consider adding request validation schemas and a refresh-token mechanism before any production deployment.

## Running the app

```bash
# Backend
cd backend
npm install
npm run dev      # http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev      # http://localhost:5173
```

See `QUICK_START.md` for a step-by-step walkthrough and `backend/API_DOCUMENTATION.md` for the full API reference.

## Backlog / not yet built
- Password reset & email verification
- Admin dashboard
- Payments / notifications
- Automated test suite
