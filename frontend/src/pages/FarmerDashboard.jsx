import { Sprout, Home, TrendingUp, Users, LogOut, Bell, User, Tractor, Newspaper, Filter, RefreshCw, MapPin, Clock, ArrowLeft, Layers } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import farmerBg from '../assets/farmerdashboard.png'

export default function FarmerDashboard() {
  const [selectedCrop, setSelectedCrop] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [activeLink, setActiveLink] = useState('market-prices')
  const [marketPrices, setMarketPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [priceUnit, setPriceUnit] = useState('kg') // kg, quintal, ton
  const [activeCommodity, setActiveCommodity] = useState(null) // State for detailed view

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

  // Helper: Image Mapper with High Quality Stock Images
  const getCropImage = (cropName) => {
    const cropImages = {
      "Alsandikai": "https://upload.wikimedia.org/wikipedia/commons/9/97/Yardlong_beans_02.jpg",
      "Amaranthus": "https://upload.wikimedia.org/wikipedia/commons/a/af/Amaranthus_caudatus_fo._saccharinus.jpg",
      "Amla": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Phyllanthus_emblica.jpg",
      "Apple": "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg",
      "Arhar Dal": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Toor_Dal.jpg",
      "Ashgourd": "https://upload.wikimedia.org/wikipedia/commons/9/96/Benincasa_hispida_2.jpg",
      "Bajra": "https://upload.wikimedia.org/wikipedia/commons/9/98/Pearl_millet.jpg",
      "Banana": "https://upload.wikimedia.org/wikipedia/commons/4/44/Bananas_white_background_DS.jpg",
      "Beans": "https://upload.wikimedia.org/wikipedia/commons/2/25/Green_Beans.JPG",
      "Beetroot": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Beetroot_jm16666.jpg",
      "Bengal Gram": "https://upload.wikimedia.org/wikipedia/commons/0/01/Chickpea_India.jpg",
      "Ber": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Ziziphus_mauritiana_fruit.jpg",
      "Betal Leaves": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Betel_leaves.jpg",
      "Bhindi": "https://upload.wikimedia.org/wikipedia/commons/0/05/Okra_001.JPG",
      "Bitter gourd": "https://upload.wikimedia.org/wikipedia/commons/0/03/Bitter_Melon_02.jpg",
      "Black Gram": "https://upload.wikimedia.org/wikipedia/commons/3/30/Black_gram.jpg",
      "Black pepper": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Black_papper.jpg",
      "Bottle gourd": "https://upload.wikimedia.org/wikipedia/commons/0/02/Bottle_gourd.jpg",
      "Brinjal": "https://upload.wikimedia.org/wikipedia/commons/7/76/Solanum_melongena_24_08_2012_%281%29.JPG",
      "Cabbage": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Cabbage_and_cross_section_on_white.jpg",
      "Capsicum": "https://upload.wikimedia.org/wikipedia/commons/e/e8/Bell_pepper.jpg",
      "Carrot": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Carrots_at_Lulu_Hypermarket.jpg",
      "Castor Seed": "https://upload.wikimedia.org/wikipedia/commons/9/97/Castor_beans.jpg",
      "Cauliflower": "https://upload.wikimedia.org/wikipedia/commons/2/22/Cauliflower_02.jpg",
      "Chikoos": "https://upload.wikimedia.org/wikipedia/commons/7/77/Sapodilla_fruit.jpg",
      "Chili Red": "https://upload.wikimedia.org/wikipedia/commons/5/53/Red_Hot_Chili_Peppers.jpg",
      "Chow Chow": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Chayote_Display.jpg",
      "Cluster beans": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Guar_Pods.jpg",
      "Coconut": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Coconuts_-_single_and_cracked_open.jpg",
      "Coffee": "https://upload.wikimedia.org/wikipedia/commons/4/45/Coffee_beans_by_gnuckx.jpg",
      "Colacasia": "https://upload.wikimedia.org/wikipedia/commons/5/54/Taro_corms.jpg",
      "Coriander": "https://upload.wikimedia.org/wikipedia/commons/7/78/Coriander_seeds.jpg",
      "Cotton": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Cotton_plant.jpg",
      "Cowpea": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Vigna_unguiculata_pods.jpg",
      "Cucumbar": "https://upload.wikimedia.org/wikipedia/commons/3/32/Cucumber_fresh.jpg",
      "Cummin Seed": "https://upload.wikimedia.org/wikipedia/commons/d/d4/Cumin_seeds.jpg",
      "Drumstick": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Drumstick_Vegetable.jpg",
      "Elephant Yam": "https://upload.wikimedia.org/wikipedia/commons/5/50/Amorphophallus_paeoniifolius_corm.jpg",
      "Fish": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Fish_market_Varkala.jpg",
      "French Beans": "https://upload.wikimedia.org/wikipedia/commons/c/c2/French_beans.jpg",
      "Garlic": "https://upload.wikimedia.org/wikipedia/commons/3/36/Garlic_cloves_and_bulb.jpg",
      "Ginger": "https://upload.wikimedia.org/wikipedia/commons/c/c6/Ginger_Root.jpg",
      "Grapes": "https://upload.wikimedia.org/wikipedia/commons/b/bb/Table_grapes_on_white.jpg",
      "Green Chilli": "https://upload.wikimedia.org/wikipedia/commons/d/d4/Green_chilli_peppers.jpg",
      "Green Gram": "https://upload.wikimedia.org/wikipedia/commons/d/da/Mung_beans.jpg",
      "Green Peas": "https://upload.wikimedia.org/wikipedia/commons/8/80/Peas_in_pods_-_Studio.jpg",
      "Groundnut": "https://upload.wikimedia.org/wikipedia/commons/1/14/Groundnut_Arachis_hypogaea.jpg",
      "Guar": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Guar_Pods.jpg",
      "Guava": "https://upload.wikimedia.org/wikipedia/commons/0/02/Guava_ID.jpg",
      "Gur": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Jaggery_India.JPG",
      "Jowar": "https://upload.wikimedia.org/wikipedia/commons/c/c9/Sorghum_bicolor_grain.jpg",
      "Kabuli Chana": "https://upload.wikimedia.org/wikipedia/commons/7/70/Chickpeas.jpg",
      "Kinnow": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Kinnow.jpg",
      "Knool Khol": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Kohlrabi.jpg",
      "Lemon": "https://upload.wikimedia.org/wikipedia/commons/e/e4/Lemon.jpg",
      "Lime": "https://upload.wikimedia.org/wikipedia/commons/a/a5/Lime_fruit.jpg",
      "Little gourd": "https://upload.wikimedia.org/wikipedia/commons/3/36/Coccinia_grandis_fruit.jpg",
      "Maize": "https://upload.wikimedia.org/wikipedia/commons/f/fe/Corn.jpg",
      "Mango": "https://upload.wikimedia.org/wikipedia/commons/9/90/Hapus_Mango.jpg",
      "Mashrooms": "https://upload.wikimedia.org/wikipedia/commons/a/a2/Mushroom-IMG_3165.JPG",
      "Methi": "https://upload.wikimedia.org/wikipedia/commons/1/1c/Methi_Seeds.jpg",
      "Mint": "https://upload.wikimedia.org/wikipedia/commons/0/05/Mint-leaves-2007.jpg",
      "Mousambi": "https://upload.wikimedia.org/wikipedia/commons/0/08/Sweet_Lime.jpg",
      "Mustard": "https://upload.wikimedia.org/wikipedia/commons/d/d3/Mustard_seeds_mixture.jpg",
      "Onion": "https://upload.wikimedia.org/wikipedia/commons/2/25/Onion_on_White.JPG",
      "Orange": "https://upload.wikimedia.org/wikipedia/commons/c/c4/Orange-Fruit-Pieces.jpg",
      "Paddy": "https://upload.wikimedia.org/wikipedia/commons/9/9d/Paddy_grains.jpg",
      "Papaya": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Papaya_cross_section_BNC.jpg",
      "Pineapple": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Pineapple_and_cross_section.jpg",
      "Pomegranate": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Pomegranate_02.jpg",
      "Potato": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Patates.jpg",
      "Pumpkin": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Pumpkin_ds.jpg",
      "Raddish": "https://upload.wikimedia.org/wikipedia/commons/1/18/Radish_3.jpg",
      "Rice": "https://upload.wikimedia.org/wikipedia/commons/2/20/White_Rice.jpg",
      "Ridgeguard": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Luffa_acutangula_fruit.jpg",
      "Sesamum": "https://upload.wikimedia.org/wikipedia/commons/7/75/Sesame_seeds.jpg",
      "Snakeguard": "https://upload.wikimedia.org/wikipedia/commons/3/31/Snake_Gourd_01.jpg",
      "Soyabean": "https://upload.wikimedia.org/wikipedia/commons/9/90/Soybean.JPG",
      "Spinach": "https://upload.wikimedia.org/wikipedia/commons/3/37/Spinach_leaves.jpg",
      "Sweet Corn": "https://upload.wikimedia.org/wikipedia/commons/f/fe/Corn.jpg",
      "Sweet Potato": "https://upload.wikimedia.org/wikipedia/commons/5/58/Ipomoea_batatas_006.JPG",
      "Tamarind": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Tamarindus_indica_fruit.jpg",
      "Tapioca": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Manihot_esculenta_dsc07325.jpg",
      "Tender Coconut": "https://upload.wikimedia.org/wikipedia/commons/c/cf/Green_Coconut_in_shop.jpg",
      "Tinda": "https://upload.wikimedia.org/wikipedia/commons/d/d4/Praecitrullus_fistulosus.jpg",
      "Tomato": "https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg",
      "Turmeric": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Curcuma_longa_roots.jpg",
      "Turnip": "https://upload.wikimedia.org/wikipedia/commons/d/d3/Turnip_2622027.jpg",
      "Water Melon": "https://upload.wikimedia.org/wikipedia/commons/4/47/Taiwan_2009_Tainan_City_Organic_Farm_Watermelon_FRD_7962.jpg",
      "Wheat": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Vehn%C3%A4pelto_6.jpg",
      "Yam": "https://upload.wikimedia.org/wikipedia/commons/0/02/Yam_Dioscorea.jpg"
    }

    // Try to find an exact match or partial match in our map
    const name = cropName.split('(')[0].trim() // Basic cleanup for lookup
    
    // Direct match
    if (cropImages[name]) return cropImages[name]
    
    // Fuzzy search through our map keys
    const match = Object.keys(cropImages).find(key => 
      cropName.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(cropName.toLowerCase())
    )
    if (match) return cropImages[match]
    
    // Fallback Generator
    return `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(cropName)}`
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
            
            {/* Header & Controls */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-stone-700 mb-4 tracking-tight">Current Market Prices</h2>
              
              <div className="flex flex-col md:flex-row gap-4">
                 {/* Styled Select Box: Crop */}
                 <div className="relative min-w-[200px] flex-1">
                    <select 
                      value={selectedCrop} 
                      onChange={(e) => setSelectedCrop(e.target.value)} 
                      className="appearance-none w-full bg-[#fcf9f2] border border-stone-200 text-gray-700 py-3 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 font-medium transition-shadow cursor-pointer"
                    >
                        {getUniqueValues('commodity').map(crop => (
                          <option key={crop} value={crop}>{crop === 'all' ? 'Select Crop' : crop}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-500">
                      <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                 </div>

                 {/* Styled Select Box: District */}
                 <div className="relative min-w-[200px] flex-1">
                    <select 
                      value={selectedLocation} 
                      onChange={(e) => setSelectedLocation(e.target.value)} 
                      className="appearance-none w-full bg-[#fcf9f2] border border-stone-200 text-gray-700 py-3 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 font-medium transition-shadow cursor-pointer"
                    >
                         {getUniqueValues('district').map(loc => (
                          <option key={loc} value={loc}>{loc === 'all' ? 'All Locations' : loc}</option>
                        ))}
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-500">
                      <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                 </div>
                 
                 {/* Unit Conversion Toggles */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1.5 rounded-lg border border-stone-200 md:ml-auto">
                   {['kg', 'quintal', 'ton'].map(unit => (
                     <button 
                       key={unit}
                       onClick={() => setPriceUnit(unit)}
                       className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize transition-all duration-200 ${priceUnit === unit ? 'bg-white shadow-sm text-green-800 ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'}`}
                     >
                       {unit}
                     </button>
                   ))}
                </div>
              </div>
            </div>

            {/* Cards Grid - 3 Column Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <RefreshCw className="animate-spin h-10 w-10 mx-auto text-green-600 mb-4 opacity-50"/>
                        <p className="text-stone-500 font-medium animate-pulse">Fetching latest market rates...</p>
                    </div>
                ) : filteredPrices.length > 0 ? (
                  activeCommodity ? (
                    // Detailed View for Selected Commodity
                    <>
                         <div className="col-span-full flex items-center justify-between mb-2 pb-2 border-b border-stone-100">
                            <button 
                                onClick={() => setActiveCommodity(null)}
                                className="flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-green-700 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Categories
                            </button>
                            <h3 className="text-lg font-bold text-green-800 bg-green-50 px-3 py-1 rounded-full">{activeCommodity}</h3>
                        </div>

                        {filteredPrices.filter(p => p.commodity === activeCommodity).map((crop, index) => (
                             <div key={index} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 border border-stone-100 flex flex-col group h-full">
                                {/* Card Image */}
                                <div className="h-40 w-full relative overflow-hidden bg-stone-100">
                                    <img 
                                    src={getCropImage(crop.commodity)} 
                                    alt={crop.commodity}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/600x400?text=No+Image'; 
                                    }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                                </div>
                                
                                {/* Card Body */}
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-stone-800 mb-0.5 group-hover:text-green-700 transition-colors">{crop.commodity}</h3>
                                    
                                    <div className="mt-2 mb-4">
                                        <span className="text-2xl font-extrabold text-stone-900 tracking-tight">{formatPrice(crop.modal_price).split('/')[0]}</span>
                                        <span className="text-sm text-stone-500 font-medium ml-1">per {priceUnit}</span>
                                    </div>

                                    <div className="mt-auto space-y-2.5 pt-3 border-t border-stone-50">
                                        <div className="flex items-start gap-2.5">
                                            <span className="bg-green-50 text-green-700 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 mt-0.5">Market</span>
                                            <p className="text-sm text-stone-600 font-medium leading-tight line-clamp-1" title={crop.market}>{crop.market}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                                            <p className="text-xs text-stone-400 font-medium">Updated: Just Now</p>
                                        </div>
                                    </div>
                                </div>
                                </div>
                        ))}
                    </>
                  ) : (
                    // Grouped Collection View
                    [...new Set(filteredPrices.map(item => item.commodity))].sort().map((commodityName) => {
                         const count = filteredPrices.filter(p => p.commodity === commodityName).length;
                         return (
                            <div 
                                key={commodityName} 
                                onClick={() => setActiveCommodity(commodityName)}
                                className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 hover:shadow-md hover:border-green-400 cursor-pointer transition-all group flex items-center gap-5"
                            >
                                <div className="h-24 w-24 rounded-lg overflow-hidden shrink-0 bg-stone-100 shadow-inner">
                                    <img 
                                    src={getCropImage(commodityName)} 
                                    alt={commodityName}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/600x400?text=No+Image'; 
                                    }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-stone-800 group-hover:text-green-700 transition-colors mb-1">{commodityName}</h3>
                                    <div className="flex items-center gap-2 text-stone-500 text-sm font-medium">
                                        <Layers className="w-4 h-4 text-green-500"/>
                                        <span>{count} {count === 1 ? 'Market Listing' : 'Market Listings'}</span>
                                    </div>
                                    <p className="text-xs text-stone-400 mt-2 flex items-center gap-1 group-hover:text-green-600 group-hover:translate-x-1 transition-all">
                                        View Prices &rarr;
                                    </p>
                                </div>
                            </div>
                         )
                    })
                  )
                ) : (
                    <div className="col-span-full text-center py-20 bg-[#f9f9f9] rounded-xl border-2 border-dashed border-stone-200">
                        <Filter className="h-10 w-10 mx-auto text-stone-300 mb-3"/>
                        <p className="text-stone-500 font-medium">No prices found for standard crops.</p>
                        <button onClick={() => {setSelectedCrop('all'); setSelectedLocation('all')}} className="mt-2 text-sm text-green-600 font-semibold hover:underline">Clear Filters</button>
                    </div>
                )}
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
