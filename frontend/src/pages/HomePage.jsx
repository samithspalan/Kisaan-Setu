import { Sprout, Shield, ShoppingCart } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sprout className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-green-700">KisanSetu</h2>
          </div>
          <div className="hidden md:flex gap-8 text-gray-700">
            <a href="#about" className="hover:text-green-600 transition">About</a>
            <a href="#features" className="hover:text-green-600 transition">Features</a>
            <a href="#contact" className="hover:text-green-600 transition">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-80 h-80 bg-green-100 rounded-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-80 h-80 bg-emerald-100 rounded-full opacity-50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8 inline-block">
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              Welcome to KisanSetu
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            KisanSetu
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            A Digital Bridge Between Farmers and Markets
          </p>

          <p className="text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
            Connecting agricultural communities with opportunities. Empower farmers, serve customers, manage operations.
          </p>
        </div>
      </section>

      {/* Login Cards Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Select Your Role
          </h2>
          <p className="text-gray-600 text-lg">
            Choose your account type to get started
          </p>
        </div>

        {/* Login Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Farmer Card */}
          <a href="/farmer-login" className="group block">
            <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 overflow-hidden">
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                <Sprout className="w-16 h-16 text-white relative z-10" strokeWidth={1.5} />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Farmer Login</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Access your farm profile and connect directly with markets
                </p>
                <button className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                  Login as Farmer
                </button>
              </div>
            </div>
          </a>

          {/* Admin Card */}
          <a href="/admin-login" className="group block">
            <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                <Shield className="w-16 h-16 text-white relative z-10" strokeWidth={1.5} />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Admin Login</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Manage platform, users, and market operations
                </p>
                <button className="w-full bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                  Login as Admin
                </button>
              </div>
            </div>
          </a>

          {/* Customer Card */}
          <a href="/customer-login" className="group block">
            <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 overflow-hidden">
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                <ShoppingCart className="w-16 h-16 text-white relative z-10" strokeWidth={1.5} />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Customer Login</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Browse and purchase fresh produce directly from farmers
                </p>
                <button className="w-full bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                  Login as Customer
                </button>
              </div>
            </div>
          </a>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8 md:p-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Don't have an account?
          </h3>
          <p className="text-gray-600 mb-6">
            Create a new account to join our growing community of farmers and customers.
          </p>
          <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300">
            Sign Up Now
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose KisanSetu?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-green-50 rounded-xl border border-green-200 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-green-700 mb-3">
                Direct Connection
              </h3>
              <p className="text-gray-600">
                Connect farmers directly with customers and reduce middlemen
              </p>
            </div>
            <div className="p-8 bg-green-50 rounded-xl border border-green-200 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-green-700 mb-3">
                Fair Pricing
              </h3>
              <p className="text-gray-600">
                Transparent pricing system that benefits both farmers and buyers
              </p>
            </div>
            <div className="p-8 bg-green-50 rounded-xl border border-green-200 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-green-700 mb-3">
                Easy Management
              </h3>
              <p className="text-gray-600">
                Simplified platform for managing crops, orders, and deliveries
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-700 to-emerald-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-6 h-6" />
                <span className="text-xl font-bold">KisanSetu</span>
              </div>
              <p className="text-green-100">
                Bridging the gap between farmers and markets.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-green-100">
                <li><a href="#about" className="hover:text-white transition">About Us</a></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-green-100">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-green-600 pt-8 text-center text-green-100">
            <p>&copy; 2026 KisanSetu. All rights reserved. Building a better agricultural future.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
