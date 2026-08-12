import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import listingsRoutes from './routes/listings.js';
import messagesRoutes from './routes/messages.js';
import Message from './model/Message.js';
import Price from './model/priceModel.js';
import User from './model/model.js';
import Listing from './model/Listing.js';
import cron from 'node-cron';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import isAuthenticated from './middleware/authMiddleware.js';
import { refreshPrices, pricesAreStale } from './services/priceRefresh.js';
import { analyzeCropPrices, getAllCropsAnalysis } from './services/geminiService.js';

dotenv.config();

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(name => !process.env[name]);
if (missingEnvVars.length > 0) {
    console.error(`FATAL: Missing required environment variable(s): ${missingEnvVars.join(', ')}. Check backend/.env (see .env.example).`);
    process.exit(1);
}

const app = express();
const httpServer = createServer(app);
// Allowed browser origins. Defaults to the local dev server only —
// production must set FRONTEND_ORIGIN explicitly rather than inheriting
// a hardcoded host, so a misconfigured deploy fails visibly instead of
// silently trusting someone else's domain.
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)

if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_ORIGIN) {
    console.warn('WARNING: FRONTEND_ORIGIN is not set in production. CORS will only allow http://localhost:5173, so the deployed frontend will be blocked.');
}

const io = new Server(httpServer, {
  cors: {
        origin: allowedOrigins,
    credentials: true
  }
});
const PORT = process.env.PORT || 5000;

app.use(cors({
        origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Baseline abuse protection across the whole API. Auth and AI routes add
// their own tighter limits on top of this.
app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please slow down.' },
}));

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

// Health check — used by the Render healthCheckPath so a failed DB
// connection surfaces as an unhealthy deploy instead of a running
// process serving errors.
app.get('/api/health', (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.status(dbConnected ? 200 : 503).json({
        status: dbConnected ? 'ok' : 'degraded',
        db: dbConnected ? 'connected' : 'disconnected',
        uptime: Math.round(process.uptime())
    });
});

/**
 * Real platform counts. These replace hardcoded marketing numbers that
 * previously claimed 6,080 farmers / 300 tons / 72 mandis with nothing
 * behind them. Every figure here is a live count — if it's zero, the
 * frontend hides the tile rather than showing an invented floor.
 * Cached briefly since it runs three counts and sits on the landing page.
 */
let statsCache = { data: null, at: 0 };
const STATS_TTL_MS = 5 * 60 * 1000;

app.get('/api/platform-stats', async (req, res) => {
    try {
        if (statsCache.data && Date.now() - statsCache.at < STATS_TTL_MS) {
            return res.json({ success: true, ...statsCache.data });
        }

        const [farmers, listings, latest] = await Promise.all([
            User.countDocuments({ role: 'farmer' }),
            Listing.countDocuments(),
            Price.findOne().sort({ arrival_date_iso: -1 }).select('arrival_date').lean()
        ]);

        const mandis = latest
            ? (await Price.distinct('market', { arrival_date: latest.arrival_date })).length
            : 0;

        const data = { farmers, listings, mandis, priceDate: latest?.arrival_date || null };
        statsCache = { data, at: Date.now() };
        res.json({ success: true, ...data });
    } catch (error) {
        console.error('Error building platform stats:', error.message);
        res.status(500).json({ success: false, message: 'Could not load platform stats' });
    }
});

if (!process.env.API_KEY) {
    console.warn('WARNING: API_KEY is not set. Scheduled price refresh from data.gov.in will be skipped.');
}

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Market prices — served entirely from MongoDB.
 *
 * This route used to call data.gov.in on every request (paging through
 * up to 5 sequential upstream calls at 30s timeout each), so one page
 * view could hang for minutes and traffic multiplied straight through to
 * the upstream feed. Ingestion now happens on a schedule in
 * services/priceRefresh.js and this only reads.
 */
