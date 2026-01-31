import { Sprout, Mail, Lock, Sun, Moon } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { authService } from '../services/authService'

export default function FarmerLogin({ onNavigate, onLoginSuccess }) {
  const { isDark, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const googleButtonRef = useRef(null)

  const handleGoogleLogin = async (response) => {
    try {
      const result = await authService.googleLogin(response.credential)
      
      if (result.user) {
        console.log('Google Login Success:', result.user)
        // Navigate to dashboard after success
        onLoginSuccess ? onLoginSuccess() : onNavigate('farmer-dashboard')
      }
    } catch (error) {
      console.error('Google Login Error:', error)
      setError('Google login failed. Please try again.')
    }
  }

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: "952084918159-7rumtd7e8ublui9pphgum4rtp4uo87o8.apps.googleusercontent.com",
        callback: handleGoogleLogin
      })
      
      google.accounts.id.renderButton(
        googleButtonRef.current,
        { theme: "outline", size: "large", width: "100%", text: "continue_with" } 
      )
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await authService.farmerLogin(email, password)
      
      if (result.user) {
        console.log('Login Success:', result.user)
        // Store userId in localStorage for messaging
        localStorage.setItem('userId', result.user._id)
        localStorage.setItem('userName', result.user.Username)
        // Clear form
        setEmail('')
        setPassword('')
        // Navigate to farmer dashboard
        onLoginSuccess ? onLoginSuccess() : onNavigate('farmer-dashboard')
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
    <div className={`min-h-screen flex items-center justify-center py-6 px-4 transition-colors duration-300 ${
      isDark 
        ? 'bg-slate-900' 
        : 'bg-linear-to-br from-green-50 via-white to-green-50'
    }`}>
      {/* Logo - Top left */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-2">
        <Sprout className="w-8 h-8 text-green-600" />
        <h2 className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>KisanSetu</h2>
      </div>

      {/* Back Button & Theme Toggle */}
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

      {/* Login Container */}
      <div className="w-full max-w-lg px-4">
        <div className={`rounded-3xl shadow-2xl border-2 p-6 w-full transition-colors duration-300 relative ${
          isDark
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-green-500'
        }`}
        style={{
          animation: isDark ? 'none' : 'greenGlow 2s ease-in-out infinite',
          boxShadow: `0 0 30px ${isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.4)'}`
        }}>
          <style>{`
            @keyframes greenGlow {
              0%, 100% { border-color: rgb(34, 197, 94); box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
              50% { border-color: rgb(16, 185, 129); box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); }
            }
          `}</style>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Farmer Login</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Access your farm dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-green-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                      : 'border-green-200 text-gray-900'
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
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-green-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                      : 'border-green-200 text-gray-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3.5 ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`p-4 rounded-lg text-sm font-medium ${
                isDark
                  ? 'bg-red-900/30 border border-red-700 text-red-300'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                <input type="checkbox" className={`w-4 h-4 rounded ${isDark ? 'bg-slate-700 border-slate-600' : 'border-green-300'}`} />
                <span>Remember me</span>
              </label>
              <a href="#" className={`font-medium hover:underline ${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'}`}>
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
              }`}
            >
              {loading ? 'Logging in...' : 'Login as Farmer'}
            </button>

            <div className={`mt-6 grid grid-cols-3 items-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
               <hr className={isDark ? 'border-slate-700' : 'border-green-100'} />
               <p className={`text-center text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>OR</p>
               <hr className={isDark ? 'border-slate-700' : 'border-green-100'} />
            </div>

            <div ref={googleButtonRef} className="w-full flex justify-center"></div>
          </form>

          {/* Signup Link */}
          <div className="text-center mt-4">
            <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  console.log('Signup button clicked, navigating to farmer-signup')
                  onNavigate('farmer-signup')
                }}
                className={`font-medium hover:underline ${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'}`}
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
