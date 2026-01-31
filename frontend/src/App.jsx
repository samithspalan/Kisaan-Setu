import { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { authService } from './services/authService'
import HomePage from './pages/HomePage'
import FarmerDashboard from './pages/FarmerDashboard'
import CustomerDashboard from './pages/CustomerDashboard'
import MarketAnalysis from './pages/MarketAnalysis'
import AboutPage from './pages/AboutPage'
import FarmerLogin from './pages/FarmerLogin'
import CustomerLogin from './pages/CustomerLogin'
import FarmerSignup from './pages/FarmerSignup'
import CustomerSignup from './pages/CustomerSignup'
import ChatsPage from './pages/ChatsPage'
import CustomerChatsPage from './pages/CustomerChatsPage'
import MyListings from './pages/MyListings'

function App() {
  const [currentPage, setCurrentPage] = useState(window.location.hash.slice(1) || 'home')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userType, setUserType] = useState(null) // 'farmer' or 'customer'
  const [loading, setLoading] = useState(true)

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getCurrentUser()
        console.log('Auth check response:', response)
        
        // Check if response has user data (successful auth)
        if (response && response.user) {
          console.log('User authenticated:', response.user)
          setIsAuthenticated(true)
          
          // Get userType from localStorage
          const storedUserType = localStorage.getItem('userType')
          if (storedUserType) {
            console.log('Setting userType:', storedUserType)
            setUserType(storedUserType)
            // Redirect to appropriate dashboard
            const dashboard = storedUserType === 'customer' ? 'customer-dashboard' : 'farmer-dashboard'
            window.location.hash = dashboard
            setCurrentPage(dashboard)
          }
        } else {
          console.log('User not authenticated')
          setIsAuthenticated(false)
          setUserType(null)
          localStorage.removeItem('userType')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
        setUserType(null)
        localStorage.removeItem('userType')
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
  }, [isAuthenticated, loading])

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
              <CustomerChatsPage onBack={() => handleNavigate('customer-dashboard')} onNavigate={handleNavigate} />
            ) : (
              <ChatsPage onBack={() => handleNavigate('farmer-dashboard')} onNavigate={handleNavigate} userType={userType} />
            )
          ) : (
            <HomePage />
          )
        ) : currentPage === 'my-listings' ? (
          isAuthenticated && userType === 'farmer' ? (
            <MyListings onBack={() => handleNavigate('farmer-dashboard')} onNavigate={handleNavigate} />
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
    </ThemeProvider>
  )
}

export default App
