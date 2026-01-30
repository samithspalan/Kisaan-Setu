import { Sprout, Linkedin, Github } from 'lucide-react'
import { useState } from 'react'

export default function AboutPage() {
  const [activeLink, setActiveLink] = useState('about')

  const teamMembers = [
    { id: 1, name: 'Harikishan alva b', role: 'Team Member', linkedin: 'https://www.linkedin.com/in/harikishan-alva-b-2163a5293/', github: 'https://github.com/HARIKISHAN-ALVA-B' },
    { id: 2, name: 'samith s palan', role: 'Team Member', linkedin: 'https://www.linkedin.com/in/samith-s-palan-695868291', github: 'https://github.com/samithspalan' },
    { id: 3, name: 'Akshay', role: 'Team Member', linkedin: 'https://www.linkedin.com/in/akshay-kumar-738245293', github: 'https://github.com/akshay123kumar-coder' },
    { id: 4, name: 'Nisith SK', role: 'Team Member', linkedin: 'https://www.linkedin.com/in/nishit-s-k-441141293?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app', github: 'https://github.com/NishitSK' },
  ]

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 via-white to-green-50">
      {/* Logo - Fixed in top-left corner */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-2">
        <Sprout className="w-8 h-8 text-green-600" />
        <h2 className="text-2xl font-bold text-green-700">KisanSetu</h2>
      </div>

      {/* Navigation Bar - Centered at top, sticky, transparent */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-white/30 backdrop-blur-md rounded-full px-6 py-2 shadow-lg border border-white/20">
          <div className="flex gap-8 items-center">
            <a 
              href="#home" 
              onClick={() => setActiveLink('home')}
              className={`font-medium transition-all duration-300 px-3 py-2 rounded-lg ${
                activeLink === 'home' ? 'bg-green-600 text-white' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Home
            </a>
            <a 
              href="#about" 
              onClick={() => setActiveLink('about')}
              className={`font-medium transition-all duration-300 px-3 py-2 rounded-lg ${
                activeLink === 'about' ? 'bg-green-600 text-white' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              About
            </a>
            <a 
              href="#features" 
              onClick={() => setActiveLink('features')}
              className={`font-medium transition-all duration-300 px-3 py-2 rounded-lg ${
                activeLink === 'features' ? 'bg-green-600 text-white' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Features
            </a>
            <a 
              href="#contact" 
              onClick={() => setActiveLink('contact')}
              className={`font-medium transition-all duration-300 px-3 py-2 rounded-lg ${
                activeLink === 'contact' ? 'bg-green-600 text-white' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Top Spacing for fixed navbar */}
      <div className="h-20"></div>

      {/* About Hero Section */}
      <section className="relative py-4 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text mb-2">
            About Us
          </h1>
          <p className="text-sm text-gray-700 leading-relaxed">
            We are a passionate team dedicated to bridging the gap between farmers and markets through innovative technology solutions.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-6 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Meet Our Team
          </h2>

          {/* Team Members - Single Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div 
                key={member.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-green-100"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Avatar Placeholder */}
                  <div className="w-28 h-28 bg-linear-to-br from-green-400 to-emerald-600 rounded-full mb-4 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Member Info */}
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-gray-600 text-xs mb-4">{member.role}</p>

                  {/* Social Links */}
                  <div className="flex gap-4">
                    <a 
                      href={member.linkedin}
                      className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors text-xs"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </a>
                    <a 
                      href={member.github}
                      className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors text-xs"
                    >
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-linear-to-r from-green-700 to-emerald-700 text-white py-8 mt-16 z-10 relative">
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
                <li><a href="#home" className="hover:text-white transition">Home</a></li>
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
