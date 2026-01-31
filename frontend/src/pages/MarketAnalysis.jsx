import { useState, useEffect } from 'react'
import axios from 'axios'
import { ArrowLeft, TrendingUp, TrendingDown, Search, Zap, Leaf, Filter, AlertCircle, Sun, Moon, Home, BarChart3, Bell, Store, LogOut } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useTheme } from '../context/ThemeContext'

export default function MarketAnalysis({ onBack, onNavigate }) {
  const { isDark, toggleTheme } = useTheme()
  const [activeLink, setActiveLink] = useState('market-prices')
  const [marketPrices, setMarketPrices] = useState([])
  const [crops, setCrops] = useState([])
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [selectedCropDemand, setSelectedCropDemand] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('price-high')
  const [searchTerm, setSearchTerm] = useState('')
  const [cropAnalysis, setCropAnalysis] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  // Fetch market data from database
  useEffect(() => {
    fetchMarketData()
  }, [])

  const fetchMarketData = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:8000/api/market-prices?limit=500')
      if (response.data.success) {
        setMarketPrices(response.data.records)
        // Process crops from market data
        processCropsFromMarketData(response.data.records)
      }
    } catch (error) {
      console.error('Error fetching market data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Process unique commodities from market data with price stats
  const processCropsFromMarketData = (data) => {
    const commodityMap = {}

    data.forEach(item => {
      if (!commodityMap[item.commodity]) {
        commodityMap[item.commodity] = {
          commodity: item.commodity,
          prices: [],
          districts: new Set()
        }
      }
      commodityMap[item.commodity].prices.push(parseFloat(item.modal_price) || 0)
      commodityMap[item.commodity].districts.add(item.district)
    })

    const processedCrops = Object.values(commodityMap).map(item => {
      const prices = item.prices.filter(p => p > 0)
      const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b) / prices.length) : 0
      const minPrice = prices.length ? Math.min(...prices) : 0
      const maxPrice = prices.length ? Math.max(...prices) : 0
      const changePct = minPrice > 0 ? ((maxPrice - minPrice) / minPrice * 100).toFixed(2) : 0

      return {
        commodity: item.commodity,
        avgPrice,
        minPrice,
        maxPrice,
        changePct: parseFloat(changePct),
        priceMovement: changePct > 5 ? 'rising' : changePct < -5 ? 'falling' : 'stable',
        demandLevel: changePct > 10 ? 'high' : changePct > 5 ? 'medium' : 'low',
        quickRecommendation: `Available in ${item.districts.size} markets. Price range: ₹${minPrice}-₹${maxPrice}`,
        marketCount: item.districts.size
      }
    })

    setCrops(processedCrops)
  }

  const fetchCropAnalysis = async (commodity) => {
    setAnalysisLoading(true)
    try {
      const response = await axios.get(`http://localhost:8000/api/ai/analyze/${commodity}`)
      if (response.data.success) {
        console.log('🔍 Crop Analysis Data:', response.data.data)
        console.log('🎯 Demand Level:', response.data.data?.analysis?.demandLevel)
        setCropAnalysis(response.data.data)
        setSelectedCrop(commodity)
      }
    } catch (error) {
      console.error('Error fetching crop analysis:', error)
    } finally {
      setAnalysisLoading(false)
    }
  }

  // Sort and filter logic
  const filteredCrops = crops
    .filter(crop => 
      crop.commodity.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-high') {
        return b.avgPrice - a.avgPrice
      } else if (sortBy === 'price-low') {
        return a.avgPrice - b.avgPrice
      } else if (sortBy === 'volatility-high') {
        return b.changePct - a.changePct
      }
      return 0
    })

  const formatDate = (dateObj) => {
    const dd = String(dateObj.getDate()).padStart(2, '0')
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const yyyy = dateObj.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  const buildChartData = (historicalData = []) => {
    // If we have real historical data, use it
    if (historicalData && historicalData.length > 0) {
      return historicalData.map(data => ({
        date: data.date,
        price: data.avgPrice || data.price
      }))
    }

    // Generate sample data based on current crop price
    const crop = crops.find(c => c.commodity === selectedCrop)
    if (!crop) return []

    const basePrice = crop.avgPrice || 100
    const data = []
    const today = new Date()

    for (let i = 4; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const variance = (Math.random() - 0.5) * basePrice * 0.1
      data.push({
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        price: Math.round(basePrice + variance)
      })
    }

    return data
  }

  // Chart data from historical data
  const chartData = buildChartData(cropAnalysis?.historicalData || [])
  
  // Debug log
  useEffect(() => {
    console.log('📊 Chart Data Debug:')
    console.log('  - cropAnalysis:', cropAnalysis)
    console.log('  - historicalData:', cropAnalysis?.historicalData)
    console.log('  - chartData:', chartData)
    console.log('  - chartData.length:', chartData?.length)
  }, [chartData, cropAnalysis])

  // Determine trend color based on demand level from crop list
  const getTrendColor = () => {
    const demandLevel = selectedCropDemand?.toLowerCase()
    console.log('🎨 getTrendColor called')
    console.log('  - Selected Crop Demand:', selectedCropDemand)
    console.log('  - Lowercase:', demandLevel)
    console.log('  - Is "low"?:', demandLevel === 'low')
    console.log('  - Is "high"?:', demandLevel === 'high')
    
    if (demandLevel === 'high') {
      console.log('  ✅ Returning GREEN')
      return '#22c55e'
    }
    if (demandLevel === 'low') {
      console.log('  ✅ Returning RED')
      return '#ef4444'
    }
    console.log('  ✅ Returning BLUE (medium/default)')
    return '#3b82f6'
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Logo - Fixed in top-left corner */}
      <div className={`fixed top-6 left-6 z-50 flex items-center gap-3 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border transition-colors duration-300 ${
        isDark
          ? 'bg-slate-800/90 border-slate-700'
          : 'bg-white/90 border-emerald-100/50'
      }`}>
        <div className={`p-2 rounded-xl transition-colors duration-300 ${
          isDark ? 'bg-emerald-900/50' : 'bg-emerald-100'
        }`}>
          <Leaf className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
           <h1 className={`text-xl font-bold leading-none transition-colors duration-300 ${
             isDark ? 'text-slate-100' : 'text-emerald-950'
           }`}>KisanSetu</h1>
           <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors duration-300 ${
             isDark ? 'text-emerald-400' : 'text-emerald-600'
           }`}>Farmer Connect</span>
        </div>
      </div>

      {/* Navigation Bar - Centered at top, sticky */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-40 w-auto max-w-[90%] flex items-center gap-4">
        <div className={`backdrop-blur-xl rounded-2xl px-2 py-2 shadow-xl shadow-emerald-900/5 border transition-colors duration-300 ${
          isDark
            ? 'bg-slate-800/80 border-slate-700/50 ring-1 ring-black/20'
            : 'bg-white/80 border-white/50 ring-1 ring-black/5'
        }`}>
          <div className="flex gap-1 items-center">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'market-prices', label: 'Market Prices', icon: BarChart3 },
              { id: 'chats', label: 'Chats', icon: Bell },
              { id: 'listings', label: 'My Listings', icon: Store }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => {
                  if (item.id === 'home' && onNavigate) {
                    onNavigate('farmer-dashboard')
                  } else if (item.id === 'market-prices') {
                    setActiveLink(item.id)
                  } else if (item.id === 'chats' && onNavigate) {
                    onNavigate('chats')
                  } else if (item.id === 'listings' && onNavigate) {
                    onNavigate('my-listings')
                  }
                }}
                className={`flex items-center gap-2 font-semibold transition-all duration-300 px-5 py-2.5 rounded-xl text-sm ${
                  activeLink === item.id 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                    : isDark
                      ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80'
                }`}
              >
                <item.icon className={`w-4 h-4 ${activeLink === item.id ? 'text-emerald-100' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                {item.label}
              </button>
            ))}
            <div className={`w-px h-8 transition-colors duration-300 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                isDark
                  ? 'text-yellow-400 hover:bg-slate-700/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <a 
               href="#"
               title="Logout"
               className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                 isDark
                   ? 'text-slate-500 hover:text-red-400 hover:bg-red-950/30'
                   : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
               }`}
            >
               <LogOut className="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>

      {/* Top Spacing for fixed navbar */}
      <div className="h-28"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-4xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Market Trend Analysis</h1>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-4 top-3.5 w-5 h-5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search crop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Sort - High Price */}
          <button
            onClick={() => setSortBy('price-high')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
              sortBy === 'price-high'
                ? isDark ? 'bg-emerald-600 text-white shadow-lg' : 'bg-green-600 text-white shadow-lg'
                : isDark ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-green-50'
            }`}
          >
            <TrendingUp className="w-5 h-5" /> High Price
          </button>

          {/* Sort - High Volatility */}
          <button
            onClick={() => setSortBy('volatility-high')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
              sortBy === 'volatility-high'
                ? isDark ? 'bg-amber-600 text-white shadow-lg' : 'bg-amber-600 text-white shadow-lg'
                : isDark ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50'
            }`}
          >
            <Zap className="w-5 h-5" /> High Volatility
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-8 pb-12">
        {/* Left - Crop List */}
        <div className="lg:col-span-1">
          <div className={`rounded-2xl shadow-lg overflow-hidden sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto transition-colors border ${
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-100'
          }`}>
            <div className={`bg-linear-to-r px-6 py-4 ${
              isDark
                ? 'from-emerald-900 to-teal-900'
                : 'from-green-600 to-emerald-600'
            }`}>
              <h2 className="text-lg font-bold text-white">All Commodities ({crops.length})</h2>
            </div>

            <div className={`divide-y ${isDark ? 'divide-slate-700' : ''}`}>
              {loading ? (
                <div className={`p-8 text-center ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Loading crops...</div>
              ) : filteredCrops.length === 0 ? (
                <div className={`p-8 text-center ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>No crops found</div>
              ) : (
                filteredCrops.map((crop) => (
                  <button
                    key={crop.commodity}
                    onClick={() => {
                      setSelectedCrop(crop.commodity)
                      setSelectedCropDemand(crop.demandLevel)
                      setCropAnalysis(null)
                      fetchCropAnalysis(crop.commodity)
                    }}
                    className={`w-full text-left p-4 transition-all border-l-4 ${
                      selectedCrop === crop.commodity
                        ? isDark ? 'bg-slate-700 border-l-emerald-400' : 'bg-green-50 border-l-green-600'
                        : isDark ? 'hover:bg-slate-700 border-l-transparent' : 'hover:bg-green-50 border-l-transparent hover:border-l-green-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{crop.commodity}</h3>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          crop.demandLevel === 'high'
                            ? 'bg-green-100 text-green-700'
                            : crop.demandLevel === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {crop.demandLevel?.toUpperCase()}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{crop.quickRecommendation}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>₹{crop.avgPrice}</span>
                      <span className={`font-bold ${crop.priceMovement === 'rising' ? 'text-green-600' : crop.priceMovement === 'falling' ? 'text-red-600' : 'text-slate-600'}`}>
                        {crop.priceMovement === 'rising' ? '↑' : crop.priceMovement === 'falling' ? '↓' : '→'} {Math.abs(crop.changePct || 0)}%
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right - Analysis */}
        <div className="lg:col-span-2">
          {selectedCrop === null ? (
            <div className={`rounded-2xl shadow-lg p-12 text-center border-2 border-dashed transition-colors ${
              isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            }`}>
              <Leaf className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`font-semibold text-lg mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Select a crop to view detailed analysis</p>
              <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>Choose from the list on the left to see price trends and market data</p>
            </div>
          ) : analysisLoading ? (
            <div className={`rounded-2xl shadow-lg p-12 text-center transition-colors ${
              isDark ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="inline-block relative w-12 h-12 mb-4">
                <div className={`absolute inset-0 border-4 rounded-full ${isDark ? 'border-slate-600' : 'border-green-100'}`}></div>
                <div className={`absolute inset-0 border-4 rounded-full border-t-transparent animate-spin ${isDark ? 'border-emerald-400' : 'border-green-500'}`}></div>
              </div>
              <p className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Analyzing {selectedCrop}...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Title with % change */}
              <div className={`rounded-2xl p-6 border transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-linear-to-r from-green-50 to-emerald-50 border-green-100'
              }`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-3xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{selectedCrop}</h2>
                  <div className="text-right">
                    <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Price Volatility</p>
                    <p className={`text-3xl font-bold ${
                      cropAnalysis?.analysis?.priceMovement?.percentageChange > 5 ? 'text-green-600' :
                      cropAnalysis?.analysis?.priceMovement?.percentageChange < -5 ? 'text-red-600' :
                      'text-slate-600'
                    }`}>
                      {cropAnalysis?.analysis?.priceMovement?.percentageChange > 0 ? '↑' : '↓'} 
                      {Math.abs(cropAnalysis?.analysis?.priceMovement?.percentageChange || 0)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Info Card */}
              <div className={`rounded-2xl shadow-lg p-6 border transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-slate-100'
              }`}>
                <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  <TrendingUp className="w-5 h-5 text-green-600" /> Market Price Information
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Average Price</p>
                    <p className="text-2xl font-bold text-emerald-600">₹{crops.find(c => c.commodity === selectedCrop)?.avgPrice}</p>
                  </div>
                  <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Min Price</p>
                    <p className="text-2xl font-bold text-slate-600">₹{crops.find(c => c.commodity === selectedCrop)?.minPrice}</p>
                  </div>
                  <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Max Price</p>
                    <p className="text-2xl font-bold text-slate-600">₹{crops.find(c => c.commodity === selectedCrop)?.maxPrice}</p>
                  </div>
                </div>
              </div>

              {/* Price Trend Chart */}
              <div className={`rounded-2xl shadow-lg p-6 border transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-slate-100'
              }`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  <TrendingUp className="w-5 h-5 text-green-600" /> Price Trend
                </h3>
                <div style={{ width: '100%', height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : '#e2e8f0'} />
                      <XAxis dataKey="date" stroke={isDark ? '#94a3b8' : '#64748b'} />
                      <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                      <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="price" stroke={getTrendColor()} strokeWidth={2} dot={{ fill: getTrendColor(), r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className={`rounded-2xl p-6 border-2 transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-linear-to-br from-blue-50 to-indigo-50 border-blue-100'
              }`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  <Zap className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} /> Market Activity
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className={`text-sm mb-2 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Markets Reporting</p>
                    <p className={`text-4xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{crops.find(c => c.commodity === selectedCrop)?.marketCount}</p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Number of markets reporting prices</p>
                  </div>
                  <div className={`rounded-xl p-4 flex flex-col justify-between ${isDark ? 'bg-slate-700' : 'bg-white'}`}>
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Volatility Level</p>
                      <p className={`text-2xl font-bold ${
                        cropAnalysis?.analysis?.demandLevel === 'high' ? 'text-green-600' :
                        cropAnalysis?.analysis?.demandLevel === 'medium' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {(cropAnalysis?.analysis?.demandLevel || selectedCropDemand || 'medium').toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demand Level */}
              <div className={`rounded-2xl shadow-lg p-6 border transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-slate-100'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Price Spread Analysis</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-4xl font-bold ${
                      selectedCropDemand === 'high' ? 'text-green-600' :
                      selectedCropDemand === 'medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {selectedCropDemand?.toUpperCase()}
                    </p>
                  </div>
                  <div className={`px-6 py-4 rounded-xl ${
                    selectedCropDemand === 'high' ? 'bg-green-100' :
                    selectedCropDemand === 'medium' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    <p className={`text-sm font-bold ${
                      selectedCropDemand === 'high' ? 'text-green-700' :
                      selectedCropDemand === 'medium' ? 'text-yellow-700' :
                      'text-red-700'
                    }`}>
                      {selectedCropDemand === 'high' ? 'High Volatility' :
                       selectedCropDemand === 'medium' ? 'Moderate Spread' :
                       'Stable Price'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`rounded-2xl p-6 border-2 transition-colors ${
                cropAnalysis?.analysis?.recommendation?.action === 'sell' ? 
                  (isDark ? 'bg-slate-800 border-emerald-700/50' : 'bg-green-50 border-green-200') :
                  (isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-yellow-50 border-yellow-200')
              }`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  <AlertCircle className="w-5 h-5" /> Market Insight
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Price Trend</p>
                    <p className={`text-2xl font-bold ${
                      cropAnalysis?.analysis?.recommendation?.action === 'sell' ? 'text-green-600' :
                      'text-yellow-600'
                    }`}>
                      {cropAnalysis?.analysis?.recommendation?.action === 'sell' ? 'GOOD SELLING OPPORTUNITY' : 'STABLE PRICING'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Analysis</p>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-700'} style={{lineHeight: '1.5'}}>
                      Based on the price spread of {cropAnalysis?.analysis?.priceMovement?.percentageChange || 0}% between minimum and maximum market prices, this commodity shows {selectedCropDemand === 'high' ? 'significant market volatility with potential for value realization.' : 'moderate price stability across different markets.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
