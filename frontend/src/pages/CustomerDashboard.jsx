import { useState, useEffect } from 'react'
import { Sprout, LogOut, Search, MapPin, Phone, Mail, Home, Heart, ShoppingCart, Settings, Sun, Moon, Menu, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import FarmerLocationMap from '../components/FarmerLocationMap'

export default function CustomerDashboard({ onNavigate, onLogout }) {
  const { isDark, toggleTheme } = useTheme()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const [showMenu, setShowMenu] = useState(false)
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showLocationMap, setShowLocationMap] = useState(false)
  const [selectedFarmerForMap, setSelectedFarmerForMap] = useState(null)

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem('userId')
        const userName = localStorage.getItem('userName')
        const userData = { name: userName || 'Customer', email: 'customer@example.com', id: userId }
        setUser(userData)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    fetchUser()
  }, [])

  // Fetch farmers/sellers data from backend listings
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      try {
        const response = await axios.get('http://localhost:8000/api/listings/all', {
          withCredentials: true
        })
        
        if (response.data.success && response.data.listings) {
          // Transform listings data to display format with farmer info
          const transformedData = response.data.listings.map(listing => ({
            id: listing._id,
            name: listing.farmerId?.Username || listing.farmerId?._id || 'Unknown Farmer',
            location: listing.location || 'Not specified',
            crops: [listing.commodity, listing.variety].filter(Boolean),
            expectedPrice: listing.expectedPrice,
            quantity: listing.quantity,
            unit: listing.unit,
            description: listing.description,
            farmerId: listing.farmerId?._id,
            commodity: listing.commodity,
            createdAt: listing.createdAt
          }))
          
          // Fetch real market prices from API for each unique commodity
          const uniqueCommodities = [...new Set(transformedData.map(l => l.commodity))]
          const marketPrices = {}
          
          await Promise.all(
            uniqueCommodities.map(async (commodity) => {
              try {
                const apiResponse = await fetch(
                  `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd00000168192898a7804f5c78598b8f95b641a1&format=json&filters[commodity]=${encodeURIComponent(commodity)}&limit=50`
                )
                const apiData = await apiResponse.json()
                
                if (apiData.records && apiData.records.length > 0) {
                  // Calculate average modal price from API data
                  const prices = apiData.records
                    .map(r => parseFloat(r.modal_price))
                    .filter(p => !isNaN(p) && p > 0)
                  
                  if (prices.length > 0) {
                    marketPrices[commodity] = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
                  }
                }
              } catch (error) {
                console.error(`Error fetching market price for ${commodity}:`, error)
              }
            })
          )
          
          // Add market average price to each listing
          const dataWithAvgPrice = transformedData.map(listing => ({
            ...listing,
            avgMarketPrice: marketPrices[listing.commodity] || listing.expectedPrice
          }))
          
          setFarmers(dataWithAvgPrice)
        }
      } catch (error) {
        console.error('Error fetching listings:', error)
        // Fallback to empty state if backend fails
        setFarmers([])
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [])

  const handleLogout = async () => {
    await onLogout()
  }

  const handleMessageClick = (farmer) => {
    // Store selected farmer info in localStorage for chats page
    localStorage.setItem('selectedChatFarmer', JSON.stringify({
      id: farmer.farmerId,
      name: farmer.name,
      location: farmer.location
    }))
    // Navigate to chats page
    if (onNavigate) {
      onNavigate('chats')
    }
  }

  const handleViewLocation = (farmer) => {
    setSelectedFarmerForMap(farmer)
    setShowLocationMap(true)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-linear-to-b from-teal-50 via-white to-teal-50'}`}>
      {/* Logo */}
      <div className="fixed top-6 left-6 z-40 flex items-center gap-2">
        <Sprout className="w-8 h-8 text-teal-600" />
        <div>
          <h1 className={`text-xl font-bold leading-none transition-colors duration-300 ${
            isDark ? 'text-slate-100' : 'text-teal-950'
          }`}>KisanSetu</h1>
          <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors duration-300 ${
            isDark ? 'text-teal-400' : 'text-teal-600'
          }`}>Customer</span>
        </div>
      </div>

      {/* Navigation Bar - Centered at top, floating */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-40 w-auto max-w-[90%] flex items-center gap-4">
        <div className={`backdrop-blur-2xl rounded-full px-2 py-1.5 shadow-2xl transition-colors duration-300 ${
          isDark
            ? 'bg-linear-to-r from-slate-800/40 via-slate-700/30 to-slate-800/40 border border-slate-600/30'
            : 'bg-linear-to-r from-teal-50/20 via-white/10 to-teal-50/20 border border-teal-200/30'
        }`}>
          <div className="flex gap-1 items-center">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'chats', label: 'Chats', icon: Mail },
              { id: 'theme', label: '', icon: isDark ? Sun : Moon, isButton: true },
              { id: 'logout', label: 'Logout', icon: LogOut, isButton: true }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'theme') {
                    toggleTheme()
                  } else if (item.id === 'logout') {
                    handleLogout()
                  } else if (item.id === 'chats' && onNavigate) {
                    onNavigate('chats')
                  } else {
                    setActiveTab(item.id)
                  }
                }}
                className={`flex items-center gap-2 font-semibold transition-all duration-300 px-6 py-3.5 rounded-full text-sm ${
                  !item.isButton && activeTab === item.id
                    ? isDark
                      ? 'bg-linear-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-600/40'
                      : 'bg-linear-to-r from-teal-500 to-teal-400 text-white shadow-lg shadow-teal-500/40'
                    : !item.isButton && activeTab !== item.id
                    ? isDark
                      ? 'text-slate-300 hover:text-teal-400 hover:bg-slate-700/30'
                      : 'text-slate-600 hover:text-teal-600 hover:bg-white/30'
                    : item.id === 'theme'
                    ? isDark
                      ? 'text-yellow-400 hover:text-yellow-300 hover:bg-slate-700/30'
                      : 'text-amber-500 hover:text-amber-600 hover:bg-white/30'
                    : item.id === 'logout'
                    ? isDark
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50/30'
                    : ''
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label && item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Search & Filter */}
        <div className={`mb-8 p-6 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-4 top-3.5 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                placeholder="Search farmers or crops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all ${
                  isDark
                    ? 'bg-slate-700 border-0 text-slate-100 placeholder-slate-400 focus:border-2 focus:border-teal-600'
                    : 'bg-slate-50 border-0 text-slate-900 placeholder-slate-500 focus:border-2 focus:border-teal-600'
                }`}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all border-0 ${
                isDark
                  ? 'bg-slate-700 text-slate-100 focus:border-2 focus:border-teal-600'
                  : 'bg-slate-50 text-slate-900 focus:border-2 focus:border-teal-600'
              }`}
            >
              <option value="all">All Categories</option>
              <option value="vegetables">Vegetables</option>
              <option value="grains">Grains</option>
              <option value="fruits">Fruits</option>
              <option value="organic">Organic</option>
            </select>
          </div>
        </div>

        {/* Farmers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
            </div>
          ) : farmers.length > 0 ? (
            farmers.map(farmer => (
              <div
                key={farmer.id}
                className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                  isDark ? 'bg-slate-800' : 'bg-white'
                }`}
              >
                {/* Card Header with gradient */}
                <div className={`h-24 bg-linear-to-r from-teal-400 to-teal-600 relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute w-32 h-32 bg-white rounded-full -top-8 -right-8"></div>
                    <div className="absolute w-24 h-24 bg-white rounded-full -bottom-4 -left-4"></div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Farmer Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{farmer.name}</h3>
                      </div>
                    </div>
                    <button className={`p-2.5 rounded-full transition-all ${
                      isDark 
                        ? 'bg-slate-700 hover:bg-red-900/30 text-red-400' 
                        : 'bg-red-50 hover:bg-red-100 text-red-500'
                    }`}>
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  {/* Divider */}
                  <div className={`h-px my-4 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

                  {/* Location & Crops */}
                  <div className={`space-y-3 mb-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-teal-100'}`}>
                        <MapPin className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold opacity-70">Location</p>
                        <p className="font-medium">{farmer.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-teal-100'}`}>
                        <ShoppingCart className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold opacity-70">Specialties</p>
                        <p className="font-medium text-sm">{farmer.crops.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className={`h-px my-5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

                  {/* Price Information */}
                  <div className="mb-5">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Farmer's Price */}
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-gradient-to-br from-teal-50 to-emerald-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-teal-400' : 'bg-teal-600'}`}></div>
                          <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Sell Price
                          </p>
                        </div>
                        <p className={`text-2xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                          ₹{farmer.expectedPrice}
                          <span className={`text-sm font-normal ml-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            /{farmer.unit}
                          </span>
                        </p>
                      </div>

                      {/* Market Average Price */}
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-gradient-to-br from-orange-50 to-amber-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-orange-400' : 'bg-orange-600'}`}></div>
                          <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Market Avg
                          </p>
                        </div>
                        <p className={`text-2xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                          ₹{farmer.avgMarketPrice}
                          <span className={`text-sm font-normal ml-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            /{farmer.unit}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Price Comparison Badge */}
                    {farmer.expectedPrice < farmer.avgMarketPrice && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <div className={`px-3 py-1.5 rounded-full font-semibold ${
                          isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                        }`}>
                          💰 {Math.round(((farmer.avgMarketPrice - farmer.expectedPrice) / farmer.avgMarketPrice) * 100)}% Below Market Average
                        </div>
                      </div>
                    )}
                    {farmer.expectedPrice > farmer.avgMarketPrice && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <div className={`px-3 py-1.5 rounded-full font-semibold ${
                          isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
                        }`}>
                          📈 {Math.round(((farmer.expectedPrice - farmer.avgMarketPrice) / farmer.avgMarketPrice) * 100)}% Above Market Average
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleMessageClick(farmer)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Message
                    </button>
                    <button 
                      onClick={() => handleViewLocation(farmer)}
                      className={`w-full font-semibold py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                        isDark
                          ? 'bg-slate-700 hover:bg-slate-600 text-teal-400'
                          : 'bg-teal-100 hover:bg-teal-200 text-teal-700'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      Location
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>No farmers found</p>
            </div>
          )}
        </div>
      </div>

      {/* Location Map Modal */}
      {showLocationMap && selectedFarmerForMap && (
        <FarmerLocationMap
          farmerLocation={selectedFarmerForMap.location}
          farmerName={selectedFarmerForMap.name}
          onClose={() => {
            setShowLocationMap(false)
            setSelectedFarmerForMap(null)
          }}
          isDark={isDark}
        />
      )}
    </div>
  )
}
