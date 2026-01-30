import { Sprout, Home, TrendingUp, Users, LogOut, Bell, User, Tractor, Newspaper } from 'lucide-react'
import { useState } from 'react'
import farmerBg from '../assets/farmerdashboard.png'

export default function FarmerDashboard() {
  const [selectedCrop, setSelectedCrop] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('mangalore')
  const [activeLink, setActiveLink] = useState('market-prices')

  // Dummy market prices data
  const marketPrices = [
    { id: 1, name: 'Coconut', price: '₹85/kg', market: 'Mangalore Market', updated: '2 hours ago', image: '🥥' },
    { id: 2, name: 'Arecanut', price: '₹180/kg', market: 'Udupi Market', updated: '3 hours ago', image: '🌰' },
    { id: 3, name: 'Paddy', price: '₹45/kg', market: 'Mangalore Market', updated: '1 hour ago', image: '🌾' },
    { id: 4, name: 'Cashew', price: '₹320/kg', market: 'Kannur Market', updated: '4 hours ago', image: '🥜' },
    { id: 5, name: 'Spices', price: '₹250/kg', market: 'Kochi Market', updated: '2 hours ago', image: '🌶️' },
    { id: 6, name: 'Vegetables', price: '₹35/kg', market: 'Mangalore Market', updated: '1 hour ago', image: '🥬' },
  ]

  // Dummy buyers data
  const buyers = [
    { id: 1, name: 'Agro Fresh Exports', requirement: 'Looking for 5 tons of Coconut', location: 'Mangalore' },
    { id: 2, name: 'Premium Foods Ltd', requirement: 'Need 2 tons of Arecanut (Grade A)', location: 'Udupi' },
    { id: 3, name: 'Market Hub Co.', requirement: 'Buying Paddy - 10 tons', location: 'Belgaum' },
    { id: 4, name: 'Spice King Industries', requirement: 'Urgent: 500kg Spices Mix', location: 'Kochi' },
    { id: 5, name: 'Cashew Processors', requirement: 'Regular supply of Cashew needed', location: 'Kannur' },
  ]

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 via-white to-green-50">
      {/* Logo - Fixed in top-left corner */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-2">
        <Sprout className="w-8 h-8 text-green-600" />
        <h1 className="text-2xl font-bold text-green-700">KisanSetu</h1>
      </div>

      {/* Navigation Bar - Centered at top, sticky, transparent */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-white/30 backdrop-blur-md rounded-full px-6 py-2 shadow-lg border border-white/20">
          <div className="flex gap-6 items-center">
            <a 
              href="#home" 
              onClick={() => setActiveLink('home')}
              className={`font-medium transition-all duration-300 px-3 py-2 rounded-lg ${
                activeLink === 'home' ? 'bg-green-600 text-white' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Home
            </a>
            <a 
              href="#" 
              onClick={() => setActiveLink('market-prices')}
              className={`font-medium transition-all duration-300 px-3 py-2 rounded-lg ${
                activeLink === 'market-prices' ? 'bg-green-600 text-white' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Market Prices
            </a>
            <a 
              href="#" 
              onClick={() => setActiveLink('buyers')}
              className={`font-medium transition-all duration-300 px-3 py-2 rounded-lg ${
                activeLink === 'buyers' ? 'bg-green-600 text-white' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Find Buyers
            </a>
            <a 
              href="#" 
              onClick={() => setActiveLink('listings')}
              className={`font-medium transition-all duration-300 px-3 py-2 rounded-lg ${
                activeLink === 'listings' ? 'bg-green-600 text-white' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              My Listings
            </a>
          </div>
        </div>
      </nav>

      {/* Top Spacing for fixed navbar */}
      <div className="h-20"></div>

      {/* Hero Section */}
      <section className="relative text-white py-12 overflow-hidden" style={{backgroundImage: `url(${farmerBg})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            Empowering Farmers with Real-Time Market Access
          </h2>
          <p className="text-lg md:text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Access real-time market prices, connect with buyers, and grow your farm business
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-white text-green-600 hover:bg-green-50 px-8 py-3 rounded-lg font-semibold transition">
              Check Prices
            </button>
            <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition">
              Find Buyers
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Market Prices */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Current Market Prices</h2>

              {/* Filters */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Crop</label>
                  <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)} className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-600 focus:outline-none">
                    <option value="all">All Crops</option>
                    <option value="coconut">Coconut</option>
                    <option value="arecanut">Arecanut</option>
                    <option value="paddy">Paddy</option>
                    <option value="cashew">Cashew</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Location</label>
                  <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-600 focus:outline-none">
                    <option value="mangalore">Mangalore</option>
                    <option value="udupi">Udupi</option>
                    <option value="belgaum">Belgaum</option>
                    <option value="kochi">Kochi</option>
                  </select>
                </div>
              </div>

              {/* Market Prices Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {marketPrices.map((crop) => (
                  <div key={crop.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="text-5xl mb-3">{crop.image}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{crop.name}</h3>
                    <div className="text-3xl font-bold text-green-600 mb-2">{crop.price}</div>
                    <div className="text-sm text-gray-600 mb-1">{crop.market}</div>
                    <div className="text-xs text-gray-500">Updated {crop.updated}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Buyers */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Buyers & Offers Near You</h2>

              <div className="space-y-4">
                {buyers.map((buyer) => (
                  <div key={buyer.id} className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 hover:shadow-md transition-all">
                    <h3 className="font-bold text-gray-900 mb-2">{buyer.name}</h3>
                    <p className="text-sm text-gray-700 mb-3">{buyer.requirement}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
                      <span>📍 {buyer.location}</span>
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <Tractor className="w-16 h-16" />
              <div>
                <h3 className="text-2xl font-bold mb-2">Post Your Produce</h3>
                <p className="text-green-100">List your crops for sale and reach buyers instantly</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-orange-600 text-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <Newspaper className="w-16 h-16" />
              <div>
                <h3 className="text-2xl font-bold mb-2">Market Trends & News</h3>
                <p className="text-orange-100">Stay updated with latest agricultural trends</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-linear-to-r from-green-700 to-emerald-700 text-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 KisanSetu. Empowering farmers, one connection at a time.</p>
        </div>
      </footer>
    </div>
  )
}
