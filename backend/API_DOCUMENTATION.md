# Backend API Documentation

## Overview
Express.js backend for KisanSetu. Provides authentication (with farmer/customer roles), crop listings, real-time chat (Socket.IO), market price data, and AI crop analysis.

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB connection string (Atlas or local)
- A `.env` file — copy `.env.example` and fill in real values; never commit `.env`

### Installation Steps
```bash
cd backend
npm install
npm run dev  # Development mode with nodemon
npm start    # Production mode
```

## Environment Variables (.env)
See `.env.example` for the full list of required variables (`JWT_SECRET`, `MONGO_URI`, `API_KEY`, `GOOGLE_CLIENT_ID`, Cloudinary/Gemini keys, etc.). The server will refuse to start if `MONGO_URI` or `JWT_SECRET` is missing.

## API Routes

### Authentication Endpoints
All auth routes are prefixed with `/api/auth`. Signup/login are rate-limited (20 requests / 15 min per IP).

#### 1. User Signup
**POST** `/api/auth/signup`

Request body:
```json
{
  "Username": "farmer_name",
  "email": "farmer@example.com",
  "password": "secure_password",
  "role": "farmer"
}
```
`role` must be `"farmer"` or `"customer"`.

Response:
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "user_id",
    "Username": "farmer_name",
    "email": "farmer@example.com",
    "role": "farmer"
  }
}
```

#### 2. User Login
**POST** `/api/auth/login`

Request body:
```json
{ "email": "farmer@example.com", "password": "secure_password" }
```

Response:
```json
{
  "user": {
    "_id": "user_id",
    "Username": "farmer_name",
    "email": "farmer@example.com",
    "role": "farmer"
  }
}
```
JWT token (includes the user's role) is set automatically in an httpOnly cookie. Password hashes are never included in any response.

#### 3. Get Current User (Protected)
**GET** `/api/auth/me` — requires valid JWT cookie.

Response: same `user` shape as login.

#### 4. Update Current User (Protected)
**PUT** `/api/auth/me` — requires valid JWT cookie.

Request body (all fields optional):
```json
{ "Username": "new_name", "email": "new@example.com", "password": "new_password" }
```
Password is only re-hashed if a new one is provided.

#### 5. User Logout
**POST** `/api/auth/logout` — clears the JWT cookie.

#### 6. Google OAuth Login
**POST** `/api/auth/google`

Request body:
```json
{ "token": "google_id_token", "role": "farmer" }
```
`role` is only used the first time an account is created via Google; existing accounts keep their originally registered role.

### Listings Endpoints
All prefixed with `/api/listings`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/create` | required | Create a listing (owned by the authenticated farmer) |
| GET | `/my-listings` | required | Listings owned by the authenticated user |
| GET | `/all` | public | All listings, with farmer info populated |
| GET | `/:id` | public | Single listing by id |
| PUT | `/:id` | required (owner only) | Update a listing |
| DELETE | `/:id` | required (owner only) | Delete a listing |

### Messages Endpoints
All prefixed with `/api/messages`, all require auth.

| Method | Path | Description |
|---|---|---|
| GET | `/conversation/:otherUserId` | Message history with another user |
| GET | `/conversations` | List of conversations for the current user |
| POST | `/send` | HTTP fallback for sending a message (Socket.IO is primary) |

### Real-time Chat (Socket.IO)
- `join` — client registers its socket under a userId
- `send_message` — persists a message and emits `receive_message` / `conversation_updated` to the recipient if online, plus `message_sent` / `conversation_updated` back to the sender

### Market Data Endpoints

#### Get Market Prices
**GET** `/api/market-prices`

Query Parameters:
- `limit` (optional, default 100, max 5000)
- `date` (optional, format DD/MM/YYYY)
- `state` (optional)
- `commodity` (optional)

Falls back to the local database if the data.gov.in API is unreachable or returns fewer records than requested.

