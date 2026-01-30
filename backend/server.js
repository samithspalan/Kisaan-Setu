import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import Price from './model/priceModel.js';
import { analyzeCropPrices, getAllCropsAnalysis } from './services/geminiService.js';

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
app.use('/api/auth', authRoutes);

const API_KEY = process.env.API_KEY || "579b464db66ec23bdd00000168192898a7804f5c78598b8f95b641a1";
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

const ALLOWED_CROPS = [
  "Tomato",
  "Onion",
  "Potato",
  "Paddy",
  "Wheat",
  "Maize",
  "Coconut",
  "Arecanut",
  "Banana",
  "Chilli",
  "Groundnut",
  "Sugarcane"
];

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

// Helper function to get last 5 days dates
const getLastNDaysDates = (n) => {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(getFormattedDate(date));
    }
    return dates;
};

// Route to fetch and store last 3 days of crop prices in database
app.post('/api/store-crop-prices', async (req, res) => {
    try {
        const lastNDates = getLastNDaysDates(3);
        console.log("Fetching prices for last 3 days:", lastNDates);

        let allPrices = [];
        let successCount = 0;
        let fetchDetails = [];

        // Fetch data for last 3 days
        for (const date of lastNDates) {
            try {
                const params = {
                    "api-key": API_KEY,
                    "format": "json",
                    "limit": 5000,
                    "filters[arrival_date]": date
                };

                const response = await axios.get(BASE_URL, { params, timeout: 10000 });
                if (response.data.records) {
                    const filteredRecords = response.data.records.filter(record => 
                        ALLOWED_CROPS.some(crop => 
                            record.commodity.toLowerCase().includes(crop.toLowerCase()) ||
                            record.commodity.toLowerCase().replace(/\s+/g, '').includes(crop.toLowerCase())
                        )
                    );
                    
                    allPrices.push(...filteredRecords);
                    successCount++;
                    
                    const cropBreakdown = {};
                    filteredRecords.forEach(r => {
                        cropBreakdown[r.commodity] = (cropBreakdown[r.commodity] || 0) + 1;
                    });
                    
                    fetchDetails.push({
                        date,
                        total: filteredRecords.length,
                        crops: cropBreakdown
                    });
                    
                    console.log(`✅ ${date}: ${filteredRecords.length} records`, cropBreakdown);
                }
            } catch (error) {
                console.error(`❌ Error fetching data for ${date}:`, error.message);
                fetchDetails.push({ date, error: error.message });
            }
        }

        if (allPrices.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No price data found for allowed crops in the last 3 days',
                fetchDetails
            });
        }

        // Prepare data for database insertion (convert string prices to numbers)
        const pricesForDB = allPrices.map(price => ({
            state: price.state,
            district: price.district,
            market: price.market,
            commodity: price.commodity,
            variety: price.variety || '',
            modal_price: parseInt(price.modal_price) || 0,
            min_price: price.min_price ? parseInt(price.min_price) : null,
            max_price: price.max_price ? parseInt(price.max_price) : null,
            arrival_date: price.arrival_date,
            created_at: new Date()
        }));

        // Clear existing prices and insert new ones
        await Price.deleteMany({});
        const insertedPrices = await Price.insertMany(pricesForDB);

        const cropCounts = {};
        insertedPrices.forEach(p => {
            cropCounts[p.commodity] = (cropCounts[p.commodity] || 0) + 1;
        });

        res.json({
            success: true,
            message: `Successfully stored ${insertedPrices.length} crop prices for last 3 days`,
            recordsStored: insertedPrices.length,
            daysProcessed: successCount,
            totalDays: 3,
            cropBreakdown: cropCounts,
            fetchDetails
        });

    } catch (error) {
        console.error("Error storing prices:", error.message);
        res.status(500).json({
            success: false,
            message: 'Error storing crop prices',
            error: error.message
        });
    }
});

// Route to get stored crop prices from database
app.get('/api/crop-prices', async (req, res) => {
    try {
        const { commodity, district, limit = 100 } = req.query;
        
        let query = {};
        if (commodity) query.commodity = { $regex: commodity, $options: 'i' };
        if (district) query.district = district;

        const prices = await Price.find(query).limit(parseInt(limit)).sort({ arrival_date: -1 });

        res.json({
            success: true,
            count: prices.length,
            records: prices
        });
    } catch (error) {
        console.error("Error fetching crop prices:", error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching crop prices',
            error: error.message
        });
    }
});

// Gemini AI Routes

// Get AI analysis for a specific crop
app.get('/api/ai/analyze/:commodity', async (req, res) => {
    try {
        const { commodity } = req.params;
        const analysis = await analyzeCropPrices(commodity);
        
        if (analysis.error) {
            return res.status(404).json({ success: false, error: analysis.error });
        }
        
        res.json({ success: true, data: analysis });
    } catch (error) {
        console.error("AI Analysis error:", error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get all crops ranked by demand with AI analysis
app.get('/api/ai/crop-rankings', async (req, res) => {
    try {
        const rankings = await getAllCropsAnalysis();
        res.json(rankings);
    } catch (error) {
        console.error("AI Ranking error:", error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
