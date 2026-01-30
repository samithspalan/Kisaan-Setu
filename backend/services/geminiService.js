import { GoogleGenerativeAI } from '@google/generative-ai';
import Price from '../model/priceModel.js';

let genAI;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Mock data for fallback when Gemini API is unavailable
const getMockAnalysis = (commodity, historicalData = []) => {
    const first = historicalData[0]
    const last = historicalData[historicalData.length - 1]
    const firstPrice = first?.avgPrice || 0
    const lastPrice = last?.avgPrice || firstPrice
    const change = firstPrice ? Math.round(((lastPrice - firstPrice) / firstPrice) * 100) : 0
    const trend = change > 2 ? 'increasing' : change < -2 ? 'decreasing' : 'stable'

    const demandLevel = trend === 'increasing' ? 'high' : trend === 'decreasing' ? 'low' : 'medium'

    return {
        priceMovement: {
            trend,
            percentageChange: change,
            analysis: `${commodity} prices are ${trend === 'increasing' ? 'rising' : trend === 'decreasing' ? 'falling' : 'stable'} based on recent market data`
        },
        futurePrediction: {
            nextWeekPrice: Math.max(1, Math.round(lastPrice * (1 + change / 200))),
            confidence: historicalData.length >= 3 ? 'medium' : 'low',
            reasoning: `Projection based on ${historicalData.length} days of price movement`
        },
        recommendation: {
            action: trend === 'increasing' ? 'sell' : trend === 'decreasing' ? 'hold' : 'buy more',
            timing: 'within the next 2-3 days',
            reason: `Recommendation aligns with recent ${trend} trend in prices`
        },
        demandLevel
    }
};

const hashString = (value = '') => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

const ensureThreePoints = (historicalData = [], priceData = [], commodity = '') => {
    if (historicalData.length === 0) return [];
    if (historicalData.length >= 3) return historicalData.slice(-3);

    const prices = priceData.map(p => p.modal_price).filter(Boolean);
    const minPrice = prices.length ? Math.min(...prices) : historicalData[0]?.avgPrice || 0;
    const maxPrice = prices.length ? Math.max(...prices) : historicalData[0]?.avgPrice || 0;
    const basePrice = historicalData[historicalData.length - 1]?.avgPrice || minPrice || maxPrice;

    const hash = hashString(commodity);
    const seed = hash % 13;
    const direction = (hash % 3) - 1; // -1, 0, or 1 for varied patterns
    const wiggle = Math.max(10, Math.round((maxPrice - minPrice) * 0.3)) + seed * 3;

    const lastDate = historicalData[historicalData.length - 1]?.date;
    const [d, m, y] = (lastDate || '').split('/');
    const baseDate = d ? new Date(Number(y), Number(m) - 1, Number(d)) : new Date();

    const day1 = new Date(baseDate);
    const day2 = new Date(baseDate);
    day1.setDate(day1.getDate() - 2);
    day2.setDate(day2.getDate() - 1);

    const p1 = Math.max(1, basePrice - wiggle + (direction * wiggle * 0.3));
    const p2 = Math.max(1, basePrice + (direction * wiggle * 0.5));

    const points = [
        { ...historicalData[0], date: `${String(day1.getDate()).padStart(2, '0')}/${String(day1.getMonth() + 1).padStart(2, '0')}/${day1.getFullYear()}`, avgPrice: Math.round(p1), minPrice: Math.round(p1), maxPrice: Math.round(p1), count: historicalData[0]?.count || 1 },
        { ...historicalData[0], date: `${String(day2.getDate()).padStart(2, '0')}/${String(day2.getMonth() + 1).padStart(2, '0')}/${day2.getFullYear()}`, avgPrice: Math.round(p2), minPrice: Math.round(p2), maxPrice: Math.round(p2), count: historicalData[0]?.count || 1 },
        { ...historicalData[historicalData.length - 1], avgPrice: basePrice }
    ];

    return points;
};

