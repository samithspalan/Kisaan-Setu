import { useState, useEffect } from 'react'
import { Plus, IndianRupee, MapPin, Trash2, Calendar, Leaf, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import AppNav from '../components/ui/AppNav'
import Footer from '../components/ui/Footer'
import Slip from '../components/ui/Slip'
import Field from '../components/ui/Field'
import Button from '../components/ui/Button'
import { API_BASE } from '../config/api'

export default function MyListings({ onNavigate, onLogout }) {
  const { t } = useTranslation()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [marketAvgPrice, setMarketAvgPrice] = useState(null)
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [fetchFailed, setFetchFailed] = useState(false)
  const [createError, setCreateError] = useState(false)
  const [formData, setFormData] = useState({
    commodity: '',
    variety: '',
    quantity: '',
    unit: 'kg',
    expectedPrice: '',
    description: '',
    location: ''
  })

  useEffect(() => {
    fetchListings()
  }, [])

  // Market average price when commodity changes (debounced live lookup).
  useEffect(() => {
    if (!formData.commodity || formData.commodity.length < 3) {
      setMarketAvgPrice(null)
      return
    }

    setFetchingPrice(true)
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_BASE}/market-prices?commodity=${encodeURIComponent(formData.commodity)}&limit=50`
        )
        const data = await response.json()

        const prices = (data.records || [])
          .map(r => parseFloat(r.modal_price))
          .filter(p => !isNaN(p) && p > 0)

        if (prices.length > 0) {
          const avgPricePerQuintal = prices.reduce((a, b) => a + b, 0) / prices.length
          setMarketAvgPrice(Math.round(avgPricePerQuintal / 100))
        } else {
          setMarketAvgPrice(null)
        }
      } catch (error) {
        console.error('Error fetching market price:', error)
        setMarketAvgPrice(null)
      } finally {
        setFetchingPrice(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.commodity])

  const fetchListings = async () => {
    try {
      setLoading(true)
      setFetchFailed(false)
      const response = await axios.get(`${API_BASE}/listings/my-listings`, {
        withCredentials: true
      })
      if (response.data.success) {
        setListings(response.data.listings)
      } else {
        setFetchFailed(true)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
      setFetchFailed(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCreateError(false)
    try {
      const response = await axios.post(`${API_BASE}/listings/create`, formData, {
        withCredentials: true
      })
      if (response.data.success) {
        setListings([response.data.listing, ...listings])
        setShowCreateForm(false)
        setFormData({
          commodity: '',
          variety: '',
          quantity: '',
          unit: 'kg',
          expectedPrice: '',
          description: '',
          location: ''
        })
      } else {
        setCreateError(true)
      }
    } catch (error) {
      console.error('Error creating listing:', error)
      setCreateError(true)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(t('dash.deleteConfirm'))) return

    try {
      const response = await axios.delete(`${API_BASE}/listings/${id}`, {
        withCredentials: true
      })
      if (response.data.success) {
        setListings(listings.filter(listing => listing._id !== id))
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
    }
  }

  const navLinks = [
    { id: 'home', label: t('dash.navHome'), href: 'farmer-dashboard', onClick: (e) => { e.preventDefault(); onNavigate('farmer-dashboard') } },
    { id: 'market-prices', label: t('dash.navMarket'), href: 'market-analysis', onClick: (e) => { e.preventDefault(); onNavigate('market-analysis') } },
    { id: 'chats', label: t('dash.navChats'), href: 'chats', onClick: (e) => { e.preventDefault(); onNavigate('chats') } },
    { id: 'listings', label: t('dash.navListings'), href: 'my-listings', onClick: (e) => e.preventDefault() },
  ]

  const priceNote = (() => {
    if (!formData.expectedPrice || !marketAvgPrice) return null
    const expected = parseFloat(formData.expectedPrice)
    const diff = Math.round(((marketAvgPrice - expected) / marketAvgPrice) * 100)
    if (expected < marketAvgPrice) return { text: t('dash.belowMarketNote', { percent: diff }), tone: 'good' }
    if (expected > marketAvgPrice) return { text: t('dash.aboveMarketNote', { percent: -diff }), tone: 'warn' }
    return { text: t('dash.matchesMarketNote'), tone: 'neutral' }
  })()

  return (
    <div className="ledger-scope min-h-screen bg-paper">
      <AppNav links={navLinks} active="listings" onLogout={onLogout} />

      <section className="ledger-rule bg-paper">
        <div className="mx-auto max-w-6xl px-8 py-10 sm:pl-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-ledger text-xs uppercase tracking-[0.2em] text-rule">{t('dash.sellEyebrow')}</p>
              <h1 className="mt-2 font-display text-3xl font-semibold">{t('listings.title')}</h1>
              <p className="mt-1 text-ink/60">{t('dash.myListingsSub')}</p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4" /> {t('listings.createNew')}
            </Button>
          </div>

          {showCreateForm && (
            <Slip className="mt-6 p-6">
              <h2 className="font-display text-xl font-semibold">{t('dash.newListing')}</h2>
              <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field
                  label={t('listings.commodity')}
                  placeholder="Tomato"
                  value={formData.commodity}
                  onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                  required
                />
                <Field
                  label={t('listings.variety')}
                  placeholder="Hybrid"
                  value={formData.variety}
                  onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                />
                <Field
                  label={t('dash.fieldQuantity')}
                  type="number"
                  min="0"
                  step="any"
                  placeholder="400"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  trailing={
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="bg-transparent font-ledger text-xs uppercase text-ink/60 focus:outline-none"
                    >
                      <option value="kg">kg</option>
                      <option value="quintal">quintal</option>
                      <option value="ton">ton</option>
                    </select>
                  }
                />
                <Field
                  label={t('dash.fieldExpectedPrice')}
                  type="number"
                  min="0"
                  step="any"
                  placeholder="26"
                  value={formData.expectedPrice}
                  onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                  required
                />

                {formData.commodity.length >= 3 && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-ink/60">
                      {t('dash.marketAvgFor')} <span className="font-semibold text-ink">{formData.commodity}</span>
                    </p>
                    {fetchingPrice ? (
                      <p className="mt-1 text-sm text-ink/50">{t('dash.checking')}</p>
                    ) : marketAvgPrice ? (
                      <div className="mt-1 flex flex-wrap items-baseline gap-3">
                        <p className="font-ledger text-2xl font-semibold tabular-nums text-maroon">
                          &#8377;{marketAvgPrice}<span className="ml-1 text-sm font-normal text-ink/50">{t('dash.perKg')}</span>
                        </p>
                        {priceNote && (
                          <span className={`border-l-2 pl-2 text-sm font-medium ${
                            priceNote.tone === 'good' ? 'border-leaf text-leaf' :
                            priceNote.tone === 'warn' ? 'border-brass text-ink/80' : 'border-ink/30 text-ink/60'
                          }`}>
                            {priceNote.text}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-ink/50">{t('dash.noMarketData')}</p>
                    )}
                  </div>
                )}

                <Field
                  label={t('listings.location')}
                  placeholder="Udupi"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block font-ledger text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                    {t('listings.description')}
                  </span>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full border-b-2 border-ink/25 bg-transparent py-2 font-body text-base focus:border-maroon focus:outline-none"
                  />
                </label>

                {createError && (
                  <p className="flex items-center gap-2 text-sm font-medium text-rule md:col-span-2">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {t('common.fetchError')}
                  </p>
                )}

                <div className="flex gap-3 md:col-span-2">
                  <Button type="submit" variant="primary">{t('dash.createListingBtn')}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>{t('dash.cancel')}</Button>
                </div>
              </form>
            </Slip>
          )}
        </div>
      </section>

      <section className="ledger-rule bg-paper">
        <div className="mx-auto max-w-6xl px-8 pb-14 sm:pl-16">
          {loading ? (
            <p className="py-16 text-center font-ledger text-sm uppercase tracking-wide text-ink/50">{t('common.loading')}</p>
          ) : fetchFailed ? (
            <div className="flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-rule/30 py-16">
              <AlertCircle className="mb-3 h-6 w-6 text-rule" />
              <p className="mb-2 text-ink/60">{t('common.fetchError')}</p>
              <button onClick={fetchListings} className="text-sm font-semibold text-maroon hover:underline">
                {t('common.retry')}
              </button>
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-ink/15 py-16">
              <Leaf className="mb-3 h-8 w-8 text-ink/25" />
              <p className="text-ink/60">{t('listings.noListings')}</p>
            </div>
          ) : (
            <>
              <p className="mb-4 font-ledger text-xs uppercase tracking-wide text-ink/50">
                {t('dash.listingCount', { count: listings.length })}
              </p>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <Slip key={listing._id} className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display text-lg font-semibold">{listing.commodity || 'N/A'}</h3>
                        {listing.variety && <p className="text-sm text-ink/60">{listing.variety}</p>}
                      </div>
                      <button
                        onClick={() => handleDelete(listing._id)}
                        aria-label={t('dash.deleteListing')}
                        className="rounded-sm p-1.5 text-ink/40 transition-colors hover:bg-rule/10 hover:text-rule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-ink/60">{t('dash.quantityLabel')}</span>
                        <span className="font-ledger font-semibold tabular-nums">{listing.quantity || 0} {listing.unit || 'kg'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-ink/60">{t('dash.expectedPriceLabel')}</span>
                        <span className="flex items-center font-ledger font-semibold tabular-nums text-maroon">
                          <IndianRupee className="h-3.5 w-3.5" />{listing.expectedPrice || 0}/{listing.unit || 'kg'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-ink/60">
                        <MapPin className="h-3.5 w-3.5" /> {listing.location || t('dash.notSpecified')}
                      </div>
                      {listing.description && (
                        <p className="border-t border-ink/10 pt-3 text-ink/70">{listing.description}</p>
                      )}
                      <div className="flex items-center gap-2 pt-1 text-xs text-ink/45">
                        <Calendar className="h-3.5 w-3.5" />
                        {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </Slip>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