app.get('/api/market-prices', async (req, res) => {
    try {
        const { date, state, commodity, district, page = 1 } = req.query;
        const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
        const skip = Math.max(parseInt(page, 10) - 1, 0) * limit;

        const query = {};
        if (date) query.arrival_date = date;
        if (state) query.state = state;
        if (district) query.district = district;
        if (commodity) query.commodity = { $regex: escapeRegex(commodity), $options: 'i' };

        const [records, total, newest] = await Promise.all([
            Price.find(query).sort({ arrival_date_iso: -1 }).skip(skip).limit(limit).lean(),
            Price.countDocuments(query),
            Price.findOne().sort({ refreshedAt: -1 }).select('refreshedAt arrival_date').lean(),
        ]);

        const lastRefreshedAt = newest?.refreshedAt || null;
        // Prices publish daily; flag anything older than a day so the UI
        // can say "showing saved prices from X" instead of implying live.
        const stale = lastRefreshedAt
            ? Date.now() - new Date(lastRefreshedAt).getTime() > 24 * 60 * 60 * 1000
            : true;

        res.json({
            success: true,
            records,
            total,
            page: Number(page),
            limit,
            arrival_date: newest?.arrival_date || null,
            lastRefreshedAt,
            stale,
            source: 'database',
        });
    } catch (error) {
        console.error('Error reading market prices:', error.message);
        res.status(500).json({ success: false, message: 'Could not load market prices' });
    }
});

// Maintenance-only price refresh. Not called by the frontend; the
// scheduled job below is the normal path. Gated behind a shared secret
// since it is not a farmer/customer action.
app.post('/api/store-crop-prices', async (req, res) => {
    if (!process.env.ADMIN_SECRET || req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
        const days = Math.min(parseInt(req.query.days, 10) || 3, 30);
        const result = await refreshPrices({ days });
        res.json({ success: result.ok, ...result });
    } catch (error) {
        console.error('Error refreshing prices:', error.message);
        res.status(500).json({ success: false, message: 'Could not refresh prices' });
    }
});

/**
 * Per-commodity price summary, aggregated in MongoDB.
 *
 * MarketAnalysis used to pull 5,000 raw rows and compute avg/min/max in
 * the browser — roughly a megabyte of JSON and a lot of work on a cheap
 * phone. This returns one row per commodity instead (~200 rows).
 */
app.get('/api/market-prices/summary', async (req, res) => {
    try {
        const newest = await Price.findOne().sort({ arrival_date_iso: -1 }).select('arrival_date_iso arrival_date').lean();
        if (!newest) {
            return res.json({ success: true, commodities: [], arrival_date: null });
        }

        const commodities = await Price.aggregate([
            { $match: { arrival_date_iso: newest.arrival_date_iso } },
            {
                $group: {
                    _id: '$commodity',
                    avgPrice: { $avg: '$modal_price' },
                    minPrice: { $min: { $ifNull: ['$min_price', '$modal_price'] } },
                    maxPrice: { $max: { $ifNull: ['$max_price', '$modal_price'] } },
                    marketCount: { $addToSet: '$market' },
                },
            },
            {
                $project: {
                    _id: 0,
                    commodity: '$_id',
                    avgPrice: { $round: ['$avgPrice', 0] },
                    minPrice: 1,
                    maxPrice: 1,
                    marketCount: { $size: '$marketCount' },
                },
            },
            { $sort: { avgPrice: -1 } },
        ]);

        res.json({
            success: true,
            commodities,
            arrival_date: newest.arrival_date,
        });
    } catch (error) {
        console.error('Error building price summary:', error.message);
        res.status(500).json({ success: false, message: 'Could not load price summary' });
    }
});

