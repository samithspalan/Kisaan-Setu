import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import listingsRoutes from './routes/listings.js';
import messagesRoutes from './routes/messages.js';
import Message from './model/Message.js';
import Price from './model/priceModel.js';
import { analyzeCropPrices, getAllCropsAnalysis } from './services/geminiService.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});
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

// Listings Routes
app.use('/api/listings', listingsRoutes);

// Messages Routes
app.use('/api/messages', messagesRoutes);

const API_KEY = process.env.API_KEY || "579b464db66ec23bdd00000168192898a7804f5c78598b8f95b641a1";
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

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

const parseArrivalDate = (dateStr) => {
    if (!dateStr) return null;
    const [dd, mm, yyyy] = dateStr.split('/').map(Number);
    if (!dd || !mm || !yyyy) return null;
    return new Date(yyyy, mm - 1, dd);
};

app.get('/api/market-prices', async (req, res) => {
    try {
        const { limit = 100, date, state } = req.query;
        const parsedLimit = Math.min(parseInt(limit, 10) || 100, 5000);
        
        const params = {
            "api-key": API_KEY,
            "format": "json",
            "limit": parsedLimit
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
        const fetchWithRetry = async (attempts = 2, customParams = params) => {
            let lastError;
            for (let i = 0; i < attempts; i++) {
                try {
                    return await axios.get(BASE_URL, { params: customParams, timeout: 30000 });
                } catch (error) {
                    lastError = error;
                }
            }
            throw lastError;
        };

        // If requesting a large limit, page through the API using offset
        if (!date && parsedLimit > 1000) {
            const pageSize = 1000;
            let offset = 0;
            let allRecords = [];

            while (allRecords.length < parsedLimit) {
                const pageParams = {
                    ...params,
                    limit: Math.min(pageSize, parsedLimit - allRecords.length),
                    offset
                };

                const response = await fetchWithRetry(2, pageParams);
                const records = response.data.records || [];
                if (records.length === 0) break;

                allRecords.push(...records);
                offset += records.length;
            }

            return res.json({
                success: true,
                records: allRecords,
                source: date ? date : "latest-available"
            });
        }

        const response = await fetchWithRetry();
        const apiRecords = response.data.records || [];

        // If API returns very few records, try database fallback
        if (!date && !state && apiRecords.length < parsedLimit) {
            try {
                const dbRecords = await Price.find().sort({ arrival_date: -1 }).limit(parsedLimit).lean();
                if (dbRecords.length > apiRecords.length) {
                    return res.json({
                        success: true,
                        records: dbRecords,
                        source: "database-fallback"
                    });
                }
            } catch (dbErr) {
                console.error("DB Error:", dbErr.message);
            }
        }

        res.json({
            success: true,
            records: apiRecords,
            source: date ? date : "latest-available"
        });

    } catch (error) {
        console.error("API Error:", error.message);

        // Try database fallback only (no mock data)
        try {
            const dbRecords = await Price.find().sort({ arrival_date: -1 }).limit(parsedLimit).lean();
            if (dbRecords.length > 0) {
                console.log(`Serving ${dbRecords.length} records from database`);
                return res.json({ success: true, records: dbRecords, source: "database-fallback" });
            }
        } catch (dbErr) {
            console.error("DB Error:", dbErr.message);
        }

        res.status(502).json({
            success: false,
            message: "Failed to fetch data from API and database is empty"
        });
    }
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

// Route to fetch and store last N days of crop prices in database
app.post('/api/store-crop-prices', async (req, res) => {
    try {
        const days = Math.min(parseInt(req.query.days, 10) || 6, 60);
        // Use last available dates from API (not calendar days)
        const availableDates = await (async () => {
            const params = { "api-key": API_KEY, "format": "json", "limit": 5000 };
            const response = await axios.get(BASE_URL, { params, timeout: 15000 });
            const records = response.data.records || [];
            const uniqueDates = Array.from(new Set(records.map(r => r.arrival_date).filter(Boolean)));
            uniqueDates.sort((a, b) => {
                const da = parseArrivalDate(a);
                const db = parseArrivalDate(b);
                return (db?.getTime() || 0) - (da?.getTime() || 0);
            });
            return uniqueDates.slice(0, days);
        })();

        const lastNDates = availableDates;
        console.log(`Fetching prices for last ${lastNDates.length} available dates:`, lastNDates);

        let allPrices = [];
        let successCount = 0;
        let fetchDetails = [];

        // Fetch data for last N days
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
                    allPrices.push(...response.data.records);
                    successCount++;
                    
                    const cropBreakdown = {};
                    response.data.records.forEach(r => {
                        cropBreakdown[r.commodity] = (cropBreakdown[r.commodity] || 0) + 1;
                    });
                    
                    fetchDetails.push({
                        date,
                        total: response.data.records.length,
                        crops: cropBreakdown
                    });
                    
                    console.log(`✅ ${date}: ${response.data.records.length} records`, cropBreakdown);
                }
            } catch (error) {
                console.error(`❌ Error fetching data for ${date}:`, error.message);
                fetchDetails.push({ date, error: error.message });
            }
        }

        if (allPrices.length === 0) {
            return res.status(400).json({
                success: false,
                message: `No price data found for the last ${days} days`,
                fetchDetails
            });
        }

        // Prepare data for database insertion (API records only)
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
            message: `Successfully stored ${insertedPrices.length} crop prices for last ${days} days`,
            recordsStored: insertedPrices.length,
            daysProcessed: successCount,
            totalDays: days,
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

// Socket.IO Real-time Messaging
const activeUsers = new Map(); // userId -> socketId mapping

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins - register their socket
  socket.on('join', (userId) => {
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Send message
  socket.on('send_message', async (data) => {
    const { senderId, receiverId, message, listingId } = data;
    const conversationId = [senderId, receiverId].sort().join('_');

    try {
      // Save to database
      const newMessage = new Message({
        conversationId,
        senderId,
        receiverId,
        listingId,
        message
      });

      await newMessage.save();
      await newMessage.populate('senderId', 'Username email');
      await newMessage.populate('receiverId', 'Username email');

      // Send to recipient if online
      const recipientSocket = activeUsers.get(receiverId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('receive_message', {
          _id: newMessage._id,
          senderId: newMessage.senderId,
          receiverId: newMessage.receiverId,
          message: newMessage.message,
          createdAt: newMessage.createdAt
        });
      }

      // Confirm to sender
      socket.emit('message_sent', {
        _id: newMessage._id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        message: newMessage.message,
        createdAt: newMessage.createdAt
      });
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('message_error', { error: error.message });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
