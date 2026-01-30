import { Sprout, Home, TrendingUp, Users, LogOut, Bell, User, Tractor, Newspaper, Filter, RefreshCw, MapPin, Clock, ArrowLeft, Layers, Leaf, Store, Handshake, IndianRupee, Search, ShieldCheck, BarChart3, Building2, Globe, TrendingDown, Sun, Moon, CloudRain, Droplets } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'
import farmerBg from '../assets/farmerdashboard.png'

export default function FarmerDashboard({ onNavigate }) {
  const { isDark, toggleTheme } = useTheme()
  const [selectedCrop, setSelectedCrop] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [userLocation, setUserLocation] = useState('')
  const [activeLink, setActiveLink] = useState('home')
  const [marketPrices, setMarketPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [priceUnit, setPriceUnit] = useState('kg')
  const [activeCommodity, setActiveCommodity] = useState(null)
  const [imageErrors, setImageErrors] = useState({})
  const [topGainer, setTopGainer] = useState(null)
  const [topLoser, setTopLoser] = useState(null)
  const [activeImageError, setActiveImageError] = useState(false)

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

  // Calculate top gainer and loser based on price spread
  const calculateGainersLosers = (prices) => {
    if (prices.length === 0) return

    const commodityStats = {}

    // Group by commodity and calculate average prices
    prices.forEach(item => {
      if (!commodityStats[item.commodity]) {
        commodityStats[item.commodity] = {
          totalMax: 0,
          totalMin: 0,
          totalModal: 0,
          count: 0
        }
      }
      commodityStats[item.commodity].totalMax += parseFloat(item.max_price) || 0
      commodityStats[item.commodity].totalMin += parseFloat(item.min_price) || 0
      commodityStats[item.commodity].totalModal += parseFloat(item.modal_price) || 0
      commodityStats[item.commodity].count += 1
    })

    // Calculate percentage changes
    const changes = Object.entries(commodityStats).map(([commodity, stats]) => {
      const avgMax = stats.totalMax / stats.count
      const avgMin = stats.totalMin / stats.count
      const changePercent = avgMin > 0 ? ((avgMax - avgMin) / avgMin) * 100 : 0
      return {
        commodity,
        changePercent: parseFloat(changePercent.toFixed(2)),
        avgPrice: (stats.totalModal / stats.count).toFixed(2)
      }
    })

    // Find top gainer and loser
    const sorted = changes.sort((a, b) => b.changePercent - a.changePercent)
    if (sorted.length > 0) {
      setTopGainer(sorted[0])
      setTopLoser(sorted[sorted.length - 1])
    }
  }

  useEffect(() => {
    fetchMarketData()
  }, [])

  useEffect(() => {
    calculateGainersLosers(marketPrices)
  }, [marketPrices])

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
    // Karnataka Districts
    "Bagalkot": ["Sugarcane", "Maize", "Wheat", "Sunflower", "Pomegranate"],
    "Bangalore Rural": ["Ragi", "Maize", "Grapes", "Mango", "Mulberry"],
    "Bangalore Urban": ["Ragi", "Maize", "Groundnut", "Vegetables", "Flowers"],
    "Belgaum": ["Sugarcane", "Maize", "Tobacco", "Cotton", "Vegetables"],
    "Bellary": ["Paddy", "Sunflower", "Cotton", "Groundnut", "Chilli"],
    "Bidar": ["Soybean", "Red Gram", "Sugarcane", "Ginger"],
    "Bijapur": ["Jowar", "Bajra", "Pomegranate", "Grapes", "Lime"],
    "Chamarajanagar": ["Turmeric", "Banana", "Coconut", "Sugarcane"],
    "Chikmagalur": ["Coffee", "Arecanut", "Pepper", "Cardamom"],
    "Chikkaballapur": ["Grapes", "Mango", "Potato", "Vegetables"],
    "Chitradurga": ["Groundnut", "Sunflower", "Onion", "Coconut"],
    "Dakshina Kannada": ["Coconut", "Arecanut", "Paddy", "Black Pepper", "Banana"],
    "Davangere": ["Maize", "Paddy", "Cotton", "Arecanut"],
    "Dharwad": ["Cotton", "Chilli", "Groundnut", "Wheat"],
    "Gadag": ["Chilli", "Onion", "Sunflower", "Cotton"],
    "Gulbarga": ["Red Gram (Tur)", "Jowar", "Sunflower"],
    "Hassan": ["Potato", "Coffee", "Coconut", "Pepper"],
    "Haveri": ["Chilli", "Maize", "Cotton", "Cardamom"],
    "Kodagu": ["Coffee", "Pepper", "Cardamom", "Orange"],
    "Kolar": ["Tomato", "Mango", "Mulberry", "Vegetables"],
    "Koppal": ["Paddy", "Maize", "Sunflower"],
    "Mandya": ["Sugarcane", "Paddy", "Ragi", "Coconut"],
    "Mysore": ["Paddy", "Tobacco", "Cotton", "Silk"],
    "Raichur": ["Paddy", "Cotton", "Groundnut"],
    "Ramanagara": ["Ragi", "Mango", "Coconut", "Mulberry"],
    "Shimoga": ["Arecanut", "Paddy", "Ginger", "Vanilla"],
    "Tumkur": ["Coconut", "Arecanut", "Ragi", "Groundnut"],
    "Udupi": ["Paddy", "Coconut", "Arecanut", "Cashew", "Mattu Gulla"],
    "Uttara Kannada": ["Arecanut", "Spices", "Cashew", "Vanilla"],
    "Yadgir": ["Red Gram", "Cotton", "Groundnut"],
    
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
    if (priceUnit === 'kg') return `₹${Math.round(numPrice / 100)}/kg`
    if (priceUnit === 'quintal') return `₹${Math.round(numPrice).toLocaleString()}/q`
    if (priceUnit === 'ton') return `₹${Math.round(numPrice * 10).toLocaleString()}/ton`
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
    <div className={`min-h-screen font-sans selection:bg-emerald-200 selection:text-emerald-900 transition-colors duration-300 ${
      isDark 
        ? 'bg-slate-900 text-slate-100' 
        : 'bg-[#F0FDF4]'
    }`}>
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
              { id: 'buyers', label: 'Find Buyers', icon: Handshake },
              { id: 'listings', label: 'My Listings', icon: Store }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => {
                  if (item.id === 'market-prices' && onNavigate) {
                    onNavigate('market-analysis')
                  } else {
                    setActiveLink(item.id)
                    const element = document.getElementById(item.id)
                    if (element) element.scrollIntoView({ behavior: 'smooth' })
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

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-all duration-300 backdrop-blur-xl shadow-xl shadow-emerald-900/5 border pointer-events-auto cursor-pointer ${
            isDark
              ? 'bg-slate-800/80 text-yellow-400 hover:bg-slate-700 border-slate-700/50'
              : 'bg-white/80 text-slate-700 hover:bg-white border-white/50'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </nav>

      {/* Top Spacing for fixed navbar */}
      <div className="h-28"></div>

      {/* Hero Section */}
      <section id="home" className={`relative mx-4 sm:mx-6 lg:mx-8 rounded-[2.5rem] overflow-hidden shadow-2xl mb-10 group transition-colors duration-300 ${
        isDark ? 'shadow-slate-900/20' : 'shadow-emerald-900/20'
      }`}>
        <div className={`absolute inset-0 ${isDark ? 'bg-slate-950' : 'bg-stone-900'}`}>
           <img src={farmerBg} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2s] ease-out" alt="Farmer Background" />
        </div>
        <div className={`absolute inset-0 ${isDark ? 'bg-linear-to-r from-slate-950/95 via-slate-900/60 to-transparent' : 'bg-linear-to-r from-emerald-950/90 via-emerald-900/40 to-transparent'}`}></div>
        <div className="relative py-16 px-8 md:px-16 max-w-4xl">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md border transition-colors duration-300 ${
            isDark
              ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-200'
              : 'bg-emerald-500/20 border-emerald-400/30 text-emerald-100'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-emerald-400' : 'bg-emerald-400'}`}></span>
            Live Market Data
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Smart Farming Starts with <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-200 to-teal-400">Real-Time Decisions</span>
          </h2>
          <p className={`text-lg mb-10 max-w-xl leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-emerald-100/80'
          }`}>
            Instantly access Mandi prices, connect with verified buyers, and maximize your harvest's value with AI-driven insights.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => document.getElementById('market-prices').scrollIntoView({ behavior: 'smooth' })}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/30 flex items-center gap-2"
            >
              <IndianRupee className="w-5 h-5" /> Check Prices
            </button>
            <button 
               onClick={() => document.getElementById('buyers').scrollIntoView({ behavior: 'smooth' })}
               className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <Handshake className="w-5 h-5" /> Find Buyers
            </button>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Weather Card */}
            <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
               <div className="relative z-10">
                 <div className="flex justify-between items-start mb-4">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        <Sun className="w-6 h-6 text-yellow-300" />
                    </div>
                    <span className="text-xs font-bold bg-blue-900/30 px-3 py-1 rounded-full">{userLocation || 'Karnataka'}</span>
                 </div>
                 <h3 className="text-3xl font-bold mb-1">28°C</h3>
                 <p className="text-blue-100 text-sm font-medium">Sunny • Humidity: 45%</p>
               </div>
               <Sun className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
            </div>

            {/* Trending Up */}
            <div className={`rounded-3xl p-6 border shadow-sm hover:shadow-md transition-all ${
              isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-100'
            }`}>
                <div className="flex items-center gap-3 mb-4">
                   <div className={`p-2.5 rounded-xl ${
                     isDark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                   }`}>
                      <TrendingUp className="w-5 h-5" />
                   </div>
                   <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Top Gainer</p>
                      <p className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>{topGainer?.commodity || 'Loading...'}</p>
                   </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-emerald-600">{topGainer ? `+${topGainer.changePercent}%` : '-'}</span>
                    <span className="text-xs font-bold text-emerald-600/70">price spread</span>
                </div>
            </div>

            {/* Trending Down */}
            <div className={`rounded-3xl p-6 border shadow-sm hover:shadow-md transition-all ${
              isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-100'
            }`}>
                <div className="flex items-center gap-3 mb-4">
                   <div className={`p-2.5 rounded-xl ${
                     isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600'
                   }`}>
                      <TrendingDown className="w-5 h-5" />
                   </div>
                   <div>
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Top Loser</p>
                      <p className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>{topLoser?.commodity || 'Loading...'}</p>
                   </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-red-600">{topLoser ? `${topLoser.changePercent}%` : '-'}</span>
                    <span className="text-xs font-bold text-red-600/70">price spread</span>
                </div>
            </div>

             {/* Mandi Activity */}
            <div className={`rounded-3xl p-6 relative overflow-hidden ${
              isDark ? 'bg-emerald-900/40 text-emerald-100' : 'bg-emerald-900 text-white'
            }`}>
                <div className="flex gap-4 items-center relative z-10">
                   <div>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-emerald-300' : 'text-emerald-300'}`}>Live Mandis</p>
                      <h3 className={`text-4xl font-bold mb-2 ${isDark ? 'text-emerald-100' : 'text-white'}`}>142</h3>
                      <p className={`text-xs ${isDark ? 'text-emerald-300/70' : 'text-emerald-400/80'}`}>Active markets reporting data today</p>
                   </div>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Building2 className="w-24 h-24" />
                </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Market Prices */}
          <div className="lg:col-span-2" id="market-prices">
            
            {/* Header & Controls */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                 <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    <div className="w-1 h-8 bg-emerald-500 rounded-full"></div>
                    Current Market Prices
                 </h2>
                 <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 ${
                   isDark 
                     ? 'bg-slate-800 text-slate-400' 
                     : 'bg-slate-100 text-slate-400'
                 }`}>
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                   Live Updates
                 </span>
              </div>
              
              <div className={`p-5 rounded-3xl shadow-xl border transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 shadow-slate-900/20'
                  : 'bg-white border-slate-100 shadow-slate-200/50'
              }`}>
                {userLocation && regionalCrops[userLocation] && (
                    <div className={`mb-6 pb-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <h3 className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}> Local Priority: {userLocation}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {regionalCrops[userLocation].map(c => (
                        <span key={c} className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border ${
                          isDark
                            ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-300'
                            : 'bg-emerald-50 border-emerald-100/50 text-emerald-700'
                        }`}>
                            {c}
                        </span>
                        ))}
                    </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Region Filter */}
                    <div className="relative w-full md:w-auto md:flex-1 group">
                        <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ml-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Region</label>
                        <select 
                        value={userLocation} 
                        onChange={(e) => setUserLocation(e.target.value)} 
                        className={`appearance-none w-full py-3.5 px-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold transition-all cursor-pointer border ${
                          isDark
                            ? userLocation 
                              ? 'bg-emerald-900/30 border-emerald-700/50 text-slate-100'
                              : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                            : userLocation
                              ? 'bg-emerald-50/50 border-emerald-200 text-slate-700'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                        >
                            <option value="">Global View</option>
                            {Object.keys(regionalCrops).sort().map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                        <div className={`pointer-events-none absolute bottom-3.5 right-0 flex items-center px-4 transition-colors ${isDark ? 'text-slate-500 group-hover:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-500'}`}>
                        <Globe className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Crop Filter */}
                    <div className="relative w-full md:w-auto md:flex-1 group">
                        <label className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ml-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Commodity</label>
                        <select 
                        value={selectedCrop} 
                        onChange={(e) => setSelectedCrop(e.target.value)} 
                        className={`appearance-none w-full py-3.5 px-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold transition-all cursor-pointer border ${
                          isDark
                            ? 'bg-slate-700 border-slate-600 text-slate-100 hover:border-slate-500'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                        >
                            {getUniqueValues('commodity').map(crop => (
                            <option key={crop} value={crop}>{crop === 'all' ? 'All Crops' : crop}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute bottom-3.5 right-0 flex items-center px-4 text-slate-400 group-hover:text-emerald-500 transition-colors">
                        <Leaf className="w-4 h-4" />
                        </div>
                    </div>
                    
                    {/* Unit Conversion */}
                    <div className={`w-full md:w-auto mt-6 md:mt-5 p-1 rounded-xl flex ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    {['kg', 'quintal', 'ton'].map(unit => (
                        <button 
                        key={unit}
                        onClick={() => setPriceUnit(unit)}
                        className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg capitalize transition-all duration-200 ${priceUnit === unit ? isDark ? 'bg-slate-800 shadow-sm text-emerald-300 ring-1 ring-black/5' : 'bg-white shadow-sm text-emerald-800 ring-1 ring-black/5' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                        {unit}
                        </button>
                    ))}
                    </div>
                </div>
              </div>
            </div>

            {/* Cards Grid - 3 Column Layout */}
            <div className="h-200 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-emerald-200 hover:scrollbar-thumb-emerald-300 transition-colors">
            {loading ? (
                <div className="py-32 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                       <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-slate-500 font-bold animate-pulse tracking-wide">Fetching latest market rates...</p>
                </div>
            ) : activeCommodity ? (
              /* Detail View for a Specific Commodity */
              <div className="animate-in fade-in duration-500">
                <button 
                  onClick={() => setActiveCommodity(null)}
                  className={`mb-8 flex items-center gap-2 font-bold px-4 py-2 rounded-xl transition-all group ${isDark ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-700' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>
                <div className={`mb-8 flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-3xl shadow-lg border relative overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700 shadow-slate-900/20' : 'bg-white border-emerald-50 shadow-emerald-900/5'}`}>
                   <div className={`absolute top-0 right-0 p-3 opacity-10 ${isDark ? 'text-slate-700' : 'text-emerald-900'}`}>
                      <Sprout className="w-32 h-32" />
                   </div>
                   <div className="relative flex items-center gap-5">
                     <div className={`w-20 h-20 rounded-2xl overflow-hidden shadow-md ring-4 border relative ${isDark ? 'ring-slate-700 border-slate-600 bg-slate-700' : 'ring-white border-slate-100 bg-slate-100'}`}>
                        {activeImageError && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Leaf className="w-8 h-8 text-emerald-600" />
                          </div>
                        )}
                        <img 
                          src={getCropImage(activeCommodity)} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          alt={activeCommodity} 
                          onLoad={() => setActiveImageError(false)}
                          onError={() => setActiveImageError(true)}
                        />
                     </div>
                     <div>
                       <h3 className={`text-3xl font-bold tracking-tight mb-1 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{activeCommodity}</h3>
                       <p className={`font-medium flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                         <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                         Market Intelligence Report
                       </p>
                     </div>
                   </div>
                   <div className="sm:ml-auto flex items-center gap-3">
                     <div className="px-5 py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Listings</p>
                        <p className="text-2xl font-bold text-emerald-900 leading-none">{filteredPrices.filter(i => i.commodity === activeCommodity).length}</p>
                     </div>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPrices.filter(c => c.commodity === activeCommodity).map((crop, index) => (
                    <div key={index} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 border border-slate-100 hover:border-emerald-200 transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-emerald-50 transition-colors">
                            <MapPin className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                                {crop.variety}
                            </span>
                        </div>
                        
                        <div className="mb-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{crop.district}</p>
                            <h4 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1" title={crop.market}>{crop.market}</h4>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-50 flex items-end justify-between">
                            <div>
                                <p className="text-xs text-slate-400 font-bold mb-1">Current Price</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-emerald-700">{formatPrice(crop.modal_price).split('/')[0]}</span>
                                    <span className="text-xs font-bold text-slate-400">/{priceUnit}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-medium mb-0.5">Max</p>
                                <p className="text-sm font-bold text-slate-600">{formatPrice(crop.max_price).split('/')[0]}</p>
                            </div>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Collection View: Unique Commodities */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {[...new Set(filteredPrices.map(item => item.commodity))]
                  .map((commodityName, index) => {
                    const count = filteredPrices.filter(p => p.commodity === commodityName).length
                    const prices = filteredPrices.filter(p => p.commodity === commodityName).map(p => parseFloat(p.modal_price)).filter(p => !isNaN(p));
                    const avgPrice = prices.length ? (prices.reduce((a,b)=>a+b,0)/prices.length) : 0;
                    
                    return (
                    <div 
                      key={index} 
                      onClick={() => setActiveCommodity(commodityName)}
                      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col group cursor-pointer relative"
                    >
                      {/* Card Image */}
                      <div className="h-56 w-full relative overflow-hidden bg-slate-100">
                        {imageErrors[commodityName] && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Leaf className="w-14 h-14 text-emerald-600" />
                          </div>
                        )}
                        <img 
                          src={getCropImage(commodityName)} 
                          alt={commodityName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onLoad={() => setImageErrors(prev => ({ ...prev, [commodityName]: false }))}
                          onError={() => setImageErrors(prev => ({ ...prev, [commodityName]: true }))}
                        />
                         <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                         
                         {/* Overlay Content */}
                       
                         <div className="absolute bottom-0 left-0 p-6 w-full">
                            <h3 className="text-2xl font-bold text-white mb-2 leading-tight drop-shadow-md group-hover:text-emerald-300 transition-colors">{commodityName}</h3>
                            <div className="flex items-center gap-3">
                               <span className="flex items-center gap-1.5 text-white/90 text-[10px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                                  <Building2 className="w-3 h-3" /> {count} Market{count !== 1 ? 's' : ''}
                               </span>
                            </div>
                         </div>
                     
                      </div>

                      {/* Card Body - Footer Stats */}
                      <div className="p-5 flex justify-between items-center bg-white">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Avg Market Price</p>
                            <p className="text-xl font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">{formatPrice(avgPrice).split('/')[0]} <span className="text-xs font-semibold text-slate-400">/{priceUnit}</span></p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-500 transition-all duration-300">
                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white rotate-180 transition-colors" />
                          </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {/* Empty State */}
            {!loading && filteredPrices.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                          <Filter className="h-8 w-8 text-slate-300"/>
                      </div>
                      <p className="text-slate-500 font-medium mb-2">No prices found for standard crops.</p>
                      <button onClick={() => {setSelectedCrop('all'); setSelectedLocation('all')}} className="text-sm text-emerald-600 font-bold hover:text-emerald-700 transition-colors">Clear All Filters</button>
                  </div>
            )}
            </div>
          </div>

          {/* Right Column - Buyers */}
          <div id="buyers">
            <div className={`rounded-3xl shadow-xl p-6 border sticky top-24 transition-colors ${isDark ? 'bg-slate-800 border-slate-700 shadow-slate-900/20' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
              <div className="flex items-center justify-between mb-6">
                 <h2 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Verified Buyers</h2>
                 <a href="#" className="text-xs font-bold text-emerald-600 hover:underline">View All</a>
              </div>

              <div className="space-y-4">
                {buyers.map((buyer) => (
                  <div key={buyer.id} className={`group rounded-2xl p-5 border transition-all duration-300 cursor-pointer ${isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-emerald-600' : 'bg-slate-50 border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 hover:shadow-md'}`}>
                    <div className="flex justify-between items-start mb-2">
                       <h3 className={`font-bold transition-colors ${isDark ? 'text-slate-100 group-hover:text-emerald-300' : 'text-slate-800 group-hover:text-emerald-800'}`}>{buyer.name}</h3>
                       <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${isDark ? 'bg-slate-600 border-slate-500 text-slate-300 group-hover:border-emerald-500 group-hover:text-emerald-300' : 'bg-white border-slate-200 text-slate-500 group-hover:border-emerald-200 group-hover:text-emerald-600'}`}>NEW</span>
                    </div>
                    <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{buyer.requirement}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                        <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isDark ? 'text-slate-400 group-hover:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-600/70'}`}>
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{buyer.location}</span>
                        </div>
                        <button className={`text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm border ${isDark ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white' : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white'}`}>
                        Connect
                        </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl text-white text-center">
                  <p className="font-bold mb-2">Want to sell directly?</p>
                  <button className="w-full bg-white text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-50 transition shadow-lg shadow-emerald-900/20">
                    List Your Produce
                  </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
         
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
