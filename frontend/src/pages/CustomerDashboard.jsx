import { useState, useEffect } from 'react'
import { Search, MapPin, Mail, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import AppNav from '../components/ui/AppNav'
import Footer from '../components/ui/Footer'
import Slip from '../components/ui/Slip'
import FarmerLocationMap from '../components/FarmerLocationMap'
import CommodityLabel from '../components/ui/CommodityLabel'
import { API_BASE } from '../config/api'
import { translateCommodity } from '../i18n/commodityNames'

export default function CustomerDashboard({ onNavigate, onLogout }) {
  const { t, i18n } = useTranslation()
  const cropLabel = (name) => translateCommodity(name, i18n.language)
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showLocationMap, setShowLocationMap] = useState(false)
  const [selectedFarmerForMap, setSelectedFarmerForMap] = useState(null)
  const [fetchFailed, setFetchFailed] = useState(false)

  const fetchListings = async () => {
      setLoading(true)
      setFetchFailed(false)
      try {
        const response = await axios.get(`${API_BASE}/listings/all`, {
          withCredentials: true
        })

        if (response.data.success && response.data.listings) {
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

          const uniqueCommodities = [...new Set(transformedData.map(l => l.commodity))]
          const marketPrices = {}

          await Promise.all(
            uniqueCommodities.map(async (commodity) => {
              try {
                const apiResponse = await fetch(
                  `${API_BASE}/market-prices?commodity=${encodeURIComponent(commodity)}&limit=50`
                )
                const apiData = await apiResponse.json()

                if (apiData.records && apiData.records.length > 0) {
                  const prices = apiData.records
                    .map(r => parseFloat(r.modal_price))
                    .filter(p => !isNaN(p) && p > 0)

                  if (prices.length > 0) {
                    const avgPricePerQuintal = prices.reduce((a, b) => a + b, 0) / prices.length
                    marketPrices[commodity] = Math.round(avgPricePerQuintal / 100)
                  }
                }
              } catch (error) {
                console.error(`Error fetching market price for ${commodity}:`, error)
              }
            })
          )

          const dataWithAvgPrice = transformedData.map(listing => ({
            ...listing,
            avgMarketPrice: marketPrices[listing.commodity] || listing.expectedPrice
          }))

          setFarmers(dataWithAvgPrice)
        } else {
          setFetchFailed(true)
        }
      } catch (error) {
        console.error('Error fetching listings:', error)
        setFarmers([])
        setFetchFailed(true)
      } finally {
        setLoading(false)
      }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  const handleMessageClick = (farmer) => {
    localStorage.setItem('selectedChatFarmer', JSON.stringify({
      id: farmer.farmerId,
      name: farmer.name,
      location: farmer.location
    }))
    onNavigate?.('chats')
  }

  const handleViewLocation = (farmer) => {
    setSelectedFarmerForMap(farmer)
    setShowLocationMap(true)
  }

  const filteredFarmers = farmers.filter((farmer) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm ||
      farmer.name.toLowerCase().includes(term) ||
      farmer.crops.some((c) => c.toLowerCase().includes(term) || cropLabel(c).toLowerCase().includes(term)) ||
      farmer.location.toLowerCase().includes(term)
    const matchesCategory = selectedCategory === 'all'
    return matchesSearch && matchesCategory
  })

  const navLinks = [
    { id: 'home', label: t('dash.navHome'), href: 'customer-dashboard', onClick: (e) => e.preventDefault() },
    { id: 'chats', label: t('dash.navChats'), href: 'chats', onClick: (e) => { e.preventDefault(); onNavigate?.('chats') } },
  ]

  return (
    <div className="ledger-scope min-h-screen bg-paper">
      <AppNav links={navLinks} active="home" onLogout={onLogout} />

      <section className="ledger-rule bg-maroon text-paper">
        <div className="mx-auto max-w-6xl px-8 py-10 sm:pl-16">
          <p className="font-ledger text-xs uppercase tracking-[0.2em] text-brass-light">{t('dash.buyEyebrow')}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            {t('dash.buyHeroTitle')}
          </h1>
          <p className="mt-2 max-w-xl text-paper/80">
            {t('dash.buyHeroSub')}
          </p>
        </div>
      </section>

      <section className="ledger-rule bg-paper">
        <div className="mx-auto max-w-6xl px-8 py-8 sm:pl-16">
          <div className="flex flex-col gap-4 sm:flex-row">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-0 top-3 h-4 w-4 text-ink/40" />
              <input
                type="text"
                placeholder={t('dashboard.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-b-2 border-ink/25 bg-transparent py-2 pl-6 font-body text-base focus:border-maroon focus:outline-none"
              />
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border-b-2 border-ink/25 bg-transparent px-2 py-2 font-body text-sm focus:border-maroon focus:outline-none"
            >
              <option value="all">{t('dashboard.categories.all')}</option>
              <option value="vegetables">{t('dashboard.categories.vegetables')}</option>
              <option value="grains">{t('dashboard.categories.grains')}</option>
              <option value="fruits">{t('dashboard.categories.fruits')}</option>
              <option value="pulses">{t('dashboard.categories.pulses')}</option>
            </select>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p className="col-span-full py-16 text-center font-ledger text-sm uppercase tracking-wide text-ink/50">
                {t('common.loading')}
              </p>
            ) : fetchFailed ? (
              <div className="col-span-full flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-rule/30 py-16">
                <AlertCircle className="mb-3 h-6 w-6 text-rule" />
                <p className="mb-2 text-ink/60">{t('common.fetchError')}</p>
                <button onClick={fetchListings} className="text-sm font-semibold text-maroon hover:underline">
                  {t('common.retry')}
                </button>
              </div>
            ) : filteredFarmers.length > 0 ? (
              filteredFarmers.map((farmer) => (
                <Slip key={farmer.id} className="flex flex-col p-5">
                  <h3 className="font-display text-lg font-semibold">{farmer.name}</h3>

                  <div className="mt-3 space-y-1.5 text-sm text-ink/70">
                    <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-ink/40" /> {farmer.location}</p>
                    <p>
                      {farmer.crops.map((c, idx) => (
                        <span key={c + idx}>
                          <CommodityLabel name={c} />
                          {idx < farmer.crops.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ink/10 pt-4">
                    <div>
                      <p className="font-ledger text-[10px] uppercase tracking-wide text-ink/45">{t('dashboard.farmerCard.sellPrice')}</p>
                      <p className="font-ledger text-lg font-semibold tabular-nums text-maroon">
                        &#8377;{farmer.expectedPrice}<span className="text-xs font-normal text-ink/50">/{farmer.unit}</span>
                      </p>
                    </div>
                    <div>
                      <p className="font-ledger text-[10px] uppercase tracking-wide text-ink/45">{t('dashboard.farmerCard.marketAvg')}</p>
                      <p className="font-ledger text-lg font-semibold tabular-nums">
                        &#8377;{farmer.avgMarketPrice}<span className="text-xs font-normal text-ink/50">/{farmer.unit}</span>
                      </p>
                    </div>
                  </div>

                  {farmer.expectedPrice < farmer.avgMarketPrice ? (
                    <p className="mt-2 text-xs font-semibold text-leaf">
                      {Math.round(((farmer.avgMarketPrice - farmer.expectedPrice) / farmer.avgMarketPrice) * 100)}% {t('dashboard.farmerCard.belowMarket')}
                    </p>
                  ) : farmer.expectedPrice > farmer.avgMarketPrice ? (
                    <p className="mt-2 text-xs font-semibold text-rule">
                      {Math.round(((farmer.expectedPrice - farmer.avgMarketPrice) / farmer.avgMarketPrice) * 100)}% {t('dashboard.farmerCard.aboveMarket')}
                    </p>
                  ) : null}

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleMessageClick(farmer)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-maroon px-3 py-2 text-sm font-semibold text-paper transition-colors hover:bg-maroon-dark"
                    >
                      <Mail className="h-3.5 w-3.5" /> {t('dashboard.farmerCard.message')}
                    </button>
                    <button
                      onClick={() => handleViewLocation(farmer)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-ink/20 px-3 py-2 text-sm font-semibold text-ink/80 transition-colors hover:border-maroon hover:text-maroon"
                    >
                      <MapPin className="h-3.5 w-3.5" /> {t('common.location')}
                    </button>
                  </div>
                </Slip>
              ))
            ) : (
              <p className="col-span-full py-16 text-center text-ink/60">{t('dash.noFarmersFound')}</p>
            )}
          </div>
        </div>
      </section>

      <Footer />

      {showLocationMap && selectedFarmerForMap && (
        <FarmerLocationMap
          farmerLocation={selectedFarmerForMap.location}
          farmerName={selectedFarmerForMap.name}
          onClose={() => {
            setShowLocationMap(false)
            setSelectedFarmerForMap(null)
          }}
          isDark={false}
        />
      )}
    </div>
  )
}