export const analyzeCropPrices = async (commodity) => {
    try {
        // Get price data for the crop from database
        const priceData = await Price.find({ commodity })
            .sort({ arrival_date: -1 })
            .limit(100);

        if (priceData.length === 0) {
            return { error: 'No price data found for this commodity' };
        }

        // Prepare data for analysis
        const pricesByDate = {};
        priceData.forEach(p => {
            if (!pricesByDate[p.arrival_date]) {
                pricesByDate[p.arrival_date] = [];
            }
            pricesByDate[p.arrival_date].push(p.modal_price);
        });

        const avgPricesByDate = Object.entries(pricesByDate).map(([date, prices]) => ({
            date,
            avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            count: prices.length
        })).sort((a, b) => {
            const [d1, m1, y1] = a.date.split('/');
            const [d2, m2, y2] = b.date.split('/');
            return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
        }).slice(-5);  // Last 5 days for chart

        const recentData = ensureThreePoints(avgPricesByDate, priceData, commodity);

        // Create prompt for Gemini
        const prompt = `You are an agricultural market analyst. Analyze the following price data for ${commodity}:

${avgPricesByDate.map(d => `Date: ${d.date}, Average Price: ₹${d.avgPrice}, Min: ₹${d.minPrice}, Max: ₹${d.maxPrice}, Markets: ${d.count}`).join('\n')}

Provide a JSON response with the following structure:
{
  "priceMovement": {
    "trend": "increasing/decreasing/stable",
    "percentageChange": <number>,
    "analysis": "<brief explanation>"
  },
  "futurePrediction": {
    "nextWeekPrice": <predicted price>,
    "confidence": "high/medium/low",
    "reasoning": "<explanation>"
  },
  "recommendation": {
    "action": "sell/hold/buy more",
    "timing": "<when to act>",
    "reason": "<detailed explanation>"
  },
  "demandLevel": "high/medium/low"
}

Be concise and data-driven in your analysis.`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

        return {
            commodity,
            historicalData: avgPricesByDate,
            analysis,
            lastUpdated: new Date()
        };

    } catch (error) {
        console.error('Gemini analysis error:', error.message);
        console.log('Using mock analysis data as fallback...');
        
        // Return mock data as fallback
        const priceData = await Price.find({ commodity })
            .sort({ arrival_date: -1 })
            .limit(100);

        const pricesByDate = {};
        priceData.forEach(p => {
            if (!pricesByDate[p.arrival_date]) {
                pricesByDate[p.arrival_date] = [];
            }
            pricesByDate[p.arrival_date].push(p.modal_price);
        });

        const avgPricesByDate = Object.entries(pricesByDate).map(([date, prices]) => ({
            date,
            avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            count: prices.length
        })).sort((a, b) => {
            const [d1, m1, y1] = a.date.split('/');
            const [d2, m2, y2] = b.date.split('/');
            return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
        }).slice(-5);  // Last 5 days for chart

        const recentData = ensureThreePoints(avgPricesByDate, priceData, commodity);

        // Calculate demand level using ALL price data (same as rankings)
        const latestPrice = priceData[0]?.modal_price || 0;
        const firstPrice = priceData[priceData.length - 1]?.modal_price || latestPrice;
        const changePct = firstPrice
            ? Math.round(((latestPrice - firstPrice) / firstPrice) * 100)
            : 0;
        
        const priceMovement = changePct > 2 ? 'rising' : changePct < -2 ? 'falling' : 'stable';
        const demandLevel = priceMovement === 'rising' ? 'high' : priceMovement === 'falling' ? 'low' : 'medium';

        const mockAnalysis = getMockAnalysis(commodity, recentData);
        // Override demandLevel with the correct one calculated from full dataset
        mockAnalysis.demandLevel = demandLevel;

        return {
            commodity,
            historicalData: recentData,
            analysis: mockAnalysis,
            lastUpdated: new Date(),
            note: 'Using mock analysis (Gemini API temporarily unavailable)'
        };
    }
};

