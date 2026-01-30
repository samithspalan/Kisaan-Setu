import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import FarmerDashboard from './pages/FarmerDashboard'
import AboutPage from './pages/AboutPage'

function App() {
  const [currentPage, setCurrentPage] = useState(window.location.hash.slice(1) || 'home')

  // Listen to hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      setCurrentPage(hash || 'home')
      window.scrollTo(0, 0)
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div>
      {currentPage === 'farmer-dashboard' ? (
        <FarmerDashboard />
      ) : currentPage === 'about' ? (
        <AboutPage />
      ) : (
        <HomePage />
      )}
    </div>
  )
}

export default App
