import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { authService } from './services/authService'

// Eager: the entry points an unauthenticated visitor can land on. Keeping
// these in the main chunk avoids a loading flash on first paint.
import HomePage from './pages/HomePage'
import FarmerLogin from './pages/FarmerLogin'
import CustomerLogin from './pages/CustomerLogin'
import FarmerSignup from './pages/FarmerSignup'
import CustomerSignup from './pages/CustomerSignup'

/*
 * Lazy: everything behind login. These pull in the heavy dependencies —
 * recharts (MarketAnalysis), leaflet (the map in CustomerDashboard) and
 * socket.io-client (chat). Previously all of it shipped in one 972KB
 * bundle that a farmer downloaded before they could even see the login
 * form.
 */
const FarmerDashboard = lazy(() => import('./pages/FarmerDashboard'))
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'))
const MarketAnalysis = lazy(() => import('./pages/MarketAnalysis'))
const FarmersChatsPage = lazy(() => import('./pages/FarmersChatsPage'))
const CustomerChatsPage = lazy(() => import('./pages/CustomerChatsPage'))
const MyListings = lazy(() => import('./pages/MyListings'))
const AboutPage = lazy(() => import('./pages/AboutPage'))

function RouteFallback() {
  return (
    <div className="ledger-scope flex min-h-screen items-center justify-center bg-paper">
      <p className="font-ledger text-sm uppercase tracking-wide text-ink/70">Loading…</p>
    </div>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState(window.location.hash.slice(1) || 'home')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userType, setUserType] = useState(null) // 'farmer' or 'customer'
  const [loading, setLoading] = useState(true)

  // handleHashChange below is registered once (see its effect) but needs the
  // latest auth state. Assigning window.location.hash fires 'hashchange'
  // asynchronously as a browser task, which can run before React's passive
  // effects flush — so this ref is written synchronously at every call site
  // that changes auth state and touches location.hash, not via a useEffect
  // (whose timing relative to that task isn't guaranteed).
  const authStateRef = useRef({ isAuthenticated, loading })

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getCurrentUser()

        // Check if response has user data (successful auth)
        if (response && response.user) {
          authStateRef.current = { isAuthenticated: true, loading: false }
          setIsAuthenticated(true)

          // Save user data to localStorage for messaging
          localStorage.setItem('userId', response.user._id)
          localStorage.setItem('userName', response.user.Username)
          localStorage.setItem('userEmail', response.user.email)

          // Role always comes from the server-verified session, never from
          // client-writable storage, so it can't be spoofed via devtools.
          const role = response.user.role
          setUserType(role)
          localStorage.setItem('userType', role)

          // Respect explicit hash routes (for example login/signup),
          // only auto-redirect when no route is specified.
          const currentHash = window.location.hash.slice(1)
          if (!currentHash) {
            const dashboard = role === 'customer' ? 'customer-dashboard' : 'farmer-dashboard'
            window.location.hash = dashboard
            setCurrentPage(dashboard)
          }
        } else {
          authStateRef.current = { isAuthenticated: false, loading: false }
          setIsAuthenticated(false)
          setUserType(null)
          localStorage.removeItem('userType')
          localStorage.removeItem('userId')
          localStorage.removeItem('userName')
          localStorage.removeItem('userEmail')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        authStateRef.current = { isAuthenticated: false, loading: false }
        setIsAuthenticated(false)
        setUserType(null)
        localStorage.removeItem('userType')
        localStorage.removeItem('userId')
        localStorage.removeItem('userName')
        localStorage.removeItem('userEmail')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Listen to hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      const { isAuthenticated, loading } = authStateRef.current

      // Check if trying to access protected routes
      if ((hash === 'farmer-dashboard' || hash === 'market-analysis' || hash === 'chats') && !isAuthenticated && !loading) {
        const loginPage = hash === 'farmer-dashboard' || hash === 'market-analysis' ? 'farmer-login' : 'customer-login'
        setCurrentPage(loginPage)
        window.location.hash = loginPage
      } else if (hash === 'customer-dashboard' && !isAuthenticated && !loading) {
        setCurrentPage('customer-login')
        window.location.hash = 'customer-login'
      } else {
        setCurrentPage(hash || 'home')
      }
      window.scrollTo(0, 0)
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleNavigate = (page) => {
    // Check if trying to navigate to protected routes
    if ((page === 'farmer-dashboard' || page === 'market-analysis') && !isAuthenticated) {
      window.location.hash = 'farmer-login'
      setCurrentPage('farmer-login')
      return
    }

    if (page === 'customer-dashboard' && !isAuthenticated) {
      window.location.hash = 'customer-login'
      setCurrentPage('customer-login')
      return
    }
    
    window.location.hash = page
    setCurrentPage(page)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      authStateRef.current = { isAuthenticated: false, loading: false }
      setIsAuthenticated(false)
      setUserType(null)
      localStorage.removeItem('userType')
      window.location.hash = 'home'
      setCurrentPage('home')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleLoginSuccess = (type = 'farmer') => {
    authStateRef.current = { isAuthenticated: true, loading: false }
    setIsAuthenticated(true)
    setUserType(type)
    localStorage.setItem('userType', type)
    const dashboard = type === 'customer' ? 'customer-dashboard' : 'farmer-dashboard'
    window.location.hash = dashboard
    setCurrentPage(dashboard)
  }

  const handleCustomerLoginSuccess = (type = 'customer') => {
    handleLoginSuccess(type)
  }

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <Suspense fallback={<RouteFallback />}>
      <div>
        {currentPage === 'farmer-dashboard' ? (
          isAuthenticated && userType === 'farmer' ? (
            <FarmerDashboard onNavigate={handleNavigate} onLogout={handleLogout} />
          ) : (
            <FarmerLogin onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
          )
        ) : currentPage === 'customer-dashboard' ? (
          isAuthenticated && userType === 'customer' ? (
            <CustomerDashboard onNavigate={handleNavigate} onLogout={handleLogout} />
          ) : (
            <CustomerLogin onNavigate={handleNavigate} onLoginSuccess={handleCustomerLoginSuccess} />
          )
        ) : currentPage === 'market-analysis' ? (
          isAuthenticated && userType === 'farmer' ? (
            <MarketAnalysis onBack={() => handleNavigate('farmer-dashboard')} onNavigate={handleNavigate} onLogout={handleLogout} />
          ) : (
            <FarmerLogin onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
          )
        ) : currentPage === 'chats' ? (
          isAuthenticated ? (
            userType === 'customer' ? (
              <CustomerChatsPage onBack={() => handleNavigate('customer-dashboard')} onNavigate={handleNavigate} onLogout={handleLogout} />
            ) : (
              <FarmersChatsPage onBack={() => handleNavigate('farmer-dashboard')} onNavigate={handleNavigate} onLogout={handleLogout} />
            )
          ) : (
            <HomePage />
          )
        ) : currentPage === 'my-listings' ? (
          isAuthenticated && userType === 'farmer' ? (
            <MyListings onNavigate={handleNavigate} onLogout={handleLogout} />
          ) : (
            <FarmerLogin onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
          )
        ) : currentPage === 'about' ? (
          <AboutPage />
        ) : currentPage === 'farmer-login' ? (
          <FarmerLogin onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
        ) : currentPage === 'customer-login' ? (
          <CustomerLogin onNavigate={handleNavigate} onLoginSuccess={handleCustomerLoginSuccess} />
        ) : currentPage === 'farmer-signup' ? (
          <FarmerSignup onNavigate={handleNavigate} onSignupSuccess={() => handleLoginSuccess('farmer')} />
        ) : currentPage === 'customer-signup' ? (
          <CustomerSignup onNavigate={handleNavigate} onSignupSuccess={() => handleLoginSuccess('customer')} />
        ) : (
          <HomePage />
        )}
      </div>
      </Suspense>
    </ThemeProvider>
  )
}

export default App
