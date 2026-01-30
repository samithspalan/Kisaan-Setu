import { Sprout, Home, TrendingUp, Users, LogOut, Bell, User, Tractor, Newspaper, Filter, RefreshCw, MapPin, Clock, ArrowLeft, Layers } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import farmerBg from '../assets/farmerdashboard.png'

export default function FarmerDashboard() {
  const [selectedCrop, setSelectedCrop] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [userLocation, setUserLocation] = useState('') // New: User's preferred location
  const [activeLink, setActiveLink] = useState('home')
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

  // Regional Crop Data (Static "Internet" Knowledge)
  const regionalCrops = {
    "Andhra Pradesh": ["Rice", "Tobacco", "Chilli", "Cotton", "Sugarcane", "Groundnut"],
    "Arunachal Pradesh": ["Rice", "Maize", "Millet", "Potato", "Ginger", "Orange"],
    "Assam": ["Tea", "Rice", "Jute", "Sugarcane", "Potato"],
    "Bihar": ["Rice", "Wheat", "Maize", "Pulses", "Jute", "Potato"],
    "Chhattisgarh": ["Rice", "Maize", "Millets", "Pulses", "Oilseeds"],
    "Goa": ["Rice", "Cashew", "Coconut", "Arecanut", "Mango"],
    "Gujarat": ["Cotton", "Groundnut", "Tobacco", "Cumin", "Sesame", "Castor"],
    "Haryana": ["Wheat", "Rice", "Sugarcane", "Cotton", "Mustard"],
    "Himachal Pradesh": ["Apple", "Maize", "Wheat", "Barley", "Potato", "Stone Fruits"],
    "Jharkhand": ["Rice", "Maize", "Pulses", "Oilseeds", "Vegetables"],
    "Karnataka": ["Coffee", "Ragi", "Maize", "Sunflower", "Sugarcane", "Arecanut", "Silk"],
    "Kerala": ["Rubber", "Coconut", "Pepper", "Cardamom", "Tea", "Coffee", "Tapioca"],
    "Madhya Pradesh": ["Soybean", "Wheat", "Gram", "Pulses", "Garlic", "Coriander"],
    "Maharashtra": ["Cotton", "Sugarcane", "Soybean", "Jowar", "Onion", "Grapes", "Pomegranate"],
    "Manipur": ["Rice", "Maize", "Pineapple", "Orange"],
    "Meghalaya": ["Rice", "Maize", "Potato", "Pineapple", "Banana", "Ginger"],
    "Mizoram": ["Rice", "Maize", "Ginger", "Turmeric"],
    "Nagaland": ["Rice", "Maize", "Millets", "Pulses"],
    "Odisha": ["Rice", "Pulses", "Oilseeds", "Jute", "Coconut", "Turmeric"],
    "Punjab": ["Wheat", "Rice", "Cotton", "Sugarcane", "Maize", "Potato"],
    "Rajasthan": ["Mustard", "Bajra", "Guar", "Maize", "Spices", "Coriander", "Cumin"],
    "Sikkim": ["Large Cardamom", "Rice", "Maize", "Buckwheat", "Ginger"],
    "Tamil Nadu": ["Rice", "Sugarcane", "Groundnut", "Turmeric", "Banana", "Tapioca", "Coconut"],
    "Telangana": ["Rice", "Cotton", "Maize", "Chilli", "Turmeric", "Soybean"],
    "Tripura": ["Rice", "Rubber", "Tea", "Potato"],
    "Uttar Pradesh": ["Wheat", "Sugarcane", "Potato", "Rice", "Maize", "Pulses"],
    "Uttarakhand": ["Rice", "Wheat", "Sugarcane", "Maize", "Soybean", "Millet"],
    "West Bengal": ["Rice", "Jute", "Tea", "Potato", "Vegetables", "Pineapple"],
    "Andaman and Nicobar Islands": ["Coconut", "Arecanut", "Rice", "Spices"],
    "Chandigarh": ["Wheat", "Rice", "Maize"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Rice", "Ragi", "Small Millets", "Pulses"],
    "Delhi": ["Wheat", "Jowar", "Bajra", "Vegetables"],
    "Jammu and Kashmir": ["Saffron", "Apple", "Walnut", "Rice", "Maize", "Cherry"],
    "Ladakh": ["Barley", "Apricot", "Wheat", "Buckwheat"],
    "Lakshadweep": ["Coconut"],
    "Puducherry": ["Rice", "Pulses", "Groundnut", "Chillies"],
    "Nashik": ["Grapes", "Onion", "Tomato", "Pomegranate"],
    "Nagpur": ["Orange", "Soybean", "Cotton"],
    "Darjeeling": ["Tea", "Maize", "Potato", "Ginger"],
    "Coorg": ["Coffee", "Pepper", "Honey", "Cardamom", "Orange"],
    "Guntur": ["Chilli", "Cotton", "Tobacco"],
    "Mahabaleshwar": ["Strawberry", "Mulberry", "Vegetables"],
    "Ratnagiri": ["Alphonso Mango", "Cashew", "Rice", "Coconut"]
  }

  // Helper: Image Mapper with High Quality Stock Images
  const getCropImage = (cropName) => {
    const cropImages = {
      "Alsandikai": "https://upload.wikimedia.org/wikipedia/commons/9/97/Yardlong_beans_02.jpg",
      "Amaranthus": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Amaranthus_tricolor_002.jpg/640px-Amaranthus_tricolor_002.jpg",
      "Amla": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Phyllanthus_emblica.jpg",
      "Apple": "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg",
      "Arhar Dal": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Toor_Dal.jpg",
      "Ashgourd": "https://upload.wikimedia.org/wikipedia/commons/9/96/Benincasa_hispida_2.jpg",
      "Bajra": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Pearl_millet_Pennisetum_glaucum.jpg/640px-Pearl_millet_Pennisetum_glaucum.jpg",
      "Banana": "https://upload.wikimedia.org/wikipedia/commons/4/44/Bananas_white_background_DS.jpg",
      "Beans": "https://upload.wikimedia.org/wikipedia/commons/2/25/Green_Beans.JPG",
      "Beetroot": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Beetroot_jm16666.jpg",
      "Bengal Gram": "https://upload.wikimedia.org/wikipedia/commons/0/01/Chickpea_India.jpg",
      "Ber": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Ziziphus_mauritiana_fruit.jpg",
      "Betal Leaves": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Betel_leaves.jpg",
      "Bhindi": "https://upload.wikimedia.org/wikipedia/commons/0/05/Okra_001.JPG",
      "Bitter gourd": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Lagenaria_siceraria_01.jpg/640px-Lagenaria_siceraria_01.jpg",
      "Black Gram": "https://upload.wikimedia.org/wikipedia/commons/3/30/Black_gram.jpg",
      "Black pepper": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Black_papper.jpg",
      "Bottle gourd": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Lagenaria_siceraria_01.jpg/640px-Lagenaria_siceraria_01.jpg",
      "Brinjal": "https://images.unsplash.com/photo-1629831968840-7afc6ec35939?w=600&q=80",
      "Cabbage": "https://images.unsplash.com/photo-1550175727-4402662c906a?w=600&q=80",
      "Capsicum": "https://upload.wikimedia.org/wikipedia/commons/e/e8/Bell_pepper.jpg",
      "Carrot": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Carrots_at_Lulu_Hypermarket.jpg",
      "Castor Seed": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ricinus_communis_-_Castor_Oil_Plant_-_Euphorbiaceae_03.jpg/600px-Ricinus_communis_-_Castor_Oil_Plant_-_Euphorbiaceae_03.jpg",
      "Cauliflower": "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&q=80",
      "Chikoos": "https://upload.wikimedia.org/wikipedia/commons/7/77/Sapodilla_fruit.jpg",
      "Chili Red": "https://upload.wikimedia.org/wikipedia/commons/5/53/Red_Hot_Chili_Peppers.jpg",
      "Chow Chow": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Chayote_Display.jpg",
      "Cluster beans": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Guar_Pods.jpg",
      "Coconut": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Coconuts_-_single_and_cracked_open.jpg",
      "Coffee": "https://upload.wikimedia.org/wikipedia/commons/4/45/Coffee_beans_by_gnuckx.jpg",
      "Colacasia": "https://upload.wikimedia.org/wikipedia/commons/5/54/Taro_corms.jpg",
      "Coriander": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Coriandrum_sativum_Seeds.jpg/640px-Coriandrum_sativum_Seeds.jpg",
      "Corriander seed": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Coriandrum_sativum_Seeds.jpg/640px-Coriandrum_sativum_Seeds.jpg",
      "Cotton": "https://images.unsplash.com/photo-1606836437597-2bb45dc26871?w=600&q=80",
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
      "Green Chilli": "https://images.unsplash.com/photo-1635548028753-4375b4dc175e?w=600&q=80",
      "Green Gram": "https://upload.wikimedia.org/wikipedia/commons/d/da/Mung_beans.jpg",
      "Green Peas": "https://upload.wikimedia.org/wikipedia/commons/8/80/Peas_in_pods_-_Studio.jpg",
      "Groundnut": "https://images.unsplash.com/photo-1627038169165-385c5b9f71c9?w=600&q=80",
      "Guar": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Cyamopsis_tetragonoloba_-_Guar.jpg/640px-Cyamopsis_tetragonoloba_-_Guar.jpg",
      "Guar Seed": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Cyamopsis_tetragonoloba_-_Guar.jpg/640px-Cyamopsis_tetragonoloba_-_Guar.jpg",
      "Guava": "https://upload.wikimedia.org/wikipedia/commons/0/02/Guava_ID.jpg",
      "Gur": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Jaggery_India.JPG",
      "Jowar": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Sorghum_bicolor_002.jpg/640px-Sorghum_bicolor_002.jpg",
      "Kabuli Chana": "https://upload.wikimedia.org/wikipedia/commons/7/70/Chickpeas.jpg",
      "Kinnow": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Kinnow.jpg",
      "Knool Khol": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Kohlrabi.jpg",
      "Lemon": "https://images.unsplash.com/photo-1590502593747-42a996133562?w=600&q=80",
      "Lime": "https://upload.wikimedia.org/wikipedia/commons/a/a5/Lime_fruit.jpg",
      "Little gourd": "https://upload.wikimedia.org/wikipedia/commons/3/36/Coccinia_grandis_fruit.jpg",
      "Maize": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80",
      "Mango": "https://upload.wikimedia.org/wikipedia/commons/9/90/Hapus_Mango.jpg",
      "Mashrooms": "https://upload.wikimedia.org/wikipedia/commons/a/a2/Mushroom-IMG_3165.JPG",
      "Methi": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Methi_%28Fenugreek%29_seeds.jpg/640px-Methi_%28Fenugreek%29_seeds.jpg",
      "Mint": "https://upload.wikimedia.org/wikipedia/commons/0/05/Mint-leaves-2007.jpg",
      "Mousambi": "https://upload.wikimedia.org/wikipedia/commons/0/08/Sweet_Lime.jpg",
      "Mustard": "https://images.unsplash.com/photo-1558223637-d2c6c06aabe2?w=600&q=80",
      "Onion": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80",
      "Orange": "https://upload.wikimedia.org/wikipedia/commons/c/c4/Orange-Fruit-Pieces.jpg",
      "Paddy": "https://upload.wikimedia.org/wikipedia/commons/9/9d/Paddy_grains.jpg",
      "Papaya": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Papaya_cross_section_BNC.jpg",
      "Pineapple": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Pineapple_and_cross_section.jpg",
      "Pomegranate": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Pomegranate_02.jpg",
      "Potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80",
      "Pumpkin": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Pumpkin_ds.jpg",
      "Raddish": "https://upload.wikimedia.org/wikipedia/commons/1/18/Radish_3.jpg",
      "Rice": "https://upload.wikimedia.org/wikipedia/commons/2/20/White_Rice.jpg",
      "Ridgeguard": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Luffa_acutangula_fruit.jpg",
      "Sesamum": "https://upload.wikimedia.org/wikipedia/commons/7/75/Sesame_seeds.jpg",
      "Snakeguard": "https://upload.wikimedia.org/wikipedia/commons/3/31/Snake_Gourd_01.jpg",
      "Soyabean": "https://upload.wikimedia.org/wikipedia/commons/9/90/Soybean.JPG",
      "Spinach": "https://upload.wikimedia.org/wikipedia/commons/3/37/Spinach_leaves.jpg",
      "Sweet Corn": "https://images.unsplash.com/photo-1623869150036-79bd27248e36?w=600&q=80",
      "Sweet Potato": "https://upload.wikimedia.org/wikipedia/commons/5/58/Ipomoea_batatas_006.JPG",
      "Tamarind": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Tamarindus_indica_fruit.jpg",
      "Tapioca": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Manihot_esculenta_dsc07325.jpg",
      "Tender Coconut": "https://upload.wikimedia.org/wikipedia/commons/c/cf/Green_Coconut_in_shop.jpg",
      "Tinda": "https://upload.wikimedia.org/wikipedia/commons/d/d4/Praecitrullus_fistulosus.jpg",
      "Tomato": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80",
      "Turmeric": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Curcuma_longa_roots.jpg",
      "Turnip": "https://upload.wikimedia.org/wikipedia/commons/d/d3/Turnip_2622027.jpg",
      "Water Melon": "https://upload.wikimedia.org/wikipedia/commons/4/47/Taiwan_2009_Tainan_City_Organic_Farm_Watermelon_FRD_7962.jpg",
      "Wheat": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Vehn%C3%A4pelto_6.jpg",
      "Yam": "https://upload.wikimedia.org/wikipedia/commons/0/02/Yam_Dioscorea.jpg"
    }

    // Try to find an exact match or partial match in our map
    const name = cropName.replace(/\(.*\)/g, '').trim() // Remove anything in brackets
    
    // Direct match
    if (cropImages[name]) return cropImages[name]
    
    // Fuzzy search through our map keys
    const match = Object.keys(cropImages).find(key => 
      name.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(name.toLowerCase())
    )
    if (match) return cropImages[match]
    
    // Fallback Generator
    return `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(name)}`
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
  }).sort((a, b) => {
  // Priority Sort: Regional crops first
    if (!userLocation || !regionalCrops[userLocation]) return 0
    
    // Check if commodity matches any crop recommended for this region
    const isRegionalA = regionalCrops[userLocation].some(c => a.commodity.toLowerCase().includes(c.toLowerCase()))
    const isRegionalB = regionalCrops[userLocation].some(c => b.commodity.toLowerCase().includes(c.toLowerCase()))

    if (isRegionalA && !isRegionalB) return -1
    if (!isRegionalA && isRegionalB) return 1
    return 0
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
              
              {userLocation && regionalCrops[userLocation] && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sprout className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-bold text-green-800">Primary Crops in {userLocation}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {regionalCrops[userLocation].map(c => (
                      <span key={c} className="text-xs font-medium px-2.5 py-1 bg-white border border-green-200 text-green-700 rounded-full shadow-sm">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4">
                 {/* My Location Priority */}
                 <div className="relative min-w-[200px] flex-1">
                    <select 
                      value={userLocation} 
                      onChange={(e) => setUserLocation(e.target.value)} 
                      className={`appearance-none w-full border text-gray-700 py-3 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 font-medium transition-shadow cursor-pointer ${userLocation ? 'bg-green-50 border-green-500 ring-2 ring-green-100' : 'bg-amber-50 border-stone-200'}`}
                    >
                        <option value="">Set My Location (General Map)</option>
                        {Object.keys(regionalCrops).sort().map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-500">
                      <MapPin className={`w-4 h-4 ${userLocation ? 'text-green-600' : 'text-stone-400'}`} />
                    </div>
                 </div>

                 {/* Styled Select Box: Crop */}
                 <div className="relative min-w-[200px] flex-1">
                    <select 
                      value={selectedCrop} 
                      onChange={(e) => setSelectedCrop(e.target.value)} 
                      className="appearance-none w-full bg-amber-50 border border-stone-200 text-gray-700 py-3 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 font-medium transition-shadow cursor-pointer"
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
                      className="appearance-none w-full bg-amber-50 border border-stone-200 text-gray-700 py-3 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 font-medium transition-shadow cursor-pointer"
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
            <div className="h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent">
            {loading ? (
                <div className="py-20 text-center">
                    <RefreshCw className="animate-spin h-10 w-10 mx-auto text-green-600 mb-4 opacity-50"/>
                    <p className="text-stone-500 font-medium animate-pulse">Fetching latest market rates...</p>
                </div>
            ) : activeCommodity ? (
              /* Detail View for a Specific Commodity */
              <div>
                <button 
                  onClick={() => setActiveCommodity(null)}
                  className="mb-6 flex items-center gap-2 text-green-700 font-bold hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" /> Back to All Crops
                </button>
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 border-b border-stone-100 pb-6">
                   <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-stone-200">
                        <img 
                          src={getCropImage(activeCommodity)} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          alt={activeCommodity} 
                        />
                     </div>
                     <div>
                       <h3 className="text-2xl font-bold text-stone-800">{activeCommodity}</h3>
                       <p className="text-stone-500 text-sm font-medium">Market Prices across selected regions</p>
                     </div>
                   </div>
                   <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full self-start sm:self-center">
                      {filteredPrices.filter(i => i.commodity === activeCommodity).length} Listings Found
                   </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPrices.filter(c => c.commodity === activeCommodity).map((crop, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col group h-full hover:shadow-md transition-all">
                        <div className="p-5 flex flex-col h-full">
                           <div className="flex justify-between items-start mb-4">
                             <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">{crop.district}</span>
                               </div>
                               <h4 className="font-bold text-stone-800 text-lg leading-tight">{crop.market}</h4>
                             </div>
                             <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-green-50 text-green-700 rounded-lg border border-green-100">
                               {crop.variety}
                             </span>
                           </div>
                           
                           <div className="mt-auto pt-4 border-t border-stone-50">
                              <div className="flex items-end justify-between">
                                <div>
                                  <p className="text-xs text-stone-400 font-medium mb-0.5">Modal Price</p>
                                  <div className="flex items-baseline gap-1">
                                     <span className="text-2xl font-bold text-green-700">{formatPrice(crop.modal_price).split('/')[0]}</span>
                                     <span className="text-xs text-stone-500">/{priceUnit}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-[10px] text-stone-400">Max Price</p>
                                   <p className="text-sm font-semibold text-stone-600">{formatPrice(crop.max_price).split('/')[0]}</p>
                                </div>
                              </div>
                           </div>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Collection View: Unique Commodities */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...new Set(filteredPrices.map(item => item.commodity))]
                  .map((commodityName, index) => {
                    const count = filteredPrices.filter(p => p.commodity === commodityName).length
                    const prices = filteredPrices.filter(p => p.commodity === commodityName).map(p => parseFloat(p.modal_price)).filter(p => !isNaN(p));
                    const avgPrice = prices.length ? (prices.reduce((a,b)=>a+b,0)/prices.length) : 0;
                    
                    return (
                    <div 
                      key={index} 
                      onClick={() => setActiveCommodity(commodityName)}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-stone-100 flex flex-col group h-full cursor-pointer relative"
                    >
                      {/* Card Image */}
                      <div className="h-48 w-full relative overflow-hidden bg-stone-100">
                        <img 
                          src={getCropImage(commodityName)} 
                          alt={commodityName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/600x400?text=No+Image'; 
                          }}
                        />
                         <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>
                         
                         {/* Overlay Content */}
                         <div className="absolute bottom-0 left-0 p-5 w-full">
                            <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-green-300 transition-colors">{commodityName}</h3>
                            <div className="flex items-center gap-3">
                               <span className="flex items-center gap-1.5 text-white/90 text-sm font-medium bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                                  <Layers className="w-3.5 h-3.5" /> {count} Market{count !== 1 ? 's' : ''}
                               </span>
                            </div>
                         </div>
                      </div>

                      {/* Card Body - Footer Stats */}
                      <div className="p-4 bg-white border-t border-stone-100 flex justify-between items-center">
                          <div>
                            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-0.5">Avg Price</p>
                            <p className="text-lg font-bold text-stone-700">{formatPrice(avgPrice).split('/')[0]} <span className="text-xs font-normal text-stone-400">/{priceUnit}</span></p>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                            <ArrowLeft className="w-4 h-4 text-green-600 group-hover:text-white rotate-180 transition-colors" />
                          </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredPrices.length === 0 && (
                <div className="col-span-full text-center py-20 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200">
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
                  <div key={buyer.id} className="bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 hover:shadow-md transition-all">
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
          <div className="bg-linear-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <Tractor className="w-16 h-16" />
              <div>
                <h3 className="text-2xl font-bold mb-2">Post Your Produce</h3>
                <p className="text-green-100">List your crops for sale and reach buyers instantly</p>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-amber-600 to-orange-600 text-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer">
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
