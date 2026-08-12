require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.API_KEY;
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

const fs = require('fs');

async function checkKarnatakaData() {
    try {
        console.log("Checking API for Karnataka data (No Date Filter)...");
        const params = {
            "api-key": API_KEY,
            "format": "json",
            "limit": 500, // Increase limit to see more variety
            "filters[state]": "Karnataka"
        };

        const response = await axios.get(BASE_URL, { params, timeout: 10000 });
        
        if (response.data.records && response.data.records.length > 0) {
            console.log(`Found ${response.data.records.length} records for Karnataka.`);
            
            // Save to file
            const outputPath = 'karnataka_prices_dump.json';
            fs.writeFileSync(outputPath, JSON.stringify(response.data.records, null, 2));
            console.log(`Saved records to ${outputPath}`);

        } else {
            console.log("No records found for Karnataka.");
        }
    } catch (error) {
        console.error("API Request Failed:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

checkKarnatakaData();