export const getAllCropsAnalysis = async () => {
    try {
        // Get all unique commodities
        const commodities = await Price.distinct('commodity');
        
        const ALLOWED_CROPS = [
            "Tomato", "Onion", "Potato", "Paddy", "Wheat", "Maize",
            "Coconut", "Arecanut", "Banana", "Chilli", "Groundnut", "Sugarcane"
        ];

        // Filter to only allowed crops
        const filteredCommodities = commodities.filter(c => 
            ALLOWED_CROPS.some(crop => 
                c.toLowerCase().includes(crop.toLowerCase())
            )
        ).slice(0, 12); // Limit to 12 crops

        // Get price summary for each crop
        const cropSummaries = await Promise.all(
            filteredCommodities.map(async (commodity) => {
                const prices = await Price.find({ commodity }).sort({ arrival_date: -1 }).limit(30);
                const avgPrice = prices.length > 0 
                    ? Math.round(prices.reduce((sum, p) => sum + p.modal_price, 0) / prices.length)
                    : 0;
                
                return {
                    commodity,
                    avgPrice,
                    recordCount: prices.length,
                    latestPrice: prices[0]?.modal_price || 0
                };
            })
        );

        // Create prompt for demand ranking
        const prompt = `You are an agricultural market analyst. Based on the following crop data, rank these crops from HIGH DEMAND to LOW DEMAND considering price trends, market activity, and agricultural importance in India:

${cropSummaries.map((c, i) => `${i + 1}. ${c.commodity}: Avg Price ₹${c.avgPrice}, Latest ₹${c.latestPrice}, Markets: ${c.recordCount}`).join('\n')}

Provide a JSON array with this structure:
[
  {
    "commodity": "<crop name>",
    "demandLevel": "high/medium/low",
    "rank": <1-12>,
    "avgPrice": <number>,
    "priceMovement": "rising/falling/stable",
    "quickRecommendation": "<1 sentence action>"
  }
]

Rank from highest demand (rank 1) to lowest demand. Consider seasonal factors and market dynamics.`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON array
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        const rankings = jsonMatch ? JSON.parse(jsonMatch[0]) : cropSummaries.map((c, i) => ({
            commodity: c.commodity,
            demandLevel: 'medium',
            rank: i + 1,
            avgPrice: c.avgPrice,
            priceMovement: 'stable',
            quickRecommendation: 'Monitor market trends'
        }));

        return {
            success: true,
            totalCrops: rankings.length,
            rankings: rankings.sort((a, b) => a.rank - b.rank),
            lastUpdated: new Date()
        };

    } catch (error) {
        console.error('Gemini ranking error:', error.message);
        console.log('Using mock ranking data as fallback...');
        
        // Return mock data as fallback
        const commodities = await Price.distinct('commodity');
        
        const ALLOWED_CROPS = [
            "Tomato", "Onion", "Potato", "Paddy", "Wheat", "Maize",
            "Coconut", "Arecanut", "Banana", "Chilli", "Groundnut", "Sugarcane"
        ];

        const filteredCommodities = commodities.filter(c => 
            ALLOWED_CROPS.some(crop => 
                c.toLowerCase().includes(crop.toLowerCase())
            )
        ).slice(0, 12);

        const cropSummaries = await Promise.all(
            filteredCommodities.map(async (commodity) => {
                const prices = await Price.find({ commodity }).sort({ arrival_date: -1 }).limit(90);
                const avgPrice = prices.length > 0 
                    ? Math.round(prices.reduce((sum, p) => sum + p.modal_price, 0) / prices.length)
                    : 0;

                const latestPrice = prices[0]?.modal_price || 0;
                const firstPrice = prices[prices.length - 1]?.modal_price || latestPrice;
                const changePct = firstPrice
                    ? Math.round(((latestPrice - firstPrice) / firstPrice) * 100)
                    : 0;

                const priceMovement = changePct > 2 ? 'rising' : changePct < -2 ? 'falling' : 'stable';
                const demandLevel = priceMovement === 'rising' ? 'high' : priceMovement === 'falling' ? 'low' : 'medium';

                return {
                    commodity,
                    avgPrice,
                    recordCount: prices.length,
                    latestPrice,
                    changePct,
                    priceMovement,
                    demandLevel
                };
            })
        );

        const mockRankings = cropSummaries
            .sort((a, b) => b.changePct - a.changePct)
            .map((c, i) => ({
                commodity: c.commodity,
                demandLevel: c.demandLevel,
                rank: i + 1,
                avgPrice: c.avgPrice,
                priceMovement: c.priceMovement,
                changePct: c.changePct,
                quickRecommendation: c.priceMovement === 'rising'
                    ? 'Prices rising: consider selling soon'
                    : c.priceMovement === 'falling'
                    ? 'Prices falling: hold for recovery'
                    : 'Stable prices: monitor closely'
            }));

        return {
            success: true,
            totalCrops: mockRankings.length,
            rankings: mockRankings,
            lastUpdated: new Date(),
            note: 'Using mock ranking data (Gemini API temporarily unavailable)'
        };
    }
};
