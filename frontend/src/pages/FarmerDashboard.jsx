import { TrendingUp, MapPin, ArrowLeft, Leaf, IndianRupee, Filter, Globe, TrendingDown, Building2, CalendarDays, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import AppNav from '../components/ui/AppNav'
import Footer from '../components/ui/Footer'
import Slip from '../components/ui/Slip'
import StampBadge from '../components/ui/StampBadge'
import Button from '../components/ui/Button'
import CommodityLabel from '../components/ui/CommodityLabel'
import { API_BASE } from '../config/api'
import { translateCommodity } from '../i18n/commodityNames'
import { getProductImagePath, getProductImageSrcSet } from '../data/productImages'

const REGION_STORAGE_KEY = 'kisansetu_farmer_region'
const REGION_PROMPTED_KEY = 'kisansetu_farmer_region_prompted'

export default function FarmerDashboard({ onNavigate, onLogout }) {
  const { t, i18n } = useTranslation()
  const cropLabel = (name) => translateCommodity(name, i18n.language)
  const [selectedCrop, setSelectedCrop] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [userLocation, setUserLocation] = useState(() => localStorage.getItem(REGION_STORAGE_KEY) || '')
  const [showLocationPrompt, setShowLocationPrompt] = useState(() => !localStorage.getItem(REGION_PROMPTED_KEY))
  const [promptRegion, setPromptRegion] = useState('')
  const [marketPrices, setMarketPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [priceUnit, setPriceUnit] = useState('kg')
  const [activeCommodity, setActiveCommodity] = useState(null)
  const [imageErrors, setImageErrors] = useState({})
  const [topGainer, setTopGainer] = useState(null)
  const [topLoser, setTopLoser] = useState(null)
  const [activeImageError, setActiveImageError] = useState(false)
  const [fetchFailed, setFetchFailed] = useState(false)

  const fetchMarketData = async () => {
    setLoading(true)
    setFetchFailed(false)
    try {
      const response = await axios.get(`${API_BASE}/market-prices?limit=200`)
      if (response.data.success) {
        setMarketPrices(response.data.records)
      } else {
        setFetchFailed(true)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setFetchFailed(true)
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

  // Image lookup — local optimised WebP only. Previously any commodity
  // without a local photo fell back to hotlinking loremflickr.com, which
  // meant a third-party request per card and a blank tile whenever the
  // user was offline or that service was slow. Commodities with no photo
  // now render the ledger-styled placeholder below instead.
  const getCropImage = (cropName) => getProductImagePath(cropName)

  // Both derived from the data already loaded — previously these were a
  // hardcoded "142" and a fabricated 28°C weather reading with no weather
  // integration behind it.
  const reportingMandis = new Set(marketPrices.map((p) => p.market).filter(Boolean)).size
  const priceDate = marketPrices[0]?.arrival_date || null

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

  const handleRegionChange = (value) => {
    setUserLocation(value)
    if (value) localStorage.setItem(REGION_STORAGE_KEY, value)
    else localStorage.removeItem(REGION_STORAGE_KEY)
  }

  const handlePromptContinue = () => {
    if (promptRegion) handleRegionChange(promptRegion)
    localStorage.setItem(REGION_PROMPTED_KEY, '1')
    setShowLocationPrompt(false)
  }

  const handlePromptSkip = () => {
    localStorage.setItem(REGION_PROMPTED_KEY, '1')
    setShowLocationPrompt(false)
  }

  const navLinks = [
    { id: 'home', label: t('dash.navHome'), href: 'farmer-dashboard', onClick: (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) } },
    { id: 'market-prices', label: t('dash.navMarket'), href: 'market-analysis', onClick: (e) => { e.preventDefault(); onNavigate('market-analysis') } },
    { id: 'chats', label: t('dash.navChats'), href: 'chats', onClick: (e) => { e.preventDefault(); onNavigate('chats') } },
    { id: 'listings', label: t('dash.navListings'), href: 'my-listings', onClick: (e) => { e.preventDefault(); onNavigate('my-listings') } },
  ]

  return (
    <div className="ledger-scope min-h-screen bg-paper">
      <AppNav links={navLinks} active="home" onLogout={onLogout} />

      {showLocationPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4">
          <Slip className="w-full max-w-md p-8">
            <p className="font-ledger text-xs uppercase tracking-[0.2em] text-maroon">
              {t('dash.locationPromptEyebrow')}
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              {t('dash.locationPromptTitle')}
            </h2>
            <p className="mt-3 text-sm text-ink/60">
              {t('dash.locationPromptSub')}
            </p>

            <label className="mt-6 block">
              <span className="mb-1 block font-ledger text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                {t('dash.region')}
              </span>
              <div className="flex items-center gap-2 border-b-2 border-ink/25 pb-2">
                <Globe className="h-4 w-4 text-ink/40" />
                <select
                  value={promptRegion}
                  onChange={(e) => setPromptRegion(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent font-body text-sm focus:outline-none"
                >
                  <option value="">{t('dash.globalView')}</option>
                  {Object.keys(regionalCrops).sort().map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </label>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={handlePromptContinue} className="flex-1">
                {t('dash.locationPromptContinue')}
              </Button>
              <Button variant="outline" onClick={handlePromptSkip} className="flex-1">
                {t('dash.locationPromptSkip')}
              </Button>
            </div>
          </Slip>
        </div>
      )}

      {/* Entry header */}
      <section className="ledger-rule bg-maroon text-paper">
        <div className="mx-auto max-w-6xl px-8 py-10 sm:pl-16">
          <p className="font-ledger text-xs uppercase tracking-[0.2em] text-brass-light">
            {t('farmer.liveMarketData')}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            {t('farmer.smartFarmingPart1')} {t('farmer.smartFarmingPart2')}
          </h1>
          <p className="mt-3 max-w-xl text-paper/80">{t('farmer.smartFarmingDesc')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('market-analysis')}
              className="inline-flex items-center gap-2 rounded-sm bg-brass px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brass-light"
            >
              <IndianRupee className="h-4 w-4" /> {t('farmer.checkPrices')}
            </button>
            <button
              onClick={() => onNavigate('my-listings')}
              className="inline-flex items-center gap-2 rounded-sm border border-paper/30 px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-paper/10"
            >
              {t('farmer.findBuyers')}
            </button>
          </div>
        </div>
      </section>

      {/* Tallies */}
      <section className="ledger-rule bg-paper-dim">
        <div className="mx-auto max-w-6xl px-8 py-8 sm:pl-16">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-ink/10 bg-ink/10 sm:grid-cols-4">
            <div className="flex items-center justify-between gap-3 bg-paper px-5 py-4">
              <div>
                <p className="font-ledger text-xs uppercase tracking-wide text-ink/70">{t('dash.priceDateLabel')}</p>
                <p className="mt-1 font-display text-2xl font-semibold">{priceDate || '—'}</p>
                <p className="text-xs text-ink/70">{userLocation || t('dash.globalView')}</p>
              </div>
              <CalendarDays className="h-6 w-6 shrink-0 text-brass" />
            </div>
            <div className="bg-paper px-5 py-4">
              <p className="flex items-center gap-1.5 font-ledger text-[11px] uppercase tracking-wide text-ink/50">
                <TrendingUp className="h-3.5 w-3.5 text-leaf" /> {t('dash.topGainer')}
              </p>
              <p className="mt-1 font-display text-lg font-semibold">{topGainer ? <CommodityLabel name={topGainer.commodity} /> : '—'}</p>
              <p className="text-xs font-semibold text-leaf">{topGainer ? `+${topGainer.changePercent}%` : ''}</p>
            </div>
            <div className="bg-paper px-5 py-4">
              <p className="flex items-center gap-1.5 font-ledger text-[11px] uppercase tracking-wide text-ink/50">
                <TrendingDown className="h-3.5 w-3.5 text-rule" /> {t('dash.topLoser')}
              </p>
              <p className="mt-1 font-display text-lg font-semibold">{topLoser ? <CommodityLabel name={topLoser.commodity} /> : '—'}</p>
              <p className="text-xs font-semibold text-rule">{topLoser ? `${topLoser.changePercent}%` : ''}</p>
            </div>
            <div className="bg-paper px-5 py-4">
              <p className="flex items-center gap-1.5 font-ledger text-[11px] uppercase tracking-wide text-ink/50">
                <Building2 className="h-3.5 w-3.5 text-maroon" /> {t('dash.liveMandis')}
              </p>
              <p className="mt-1 font-display text-2xl font-semibold">{reportingMandis || '—'}</p>
              <p className="text-xs text-ink/70">{t('dash.reportingToday')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Market prices */}
      <section className="ledger-rule bg-paper">
        <div className="mx-auto max-w-6xl px-8 py-10 sm:pl-16">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold">{t('dash.currentPrices')}</h2>
            {priceDate && <StampBadge label={t('dash.stampGovt')} sublabel={priceDate} />}
          </div>

          <div className="mt-6 rounded-sm border border-ink/15 bg-paper/60 p-5">
            {userLocation && regionalCrops[userLocation] && (
              <div className="mb-5 border-b border-ink/10 pb-5">
                <p className="flex items-center gap-2 font-ledger text-[11px] uppercase tracking-wide text-ink/60">
                  <MapPin className="h-3.5 w-3.5" /> {t('dash.localPriority', { location: userLocation })}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {regionalCrops[userLocation].map((c) => (
                    <span key={c} className="rounded-sm bg-leaf px-2.5 py-1 text-xs font-semibold text-paper">
                      <CommodityLabel name={c} />
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <label className="block flex-1">
                <span className="mb-1 block font-ledger text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">{t('dash.region')}</span>
                <div className="flex items-center gap-2 border-b-2 border-ink/25 pb-2">
                  <Globe className="h-4 w-4 text-ink/40" />
                  <select
                    value={userLocation}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className="w-full bg-transparent font-body text-sm focus:outline-none"
                  >
                    <option value="">{t('dash.globalView')}</option>
                    {Object.keys(regionalCrops).sort().map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="block flex-1">
                <span className="mb-1 block font-ledger text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">{t('listings.commodity')}</span>
                <div className="flex items-center gap-2 border-b-2 border-ink/25 pb-2">
                  <Leaf className="h-4 w-4 text-leaf" />
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full bg-transparent font-body text-sm focus:outline-none"
                  >
                    {getUniqueValues('commodity').map((crop) => (
                      <option key={crop} value={crop}>{crop === 'all' ? t('dash.allCrops') : cropLabel(crop)}</option>
                    ))}
                  </select>
                </div>
              </label>

              <div className="flex rounded-sm border border-ink/15 p-1">
                {['kg', 'quintal', 'ton'].map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setPriceUnit(unit)}
                    className={`flex-1 rounded-sm px-3 py-1.5 font-ledger text-xs font-semibold uppercase transition-colors sm:flex-none ${
                      priceUnit === unit ? 'bg-maroon text-paper' : 'text-ink/60 hover:text-ink'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            {loading ? (
              <p className="py-16 text-center font-ledger text-sm uppercase tracking-wide text-ink/50">
                {t('dash.fetchingRates')}
              </p>
            ) : fetchFailed ? (
              <div className="flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-rule/30 py-16">
                <AlertCircle className="mb-3 h-6 w-6 text-rule" />
                <p className="mb-2 text-ink/60">{t('common.fetchError')}</p>
                <button onClick={fetchMarketData} className="text-sm font-semibold text-maroon hover:underline">
                  {t('common.retry')}
                </button>
              </div>
            ) : activeCommodity ? (
              <div>
                <button
                  onClick={() => setActiveCommodity(null)}
                  className="mb-6 inline-flex items-center gap-2 font-semibold text-ink/70 hover:text-maroon"
                >
                  <ArrowLeft className="h-4 w-4" /> {t('dash.backToAllCrops')}
                </button>
                <Slip className="mb-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-ink/15 bg-paper-dim">
                    {getCropImage(activeCommodity) && !activeImageError ? (
                      <img
                        src={getCropImage(activeCommodity)}
                        width="64"
                        height="64"
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                        alt=""
                        onError={() => setActiveImageError(true)}
                      />
                    ) : (
                      <Leaf className="h-6 w-6 text-ink/25" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold"><CommodityLabel name={activeCommodity} /></h3>
                    <p className="text-sm text-ink/60">{t('dash.marketIntelReport')}</p>
                  </div>
                  <div className="sm:ml-auto">
                    <p className="font-ledger text-[11px] uppercase tracking-wide text-ink/50">{t('dash.listingsLabel')}</p>
                    <p className="font-ledger text-2xl font-semibold tabular-nums text-maroon">
                      {filteredPrices.filter((i) => i.commodity === activeCommodity).length}
                    </p>
                  </div>
                </Slip>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPrices.filter((c) => c.commodity === activeCommodity).map((crop, index) => (
                    <Slip key={index} className="p-5">
                      <div className="flex items-start justify-between">
                        <MapPin className="h-4 w-4 text-ink/40" />
                        <span className="font-ledger text-[10px] uppercase tracking-wide text-ink/50">{crop.variety}</span>
                      </div>
                      <p className="mt-3 font-ledger text-[10px] uppercase tracking-wide text-ink/45">{crop.district}</p>
                      <h4 className="font-display text-lg font-semibold leading-tight" title={crop.market}>{crop.market}</h4>
                      <div className="mt-4 flex items-end justify-between border-t border-ink/10 pt-3">
                        <div>
                          <p className="text-xs text-ink/50">{t('dash.currentPrice')}</p>
                          <p className="font-ledger text-xl font-semibold tabular-nums text-maroon">
                            {formatPrice(crop.modal_price).split('/')[0]}
                            <span className="ml-1 text-xs font-normal text-ink/50">/{priceUnit}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-ink/50">{t('dash.max')}</p>
                          <p className="font-ledger text-sm font-semibold tabular-nums">{formatPrice(crop.max_price).split('/')[0]}</p>
                        </div>
                      </div>
                    </Slip>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[...new Set(filteredPrices.map((item) => item.commodity))].map((commodityName, index) => {
                  const count = filteredPrices.filter((p) => p.commodity === commodityName).length
                  const prices = filteredPrices.filter((p) => p.commodity === commodityName).map((p) => parseFloat(p.modal_price)).filter((p) => !isNaN(p))
                  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0

                  const cropImage = getCropImage(commodityName)

                  return (
                    <Slip
                      key={commodityName}
                      onClick={() => setActiveCommodity(commodityName)}
                      className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                    >
                      {/* Fixed height + width/height on the img so the grid
                          doesn't reflow as lazy images arrive. */}
                      <div className="flex h-32 w-full items-center justify-center overflow-hidden bg-paper-dim">
                        {cropImage && !imageErrors[commodityName] ? (
                          <img
                            src={cropImage}
                            srcSet={getProductImageSrcSet(commodityName) || undefined}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                            alt=""
                            width="400"
                            height="128"
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                            onError={() => setImageErrors((prev) => ({ ...prev, [commodityName]: true }))}
                          />
                        ) : (
                          <Leaf className="h-8 w-8 text-ink/20" aria-hidden="true" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-display text-lg font-semibold leading-tight"><CommodityLabel name={commodityName} /></h3>
                        <p className="mt-1 text-xs text-ink/50">{t('dash.marketCount', { count })}</p>
                        <div className="mt-3 flex items-end justify-between border-t border-ink/10 pt-3">
                          <p className="font-ledger text-lg font-semibold tabular-nums text-maroon">
                            {formatPrice(avgPrice).split('/')[0]}
                            <span className="ml-1 text-xs font-normal text-ink/50">/{priceUnit}</span>
                          </p>
                          <ArrowLeft className="h-4 w-4 rotate-180 text-ink/30" />
                        </div>
                      </div>
                    </Slip>
                  )
                })}
              </div>
            )}

            {!loading && filteredPrices.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-ink/15 py-16">
                <Filter className="mb-3 h-6 w-6 text-ink/30" />
                <p className="mb-2 text-ink/60">{t('dash.noPricesFound')}</p>
                <button
                  onClick={() => { setSelectedCrop('all'); setSelectedLocation('all') }}
                  className="text-sm font-semibold text-maroon hover:underline"
                >
                  {t('dash.clearFilters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
