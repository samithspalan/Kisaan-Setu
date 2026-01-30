import { Sprout, Linkedin, Github, Leaf } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-50">
      {/* Logo - Fixed in top-left corner */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-2">
        <Sprout className="w-8 h-8 text-green-600" />
        <h2 className="text-2xl font-bold text-green-700">KisanSetu</h2>
      </div>

      {/* Navigation Bar - Centered at top, sticky, transparent */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-white/80 backdrop-blur-md rounded-full px-6 py-2 shadow-lg border border-white/20">
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
      <div className="h-24"></div>

      {/* About Hero Section */}
      <section className="relative py-12 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-green-600 text-sm font-semibold mb-4">
            Our Mission
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Cultivating <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Innovation</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            We are a passionate team dedicated to bridging the gap between farmers and markets through innovative technology solutions. Building a sustainable future for agriculture.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-16 z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Meet The Minds
          </h2>

          {/* Team Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div 
                key={member.id}
                className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100"
              >
                {/* Gradient Header */}
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-8 relative overflow-hidden text-center h-32">
                   <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-white opacity-20 rounded-full blur-2xl"></div>
                   <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-black opacity-10 rounded-full blur-2xl"></div>
                </div>

                {/* Avatar & Info */}
                <div className="px-6 pb-6 relative">
                  <div className="flex justify-center -mt-12 mb-4 relative z-10">
                    <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-lg">
                      <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                        <span className="text-3xl font-bold text-emerald-600">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-emerald-600 text-sm font-medium mb-6 uppercase tracking-wide">{member.role}</p>

                    {/* Social Links */}
                    <div className="flex justify-center gap-4">
                      <a 
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-200"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a 
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-gray-800 hover:text-white transition-all border border-slate-200"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-slate-300 py-12 mt-16 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-6 h-6 text-emerald-500" />
                <span className="text-xl font-bold text-white">KisanSetu</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Bridging the gap between India's hardworking farmers and the modern marketplace.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#about" className="hover:text-emerald-400 transition">About Us</a></li>
                <li><a href="#home" className="hover:text-emerald-400 transition">Home</a></li>
                <li><a href="#contact" className="hover:text-emerald-400 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
            <p>&copy; 2026 KisanSetu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

