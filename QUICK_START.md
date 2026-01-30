# Quick Start Guide - KisanSetu Backend & Auth

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js installed
- MongoDB Atlas account (already configured)
- Both frontend and backend folders

### Step 1: Start Backend
```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB Connected
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.x.x ready in x ms

➜  Local:   http://localhost:5173
```

### Step 3: Test Authentication
1. Open http://localhost:5173
2. Click "Farmer Login" or "Farmer Signup"
3. Sign up with test credentials:
   - Email: test@farm.com
   - Password: test123456
4. You should be logged in and can navigate to dashboard

---

## 📋 Key Features

### Authentication
- ✅ Email/Password signup and login
- ✅ Secure JWT tokens (7 day expiration)
- ✅ Google OAuth integration
- ✅ Protected routes with middleware

### Frontend Integration
- ✅ Real API calls to backend
- ✅ Error message display
- ✅ Loading states on buttons
- ✅ Dark/Light theme support
- ✅ Automatic cookie handling

### Market Data
- ✅ Real commodity price data
- ✅ Market analysis and trends
- ✅ Multiple states and districts

---

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/signup      - Register new account
POST   /api/auth/login       - Login with email/password
POST   /api/auth/logout      - Logout and clear token
GET    /api/auth/me          - Get current user (requires login)
POST   /api/auth/google      - Google OAuth login
```

### Market Data
```
GET    /api/market-prices    - Get commodity prices with filters
POST   /api/store-crop-prices - Admin endpoint to update prices
```

---

## 🧪 Test API Calls

### Using REST Client (VS Code Extension)

Create a file `test.http` in backend folder:

```http
### SIGNUP
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "Username": "Raj Kumar",
  "email": "raj@farm.com",
  "password": "test123456"
}

### LOGIN
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "raj@farm.com",
  "password": "test123456"
}

### GET CURRENT USER
GET http://localhost:5000/api/auth/me

### GET MARKET PRICES
GET http://localhost:5000/api/market-prices?limit=10

### LOGOUT
POST http://localhost:5000/api/auth/logout
```

Then click "Send Request" above each call.

---

## 🎨 Frontend Features

### Dark Mode
- Toggle in top right corner of any page
- Persists across sessions
- Applied to all pages

### Login Page
- Email/password input fields
- Google OAuth button
- Error message display
- Link to signup page
- Responsive design

### Signup Page
- Name, email, password fields
- Password confirmation
- Terms & conditions checkbox
- Error handling
- Success message with redirect

---

## 🛠️ Configuration

### .env File (Backend)
```
JWT_SECRET=abhd7755                    # Secret for JWT signing
PORT=5000                              # Backend port
NODE_ENV=development                   # Environment
MONGO_URI=mongodb+srv://...            # Database connection
```

### Database
- Provider: MongoDB Atlas
- Database: Farmers_db
- Connection: Already configured in .env

### CORS
- Allowed origin: http://localhost:5173
- Credentials: Enabled for cookies

---

## 📱 Browser Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Go to **Application** tab
3. Check **Cookies** → localhost:5000
4. You should see `token` cookie after login
5. Check **Console** for any errors

### Network Tab
1. Go to **Network** tab
2. Perform login
3. Look for POST /api/auth/login request
4. Check response status (should be 200)
5. Check "Set-Cookie" header contains `token`

---

## 🔍 Debugging

### If Login Fails
1. Check backend console for errors
2. Verify email/password are correct
3. Check browser console for network errors
4. Look at Network tab to see response

### If Token Not Persisting
1. Check CORS allows credentials
2. Verify browser cookies are enabled
3. Check that credentials: 'include' in authService

### If API Not Responding
1. Verify backend is running on port 5000
2. Check MongoDB connection
3. Look at backend console logs
4. Verify .env file has correct values

---

## 📚 Documentation

- **API Docs**: `backend/API_DOCUMENTATION.md`
- **Full Setup**: `BACKEND_SETUP_SUMMARY.md`
- **Code Comments**: In `authService.js` with examples

---

## ✅ What's Already Done

- ✅ Backend server configured and running
- ✅ MongoDB connected
- ✅ JWT authentication implemented
- ✅ Frontend integrated with real API
- ✅ Error handling on forms
- ✅ Dark/Light theme support
- ✅ Protected routes with middleware
- ✅ Google OAuth setup
- ✅ Complete documentation

---

## 🎯 Common Tasks

### Reset Password
Currently not implemented. To test:
1. Sign up with new email
2. Or login with: test@farm.com / test123456

### Clear All Data
MongoDB is cloud-based, so data persists. To reset:
1. Contact database admin
2. Or create new test email each time

### Test Google OAuth
1. Login with Google button on page
2. Requires proper Google credentials setup
3. Should auto-create account on first login

---

## 💡 Tips

- Always keep backend running before accessing frontend
- Use `npm run dev` for development (auto-reload)
- Use `npm start` for production
- Check browser console for frontend errors
- Check backend terminal for server errors
- JWT tokens expire after 7 days (need to login again)

---

## 🚀 You're All Set!

The backend is fully operational with:
- ✅ Authentication system
- ✅ API routes
- ✅ Database integration
- ✅ Frontend integration
- ✅ Error handling
- ✅ Theme support

**Start building!** 🌾