// Route to get stored crop prices from database
app.get('/api/crop-prices', async (req, res) => {
    try {
        const { commodity, district, limit = 100 } = req.query;

        let query = {};
        if (commodity) query.commodity = { $regex: escapeRegex(commodity), $options: 'i' };
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

/**
 * Gemini AI routes.
 *
 * These bill per call against the Gemini key, and were previously
 * unauthenticated and unthrottled — anyone could loop them and drain the
 * quota. Now: login required, per-user rate limit, and results cached by
 * (commodity, price date) since the underlying prices only change daily.
 */
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.userID || ipKeyGenerator(req),
    message: { success: false, message: 'Too many analysis requests. Try again later.' },
});

const aiCache = new Map();
const AI_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const cachedAnalysis = async (key, produce) => {
    const hit = aiCache.get(key);
    if (hit && Date.now() - hit.at < AI_CACHE_TTL_MS) return hit.value;
    const value = await produce();
    aiCache.set(key, { value, at: Date.now() });
    return value;
};

app.get('/api/ai/analyze/:commodity', isAuthenticated, aiLimiter, async (req, res) => {
    try {
        const { commodity } = req.params;
        const analysis = await cachedAnalysis(`analyze:${commodity}`, () => analyzeCropPrices(commodity));

        if (analysis.error) {
            return res.status(404).json({ success: false, error: analysis.error });
        }

        res.json({ success: true, data: analysis });
    } catch (error) {
        console.error('AI Analysis error:', error.message);
        res.status(500).json({ success: false, message: 'Analysis unavailable right now' });
    }
});

app.get('/api/ai/crop-rankings', isAuthenticated, aiLimiter, async (req, res) => {
    try {
        const rankings = await cachedAnalysis('rankings', () => getAllCropsAnalysis());
        res.json(rankings);
    } catch (error) {
        console.error('AI Ranking error:', error.message);
        res.status(500).json({ success: false, message: 'Rankings unavailable right now' });
    }
});

// Socket.IO Real-time Messaging
const activeUsers = new Map(); // userId -> socketId mapping

// Auth handshake: read the same httpOnly cookie the REST API uses, verify
// it, and trust socket.userId from then on — never the client payload.
// Without this, any connected client could set senderId to any user's id.
const parseCookies = (header = '') =>
  Object.fromEntries(header.split(';').map(pair => {
    const idx = pair.indexOf('=')
    if (idx === -1) return [pair.trim(), '']
    return [pair.slice(0, idx).trim(), decodeURIComponent(pair.slice(idx + 1).trim())]
  }).filter(([key]) => key))

io.use((socket, next) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie)
    const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET)
    socket.userId = decoded.id
    next()
  } catch {
    next(new Error('Authentication required'))
  }
})

io.on('connection', (socket) => {
  // Register the authenticated user's socket — ignore any userId the
  // client tries to pass, the handshake already established identity.
  socket.on('join', () => {
    activeUsers.set(socket.userId.toString(), socket.id);
  });

  // Send message
  socket.on('send_message', async (data) => {
    const senderId = socket.userId;
    const { receiverId, message, listingId } = data;
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
      const recipientSocket = activeUsers.get(receiverId.toString());
      if (recipientSocket) {
        io.to(recipientSocket).emit('receive_message', newMessage);
        io.to(recipientSocket).emit('conversation_updated');
      }

      // Confirm to sender and signal conversation update
      socket.emit('message_sent', newMessage);
      socket.emit('conversation_updated');
    } catch (error) {
      console.error('Error saving message:', error.message);
      socket.emit('message_error', { error: error.message });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
  });
});

// Fallback JSON 404 for any unmatched endpoint
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Final error handler to keep all responses JSON-formatted
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

/**
 * Scheduled price ingestion. Runs every 6 hours, plus once shortly after
 * boot — but only if the stored data is already stale, so restarts and
 * redeploys don't re-hammer data.gov.in. Set PRICE_REFRESH_ENABLED=false
 * to disable (useful when running multiple instances, where only one
 * should own ingestion).
 */
const priceRefreshEnabled = process.env.PRICE_REFRESH_ENABLED !== 'false';

const runRefresh = async (reason) => {
    if (!process.env.API_KEY) return;
    try {
        const result = await refreshPrices({ days: 3 });
        console.log(`[prices] refresh (${reason}):`, result.ok
            ? `${result.upserted} rows in ${result.durationMs}ms`
            : `skipped — ${result.reason}`);
    } catch (error) {
        console.error(`[prices] refresh (${reason}) failed:`, error.message);
    }
};

if (priceRefreshEnabled) {
    cron.schedule('0 */6 * * *', () => runRefresh('scheduled'));

    setTimeout(async () => {
        try {
            if (await pricesAreStale(6)) await runRefresh('boot');
            else console.log('[prices] fresh enough at boot, skipping refresh');
        } catch (error) {
            console.error('[prices] boot staleness check failed:', error.message);
        }
    }, 5000);
}

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
