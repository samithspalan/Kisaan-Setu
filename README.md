# KisanSetu 🌾
*A Digital Bridge Between Farmers and Markets*

---

## Problem Statement ID
**CS03AE**

---

## Team Name
**Stack OverLords**

---

## College Name
**Sahyadri College of Engineering and Management, Mangalore**

---

## Problem Statement

Farmers often lack access to real-time market intelligence and direct market access, which leads to dependency on intermediaries, delayed price information, and reduced profit margins. Market prices for agricultural produce vary frequently across regions and marketplaces, but farmers typically rely on outdated or informal sources to make selling decisions. This information gap prevents them from choosing the right market and negotiating fair prices.

Additionally, the absence of a unified digital platform limits farmers’ ability to connect directly with buyers, forcing them to depend on middlemen who control pricing and market access. This results in income instability, limited transparency, and reduced financial empowerment for farmers. Addressing these challenges requires a system that provides real-time market data, transparent price discovery, and direct access to markets, enabling farmers to make informed decisions and improve their economic outcomes.

---

## Proposed Solution

KisanSetu is a web-based platform designed to provide farmers with real-time market intelligence and direct access to buyers through a single unified system. The platform displays officially published crop prices across different regions, shows short-term price trends based on recent historical data, and presents buyer availability to help farmers understand current market conditions.

In addition to market insights, KisanSetu enables direct farmer-to-buyer interaction. Farmers can list their crops, view buyer interest, and negotiate prices directly without relying on intermediaries. The platform focuses on transparency and clarity, ensuring farmers have the information required to make independent and informed selling decisions.

---

## Innovation & Creativity

KisanSetu stands out by focusing on market intelligence and transparency rather than just displaying isolated price data. The platform aggregates official price information, visualizes short-term trends, and enables direct communication between farmers and buyers.

Key innovative aspects include:
- Short-term price trend analysis using recent historical data  
- Aggregation of official government market data across regions  
- Direct digital bridge between farmers and buyers  
- Transparent insights without black-box predictions or forced actions  
- Farmer-first design focused on clarity and trust  

This approach transforms KisanSetu into a market intelligence and access platform for farmers.

---

## Technical Complexity & Stack

### Programming Languages
- JavaScript

### Frameworks / Libraries
- React (Vite)
- Node.js
- Express.js
- Socket.IO (real-time chat)
- i18next (multi-language support)

### Databases
- MongoDB

### APIs / Data Sources
- Government of India **data.gov.in** API for official market price data  

### Tools & Platforms
- Git & GitHub  
- VS Code  
- Postman  

---

## Usability & Impact

### Users
- **Farmers:** View real-time prices, short-term trends, and connect directly with buyers  
- **Buyers:** Browse crop listings, view market prices, and negotiate directly with farmers  

### Impact
- Reduces dependency on middlemen  
- Improves price transparency and trust  
- Enables informed market decisions  
- Enhances income stability and financial empowerment for farmers  

---

## Setup Instructions

### Prerequisites
- Node.js  
- npm  
- MongoDB  
- Git  

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/samithspalan/Stack_Overlords.git
   cd Stack_Overlords
   ```

2. **Backend setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env   # fill in your own MongoDB URI, JWT secret, and API keys
   npm run dev            # http://localhost:5000
   ```

3. **Frontend setup:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env   # point at your backend origin if different from the default
   npm run dev            # http://localhost:5173
   ```

See [QUICK_START.md](QUICK_START.md) for a walkthrough and [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) for the full API reference.
