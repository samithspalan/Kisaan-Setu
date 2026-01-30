import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { singUp as signUp, login, logout, getUser } from './controller.js/auth.js';
import isAuthenticated from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Auth Routes
app.post('/api/auth/signup', signUp);
app.post('/api/auth/login', login);
app.post('/api/auth/logout', logout);
app.get('/api/auth/me', isAuthenticated, getUser);

const API_KEY = process.env.API_KEY || "579b464db66ec23bdd00000168192898a7804f5c78598b8f95b641a1";
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

// Mock Data for Fallback (When API fails/timeouts)
const MOCK_DATA = [
    { state: "Karnataka", district: "Udupi", market: "Udupi", commodity: "Coconut", variety: "Other", modal_price: "2800", arrival_date: "30/01/2026" },
    { state: "Karnataka", district: "Dakshina Kannada", market: "Mangalore", commodity: "Arecanut", variety: "Red", modal_price: "45000", arrival_date: "30/01/2026" },
    { state: "Maharashtra", district: "Pune", market: "Pune", commodity: "Onion", variety: "Red", modal_price: "2200", arrival_date: "30/01/2026" },
    { state: "Punjab", district: "Ludhiana", market: "Ludhiana", commodity: "Wheat", variety: "Dara", modal_price: "2400", arrival_date: "30/01/2026" },
    { state: "Kerala", district: "Kozhikode", market: "Kozhikode", commodity: "Pepper", variety: "Ungarbled", modal_price: "32000", arrival_date: "30/01/2026" },
    { state: "Tamil Nadu", district: "Coimbatore", market: "Coimbatore", commodity: "Tomato", variety: "Hybrid", modal_price: "1800", arrival_date: "30/01/2026" },
    { state: "Gujarat", district: "Surat", market: "Surat", commodity: "Cotton", variety: "Shankar-6", modal_price: "6500", arrival_date: "30/01/2026" },
    { state: "Rajasthan", district: "Jaipur", market: "Jaipur", commodity: "Bajra", variety: "Hybrid", modal_price: "2100", arrival_date: "30/01/2026" },
    { state: "West Bengal", district: "Bardhaman", market: "Burdwan", commodity: "Rice", variety: "Common", modal_price: "3100", arrival_date: "30/01/2026" },
    { state: "Madhya Pradesh", district: "Indore", market: "Indore", commodity: "Soyabean", variety: "Yellow", modal_price: "4800", arrival_date: "30/01/2026" },
    { state: "Uttar Pradesh", district: "Agra", market: "Agra", commodity: "Potato", variety: "Desi", modal_price: "1200", arrival_date: "30/01/2026" },
    { state: "Andhra Pradesh", district: "Guntur", market: "Guntur", commodity: "Chilli Red", variety: "Teja", modal_price: "18000", arrival_date: "30/01/2026" },
    { state: "Telangana", district: "Warangal", market: "Warangal", commodity: "Turmeric", variety: "Finger", modal_price: "5600", arrival_date: "30/01/2026" },
    { state: "Bihar", district: "Patna", market: "Patna", commodity: "Maize", variety: "Hybrid", modal_price: "2050", arrival_date: "30/01/2026" },
    { state: "Assam", district: "Guwahati", market: "Guwahati", commodity: "Ginger", variety: "Fresh", modal_price: "4500", arrival_date: "30/01/2026" },
    { state: "Odisha", district: "Cuttack", market: "Cuttack", commodity: "Jute", variety: "TD-5", modal_price: "5100", arrival_date: "30/01/2026" },
    { state: "Himachal Pradesh", district: "Shimla", market: "Shimla", commodity: "Apple", variety: "Royal Delicious", modal_price: "8500", arrival_date: "30/01/2026" },
    { state: "Haryana", district: "Karnal", market: "Karnal", commodity: "Basmati Rice", variety: "1121", modal_price: "4200", arrival_date: "30/01/2026" },
    { state: "Jharkhand", district: "Ranchi", market: "Ranchi", commodity: "Cauliflower", variety: "Local", modal_price: "1500", arrival_date: "30/01/2026" },
    { state: "Chhattisgarh", district: "Raipur", market: "Raipur", commodity: "Paddy", variety: "Common", modal_price: "2200", arrival_date: "30/01/2026" },
    { state: "Karnataka", district: "Hassan", market: "Hassan", commodity: "Coffee", variety: "Arabica", modal_price: "12000", arrival_date: "30/01/2026" },
    { state: "Karnataka", district: "Mysore", market: "Mysore", commodity: "Ragi", variety: "Local", modal_price: "2800", arrival_date: "30/01/2026" },
    { state: "Karnataka", district: "Shimoga", market: "Shimoga", commodity: "Arecanut", variety: "Bette", modal_price: "42000", arrival_date: "30/01/2026" },
    { state: "Kerala", district: "Idukki", market: "Kumily", commodity: "Cardamom", variety: "Small", modal_price: "150000", arrival_date: "30/01/2026" },
    { state: "Kerala", district: "Kottayam", market: "Kottayam", commodity: "Rubber", variety: "RSS-4", modal_price: "18000", arrival_date: "30/01/2026" },
    { state: "Punjab", district: "Patiala", market: "Patiala", commodity: "Mustard", variety: "Oil", modal_price: "5400", arrival_date: "30/01/2026" },
    { state: "Rajasthan", district: "Jodhpur", market: "Jodhpur", commodity: "Cumin Seed", variety: "Average", modal_price: "28000", arrival_date: "30/01/2026" },
   // Added variety for dashboard testing
   { state: "Karnataka", district: "Bangalore", market: "Binny Mill", commodity: "Beans", variety: "Green", modal_price: "3500", arrival_date: "30/01/2026" },
   { state: "Karnataka", district: "Bangalore", market: "Binny Mill", commodity: "Carrot", variety: "Ooty", modal_price: "4500", arrival_date: "30/01/2026" },
];

// Helper to format date as DD/MM/YYYY
const getFormattedDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [day, month, year].join('/');
}

app.get('/api/market-prices', async (req, res) => {
    try {
        const { limit = 100, date, state } = req.query;
        
        const params = {
            "api-key": API_KEY,
            "format": "json",
            "limit": limit
        };

        // If date is provided, use it. Otherwise, let API return default (usually latest).
        if (date) {
            params["filters[arrival_date]"] = date;
        }

        // Support state filter if provided
        if (state) {
            params["filters[state]"] = state;
        }

        // Added timeout to fail fast and switch to mock data
        let response = await axios.get(BASE_URL, { params, timeout: 5000 });
        
        // If API returns empty and we were looking for a specific date, maybe try fallback?
        // But if we didn't specify a date (fetching latest), and it's empty, then the API is truly empty.
        
        // Original Logic:
        // if ((!response.data.records || response.data.records.length === 0) && !date) { ... }
        
        // New Logic: Just return what we found. If the user didn't specify a date, we trust the API gave us the latest.
        
        res.json({
            success: true,
            records: response.data.records || [],
            source: date ? date : "latest-available"
        });

    } catch (error) {
        console.error("API Error:", error.message);
        console.log("Serving Mock Data due to API failure...");
        
        // Return Mock Data instead of failing
        res.json({
            success: true,
            records: MOCK_DATA,
            source: "mock-fallback"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
