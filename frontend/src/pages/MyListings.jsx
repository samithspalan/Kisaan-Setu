import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Package, IndianRupee, MapPin, Trash2, Edit, Calendar, Leaf, Home, BarChart3, Bell, Store, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'

export default function MyListings({ onBack, onNavigate }) {
  const { isDark, toggleTheme } = useTheme()
  const [activeLink, setActiveLink] = useState('listings')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
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

  const fetchListings = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:8000/api/listings/my-listings', {
        withCredentials: true
      })
      if (response.data.success) {
        console.log('Fetched listings:', response.data.listings)
        console.log('Total listings count:', response.data.listings.length)
        setListings(response.data.listings)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:8000/api/listings/create', formData, {
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
      }
    } catch (error) {
      console.error('Error creating listing:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    
    try {
      const response = await axios.delete(`http://localhost:8000/api/listings/${id}`, {
        withCredentials: true
      })
      if (response.data.success) {
        setListings(listings.filter(listing => listing._id !== id))
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
    }
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
                  } else if (item.id === 'market-prices' && onNavigate) {
                    onNavigate('market-analysis')
                  } else if (item.id === 'chats' && onNavigate) {
                    onNavigate('chats')
                  } else if (item.id === 'listings') {
                    setActiveLink(item.id)
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-600">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                My Listings
              </h1>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Manage your crop listings
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>New Listing</span>
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className={`rounded-2xl p-6 mb-6 transition-colors duration-300 ${
            isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
          }`}>
            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Create New Listing
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Commodity *"
                value={formData.commodity}
                onChange={(e) => setFormData({...formData, commodity: e.target.value})}
                required
                className={`px-4 py-2 rounded-xl transition-colors ${
                  isDark ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'
                } border focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              <input
                type="text"
                placeholder="Variety"
                value={formData.variety}
                onChange={(e) => setFormData({...formData, variety: e.target.value})}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  isDark ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'
                } border focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Quantity *"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                  className={`flex-1 px-4 py-2 rounded-xl transition-colors ${
                    isDark ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'
                  } border focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                />
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    isDark ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'
                  } border focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                >
                  <option value="kg">kg</option>
                  <option value="quintal">quintal</option>
                  <option value="ton">ton</option>
                </select>
              </div>
              <input
                type="number"
                placeholder="Expected Price (₹) *"
                value={formData.expectedPrice}
                onChange={(e) => setFormData({...formData, expectedPrice: e.target.value})}
                required
                className={`px-4 py-2 rounded-xl transition-colors ${
                  isDark ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'
                } border focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              <input
                type="text"
                placeholder="Location *"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
                className={`px-4 py-2 rounded-xl transition-colors ${
                  isDark ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'
                } border focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                className={`md:col-span-2 px-4 py-2 rounded-xl transition-colors ${
                  isDark ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-300'
                } border focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
              />
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Create Listing
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className={`px-6 py-2 rounded-xl transition-colors ${
                    isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl ${
            isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
          }`}>
            <Leaf className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              No listings yet. Create your first listing!
            </p>
          </div>
        ) : (
          <>
            <div className={`mb-4 px-4 py-2 rounded-xl ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-700'}`}>
              Total Listings: {listings.length}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div
                  key={listing._id}
                  className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${
                    isDark ? 'bg-slate-900 border border-slate-800 hover:border-slate-700' : 'bg-white border border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-600/10">
                        <Leaf className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {listing.commodity || 'N/A'}
                        </h3>
                        {listing.variety && (
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {listing.variety}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(listing._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-red-950/30 text-red-400' : 'hover:bg-red-50 text-red-600'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Quantity:
                      </span>
                      <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {listing.quantity || 0} {listing.unit || 'kg'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Expected Price:
                      </span>
                      <span className="font-bold text-emerald-600 flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        {listing.expectedPrice || 0}/{listing.unit || 'kg'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <MapPin className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {listing.location || 'Not specified'}
                      </span>
                    </div>
                    {listing.description && (
                      <p className={`text-sm mt-3 pt-3 border-t ${
                        isDark ? 'text-slate-400 border-slate-800' : 'text-slate-600 border-slate-200'
                      }`}>
                        {listing.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}