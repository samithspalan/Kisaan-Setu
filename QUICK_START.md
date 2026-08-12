# Quick Start Guide — KisanSetu

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env   # then fill in real values (Mongo URI, JWT secret, API keys)
npm run dev
```
Expected output:
```
Server running on port 5000
MongoDB Connected
```
The server exits immediately with a clear error if `MONGO_URI` or `JWT_SECRET` is missing from `.env`.

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env   # point at your backend origin if not the default
npm run dev
```
Expected output:
```
VITE ready in x ms
➜  Local:   http://localhost:5173
```

### 3. Try it out
1. Open http://localhost:5173
2. Sign up as a **Farmer** or a **Customer** — the role you pick at signup is what's stored server-side; it can't be changed later by editing browser storage
3. As a farmer: create a crop listing, view it from a customer account, and chat between the two accounts
4. Log out / log back in and confirm you land on the correct dashboard for your role

---

## Key features

- Email/password + Google OAuth signup and login, with a server-enforced `farmer`/`customer` role
- Crop listings (create/update/delete by the owning farmer, browsable by anyone)
- Real-time chat between farmers and customers (Socket.IO, with HTTP fallback)
- Market price lookups (data.gov.in, with a database fallback) and Gemini-based crop analysis
- Dark/light theme, i18n (multiple languages)

---

## API endpoints

See `backend/API_DOCUMENTATION.md` for the full reference. Highlights:

```
POST /api/auth/signup          { Username, email, password, role }
POST /api/auth/login           { email, password }
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/me              { Username?, email?, password? }
POST /api/auth/google          { token, role }

GET    /api/listings/all
POST   /api/listings/create    (auth required)
GET    /api/listings/my-listings (auth required)
PUT    /api/listings/:id       (auth required, owner only)
DELETE /api/listings/:id       (auth required, owner only)

GET  /api/messages/conversations   (auth required)
GET  /api/messages/conversation/:otherUserId (auth required)

GET  /api/market-prices?limit=&date=&state=&commodity=
```

---

## Debugging

### Backend won't start
- Read the console error — it now tells you exactly which env var is missing
- Verify `MONGO_URI` points at a reachable database

### Login/auth issues
- Check the `token` cookie in DevTools → Application → Cookies → localhost:5000
- `/api/auth/me` should return `{ user: { ..., role } }` with no password field

### Frontend can't reach backend
- Confirm the backend is running and `FRONTEND_ORIGIN` (backend `.env`) includes your frontend's origin
- Confirm `VITE_API_ORIGIN` (frontend `.env`) points at the backend

---

## Notes

- Never commit a real `.env` file — only `.env.example` with placeholder values should be tracked
- JWTs expire after 7 days
