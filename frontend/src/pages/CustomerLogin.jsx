import { Sprout, Mail, Lock, ShoppingCart, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { authService } from '../services/authService'
import BorderAnimatedContainer from '../../components/BorderAnimatedContainer'

export default function CustomerLogin({ onNavigate, onLoginSuccess }) {
  const { isDark, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await authService.customerLogin(email, password)
      
      if (result.user) {
        console.log('Customer Login Success:', result.user)
        // Store userId in localStorage for messaging
        localStorage.setItem('userId', result.user._id)
        localStorage.setItem('userName', result.user.Username)
        // Clear form
        setEmail('')
        setPassword('')
        // Navigate to customer dashboard
        onLoginSuccess ? onLoginSuccess('customer') : onNavigate('customer-dashboard')
      } else {
        setError(result.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDark
        ? 'bg-slate-900'
        : 'bg-linear-to-br from-teal-50 via-white to-teal-50'
    }`}>
    
      <div className="fixed top-6 left-6 z-50 flex items-center gap-2">
        <Sprout className="w-8 h-8 text-teal-600" />
        <h2 className={`text-2xl font-bold ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>KisanSetu</h2>
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
        <a 
          href="#home"
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
        >
          ← Back
        </a>
      </div>

      <div className="w-full max-w-md px-4">
        <BorderAnimatedContainer>
          <div className={`rounded-3xl shadow-2xl border p-10 w-full transition-colors duration-300 ${
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-teal-100'
          }`}>
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-linear-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Customer Login</h1>
            <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>Buy fresh produce from farmers</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-teal-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-colors ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                      : 'border-teal-200 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-teal-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
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

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border-teal-300 rounded" />
                <span className={isDark ? 'text-slate-400' : 'text-gray-700'}>Remember me</span>
              </label>
              <a href="#" className="text-teal-600 hover:text-teal-700 font-medium">
                Forgot Password?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`p-3 rounded-lg text-sm font-medium ${
                isDark
                  ? 'bg-red-900/30 text-red-400 border border-red-800/50'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-linear-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                loading ? 'opacity-50' : ''
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Logging in...
                </>
              ) : (
                'Login as Customer'
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              New customer?{' '}
              <a href="#customer-signup" className="text-teal-600 hover:text-teal-700 font-medium">
                Create an account
              </a>
            </p>
          </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  )
}
