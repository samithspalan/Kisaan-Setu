const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const API_KEY = "579b464db66ec23bdd00000168192898a7804f5c78598b8f95b641a1";
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

app.get('/api/market-prices', async (req, res) => {
    try {
        const { limit = 100, date } = req.query;
        
        let targetDate = date;
        if (!targetDate) {
            targetDate = getFormattedDate(new Date());
        }

        const params = {
            "api-key": API_KEY,
            "format": "json",
            "limit": limit,
            "filters[arrival_date]": targetDate
        };

        let response = await axios.get(BASE_URL, { params });
        
        // Fallback logic for today (if empty, try yesterday)
        if ((!response.data.records || response.data.records.length === 0) && !date) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            params["filters[arrival_date]"] = getFormattedDate(yesterday);
            response = await axios.get(BASE_URL, { params });
        }

        res.json({
            success: true,
            records: response.data.records || [],
            source: params["filters[arrival_date]"]
        });

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch market data" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
