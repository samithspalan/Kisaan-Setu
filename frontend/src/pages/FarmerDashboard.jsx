import { Sprout, Home, TrendingUp, Users, LogOut, Bell, User, Tractor, Newspaper, Filter, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function FarmerDashboard() {
  const [selectedCrop, setSelectedCrop] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [activeLink, setActiveLink] = useState('market-prices')
  const [marketPrices, setMarketPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [priceUnit, setPriceUnit] = useState('kg') // kg, quintal, ton

  // Fetch Data from Backend
  const fetchMarketData = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:5000/api/market-prices?limit=500')
      if (response.data.success) {
        setMarketPrices(response.data.records)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()
  }, [])

  // Helper: Get Unique values for filters
  const getUniqueValues = (key) => {
    return ['all', ...new Set(marketPrices.map(item => item[key]))].sort()
  }

  // Helper: Image Mapper
  const getCropImage = (cropName) => {
    const name = cropName.toLowerCase()
    if (name.includes('coconut')) return '/images/coconut.jpg'
    if (name.includes('paddy') || name.includes('rice')) return '/images/paddy.jpg'
    if (name.includes('arecanut')) return '/images/arecanut.jpg'
    if (name.includes('banana')) return '/images/banana.jpg'
    if (name.includes('pepper') || name.includes('chilli') || name.includes('spices')) return '/images/spices.jpg'
    if (name.includes('onion')) return '/images/onion.jpg'
    if (name.includes('potato')) return '/images/potato.jpg'
    if (name.includes('tomato')) return '/images/tomato.jpg'
    if (name.includes('cashew')) return '/images/cashew.jpg'
    return '/images/default.jpg'
  }

  // Helper: Price Converter
  const formatPrice = (price) => {
    const numPrice = parseFloat(price)
    if (isNaN(numPrice)) return 'N/A'

    // Base price is usually per Quintal (100kg)
    if (priceUnit === 'kg') return `₹${(numPrice / 100).toFixed(2)}/kg`
    if (priceUnit === 'quintal') return `₹${numPrice.toLocaleString()}/q`
    if (priceUnit === 'ton') return `₹${(numPrice * 10).toLocaleString()}/ton`
    return price
  }

  // Filter Logic
  const filteredPrices = marketPrices.filter(item => {
    const matchCrop = selectedCrop === 'all' || item.commodity === selectedCrop
    const matchLoc = selectedLocation === 'all' || item.district === selectedLocation
    return matchCrop && matchLoc
  })

  // Dummy buyers data (Unchanged)
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
      <section className="relative bg-linear-to-r from-green-600 to-emerald-600 text-white py-12">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2760%27%20height%3D%2760%27%20viewBox%3D%270%200%2060%2060%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cg%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%3E%3Cg%20fill%3D%27%23ffffff%27%20fill-opacity%3D%270.1%27%3E%3Cpath%20d%3D%27M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Current Market Prices</h2>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                   {['kg', 'quintal', 'ton'].map(unit => (
                     <button 
                       key={unit}
                       onClick={() => setPriceUnit(unit)}
                       className={`px-3 py-1 text-sm rounded-md capitalize transition-all ${priceUnit === unit ? 'bg-white shadow text-green-700 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                     >
                       /{unit}
                     </button>
                   ))}
                </div>
              </div>

              {/* Filters */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Crop</label>
                  <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)} className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-600 focus:outline-none">
                    {getUniqueValues('commodity').map(crop => (
                      <option key={crop} value={crop}>{crop === 'all' ? 'All Crops' : crop}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select District</label>
                  <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-600 focus:outline-none">
                     {getUniqueValues('district').map(loc => (
                      <option key={loc} value={loc}>{loc === 'all' ? 'All Locations' : loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Market Prices Grid */}
              <div className="grid md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {loading ? (
                    <div className="col-span-2 text-center py-10 text-gray-500">
                        <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-2 text-green-500"/>
                        Fetching latest prices from Mandi API...
                    </div>
                ) : filteredPrices.length > 0 ? (
                  filteredPrices.map((crop, index) => (
                    <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                      <div className="relative mb-3 h-32 w-full rounded-lg overflow-hidden bg-white shadow-sm">
                        <img 
                          src={getCropImage(crop.commodity)} 
                          alt={crop.commodity}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/default.jpg'; 
                          }}
                        />
                        <span className="absolute top-2 right-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full font-medium shadow-sm">{crop.variety}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{crop.commodity}</h3>
                      <div className="text-2xl font-bold text-green-700 mb-2">{formatPrice(crop.modal_price)}</div>
                      <div className="text-sm font-medium text-gray-700">📍 {crop.market}, {crop.district}</div>
                      <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Newspaper className="w-3 h-3" /> {crop.arrival_date}
                      </div>
                    </div>
                  ))
                ) : (
                    <div className="col-span-2 text-center py-10 text-gray-500">
                        No market data found for selected filters.
                    </div>
                )}
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