#### Stored Crop Prices
- **POST** `/api/store-crop-prices?days=N` — fetches and stores the last N available days of prices (max 60). Maintenance-only; requires header `x-admin-secret` matching the `ADMIN_SECRET` env var.
- **GET** `/api/crop-prices` — reads stored prices, filterable by `commodity` / `district`

### AI Analysis Endpoints
- **GET** `/api/ai/analyze/:commodity` — Gemini-based analysis for one commodity
- **GET** `/api/ai/crop-rankings` — all crops ranked by demand

## Architecture

### Folder Structure
```
backend/
├── config/
│   └── token.js           # JWT token generation (embeds user id + role)
├── controller.js/
│   └── auth.js             # Authentication logic
├── middleware/
│   └── authMiddleware.js   # JWT verification middleware
├── model/
│   ├── model.js             # User schema (role: farmer/customer)
│   ├── Listing.js           # Crop listing schema
│   ├── Message.js           # Chat message schema
│   └── priceModel.js        # Market price schema
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── listings.js           # Listing routes
│   └── messages.js           # Message routes
├── services/
│   └── geminiService.js    # AI analysis services
├── .env                    # Environment variables (not committed)
└── server.js                # Entry point: Express + Socket.IO + market-price routes
```

## Data Models

### User Model
```javascript
{
  Username: String (required),
  email: String (required, unique),
  password: String (required, hashed with bcryptjs),
  role: String (required, enum: ['farmer', 'customer']),
  timestamps: true
}
```

### Listing Model
```javascript
{
  farmerId: ObjectId (ref: User, required),
  commodity: String (required),
  variety: String,
  quantity: Number (required),
  unit: String (enum: ['kg', 'quintal', 'ton']),
  expectedPrice: Number (required),
  description: String,
  location: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  conversationId: String (required, indexed),
  senderId: ObjectId (ref: User, required),
  receiverId: ObjectId (ref: User, required),
  listingId: ObjectId (ref: Listing),
  message: String (required),
  read: Boolean,
  createdAt: Date (indexed)
}
```

## Security Features

- **Password Hashing**: bcryptjs (10 rounds), never returned in API responses
- **JWT Authentication**: token embeds user id + role; role is never trusted from the client
- **HttpOnly Cookies**: JWT tokens stored in secure, httpOnly cookies
- **CORS**: configured via `FRONTEND_ORIGIN` (comma-separated allowed origins)
- **Rate limiting**: on `/api/auth/signup`, `/api/auth/login`, `/api/auth/google`
- **Startup validation**: server refuses to start if `MONGO_URI`/`JWT_SECRET` are missing
- **Environment Variables**: all secrets in `.env` (gitignored), no secrets hardcoded in source

## External APIs

- **data.gov.in** — agricultural market prices (requires `API_KEY` env var)
- **Google OAuth** — sign-in with Google (requires `GOOGLE_CLIENT_ID` env var)
- **Google Generative AI (Gemini)** — crop analysis (requires `GEMINI_API_KEY` env var)

## Error Handling

All endpoints return JSON with appropriate HTTP status codes (200/201/400/401/403/404/500). Unmatched routes return a JSON 404; unhandled errors are caught by a final JSON error handler.

## Troubleshooting

### Server won't start
- Check the console for a "Missing required environment variable(s)" error — set `MONGO_URI` and `JWT_SECRET` in `.env`

### MongoDB Connection Error
- Verify `MONGO_URI` in `.env`
- Check MongoDB Atlas IP whitelist includes your IP

### JWT Token Invalid
- Check `JWT_SECRET` in `.env`
- Verify token hasn't expired (7 days)
- Clear cookies and re-login

### CORS Errors
- Verify the frontend origin is included in `FRONTEND_ORIGIN`

## Future Enhancements

- [ ] Request validation schemas
- [ ] Refresh token mechanism
- [ ] Password reset / email verification
- [ ] Automated test suite
