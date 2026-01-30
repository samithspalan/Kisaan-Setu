# Backend API Documentation

## Overview
This is the Express.js backend server for the KisanSetu (Farmer's Companion) application. It provides authentication, market data, and crop analysis endpoints.

## Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account with connection string
- .env file with required environment variables

### Installation Steps
```bash
cd backend
npm install
npm run dev  # Development mode with nodemon
npm start    # Production mode
```

## Environment Variables (.env)
```
JWT_SECRET=abhd7755
NODE_ENV=development
PORT=5000
API_KEY=579b464db66ec23bdd00000168192898a7804f5c78598b8f95b641a1
MONGO_URI=mongodb+srv://...
GOOGLE_CLIENT_ID=952084918159-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GEMINI_API_KEY=...
```

## API Routes

### Authentication Endpoints
All auth routes are prefixed with `/api/auth`

#### 1. User Signup
**POST** `/api/auth/signup`

Request body:
```json
{
  "Username": "farmer_name",
  "email": "farmer@example.com",
  "password": "secure_password"
}
```

Response:
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "user_id",
    "Username": "farmer_name",
    "email": "farmer@example.com"
  }
}
```

#### 2. User Login
**POST** `/api/auth/login`

Request body:
```json
{
  "email": "farmer@example.com",
  "password": "secure_password"
}
```

Response:
```json
{
  "user": {
    "_id": "user_id",
    "Username": "farmer_name",
    "email": "farmer@example.com"
  }
}
```

Note: JWT token is automatically set in httpOnly cookie

#### 3. Get Current User (Protected)
**GET** `/api/auth/me`

Headers:
- Requires valid JWT token in cookie (set automatically after login)

Response:
```json
{
  "user": {
    "_id": "user_id",
    "Username": "farmer_name",
    "email": "farmer@example.com"
  }
}
```

#### 4. User Logout
**POST** `/api/auth/logout`

Response:
```json
{
  "message": "User logged out successfully"
}
```

Clears the JWT token from cookies

#### 5. Google OAuth Login
**POST** `/api/auth/google`

Request body:
```json
{
  "token": "google_id_token"
}
```

Response:
```json
{
  "user": {
    "_id": "user_id",
    "Username": "user_name",
    "email": "user@gmail.com"
  }
}
```

### Market Data Endpoints

#### Get Market Prices
**GET** `/api/market-prices`

Query Parameters:
- `limit` (optional): Number of records to return (default: 100, max: 500)
- `date` (optional): Filter by date (format: DD/MM/YYYY)
- `state` (optional): Filter by state

Response:
```json
{
  "success": true,
  "records": [
    {
      "state": "Karnataka",
      "district": "Udupi",
      "market": "Udupi",
      "commodity": "Coconut",
      "variety": "Other",
      "modal_price": 2800,
      "arrival_date": "30/01/2026"
    }
  ],
  "source": "latest-available"
}
```

### Market Data Storage Endpoint

#### Store Crop Prices (Admin)
**POST** `/api/store-crop-prices`

Fetches and stores the last 3 days of crop prices from the API.gov.in data source

Response:
```json
{
  "success": true,
  "message": "Successfully stored X prices for Y crops",
  "details": {
    "totalRecords": 1000,
    "uniqueCrops": 12,
    "crops": {
      "Tomato": 150,
      "Onion": 180,
      ...
    }
  }
}
```

## Architecture

### Folder Structure
```
backend/
├── config/
│   ├── db.js              # Database configuration
│   └── token.js           # JWT token generation
├── controller.js/
│   └── auth.js            # Authentication logic
├── middleware/
│   └── authMiddleware.js  # JWT verification middleware
├── model/
│   ├── model.js           # User schema
│   └── priceModel.js      # Market price schema
├── routes/
│   └── auth.js            # Authentication routes
├── services/
│   └── geminiService.js   # AI analysis services
├── .env                   # Environment variables
├── package.json           # Dependencies
└── server.js              # Main entry point
```

### Middleware

#### Authentication Middleware
`middleware/authMiddleware.js` - Verifies JWT token from cookies and protects routes

Usage:
```javascript
app.get('/api/auth/me', isAuthenticated, getUser)
```

## Data Models

### User Model
```javascript
{
  Username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed with bcryptjs),
  timestamps: true
}
```

### Price Model
```javascript
{
  state: String,
  district: String,
  market: String,
  commodity: String,
  variety: String,
  modal_price: Number,
  min_price: Number,
  max_price: Number,
  arrival_date: String,
  created_at: Date
}
```

## Security Features

- **Password Hashing**: bcryptjs (10 rounds)
- **JWT Authentication**: Secure token-based authentication
- **HttpOnly Cookies**: JWT tokens stored in secure, httpOnly cookies
- **CORS**: Configured for localhost:5173 (frontend)
- **Environment Variables**: Sensitive data in .env file

## External APIs

### Government of India Data Portal
- Fetches agricultural market prices
- API Key: `579b464db66ec23bdd00000168192898a7804f5c78598b8f95b641a1`
- Resource: Agricultural market information from various states

### Google OAuth
- Allows users to sign in with Google
- Client ID: `952084918159-7rumtd7e8ublui9pphgum4rtp4uo87o8.apps.googleusercontent.com`

### Google Generative AI (Gemini)
- Provides crop analysis and recommendations
- Used in CropAnalysis pages

## Error Handling

All endpoints return appropriate HTTP status codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (auth required)
- **500**: Server Error

Error response format:
```json
{
  "message": "Error description"
}
```

## Development

### Running in Development Mode
```bash
npm run dev
```

Uses nodemon to automatically restart server on file changes

### Testing Endpoints

Use Postman, curl, or VS Code REST Client to test endpoints:

```http
### Sign up
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "Username": "testfarmer",
  "email": "test@example.com",
  "password": "password123"
}

### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### Get Current User
GET http://localhost:5000/api/auth/me

### Get Market Prices
GET http://localhost:5000/api/market-prices?limit=100
```

## Troubleshooting

### MongoDB Connection Error
- Verify MONGO_URI in .env file
- Check MongoDB Atlas IP whitelist includes your IP
- Ensure database is active

### JWT Token Invalid
- Check JWT_SECRET in .env
- Verify token hasn't expired (7 days)
- Clear cookies and re-login

### CORS Errors
- Verify frontend is running on localhost:5173
- Check CORS configuration in server.js

## Future Enhancements

- [ ] Rate limiting
- [ ] Request validation schemas
- [ ] Refresh token mechanism
- [ ] User profile management
- [ ] Farmer-specific features
- [ ] Real-time price notifications
- [ ] Analytics dashboard
