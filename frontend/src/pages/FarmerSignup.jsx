import { Sprout, Mail, Lock, User, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { authService } from '../services/authService'

export default function FarmerSignup({ onNavigate }) {
  const { isDark, toggleTheme } = useTheme()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill all fields')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (!agreed) {
      setError('Please agree to the Terms of Service')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const result = await authService.farmerSignup(name, email, password)
      
      if (result.user) {
        setSuccessMessage('Signup successful! Redirecting to login...')
        setName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setAgreed(false)
        setTimeout(() => {
          onNavigate('farmer-login')
        }, 1500)
      } else {
        setError(result.message || 'Signup failed')
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError(error.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center py-8 transition-colors duration-300 ${
      isDark ? 'bg-slate-900' : 'bg-linear-to-br from-green-50 via-white to-green-50'
    }`}>
      <div className="fixed top-6 left-6 z-50 flex items-center gap-2">
        <Sprout className="w-8 h-8 text-green-600" />
        <h2 className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>KisanSetu</h2>
      </div>

      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-all duration-300 ${
            isDark
              ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button 
          onClick={() => onNavigate('home')}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
        >
          ← Back
        </button>
      </div>

      <div className="w-full max-w-md px-4">
        <div className={`rounded-3xl shadow-2xl border p-6 w-full transition-colors duration-300 ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-green-100'
        }`}>
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Farmer Signup</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Create your farm account</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-green-600" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-green-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-green-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-green-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}

            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-1 border-green-300 rounded" 
              />
              <label className="text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                  Terms & Conditions
                </a>
                {' '}and{' '}
                <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Farmer Account'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="#farmer-login" className="text-green-600 hover:text-green-700 font-medium">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}