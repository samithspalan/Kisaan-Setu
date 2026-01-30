import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import FarmerDashboard from './pages/FarmerDashboard'
import AboutPage from './pages/AboutPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  // Listen to hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      setCurrentPage(hash || 'home')
      window.scrollTo(0, 0)
    }

    window.addEventListener('hashchange', handleHashChange)
    
    // Check initial hash
    const initialHash = window.location.hash.slice(1)
    if (initialHash) {
      setCurrentPage(initialHash)
    }

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
