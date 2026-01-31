import { useState } from 'react'
import { ArrowLeft, Send, Search, MoreVertical, Phone, Video, X, Home, BarChart3, Bell, Store, LogOut, Sun, Moon, Leaf } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ChatsPage({ onBack, onNavigate, userType = 'farmer' }) {
  const { isDark, toggleTheme } = useTheme()
  const [activeLink, setActiveLink] = useState('chats')
  const [selectedChat, setSelectedChat] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageText, setMessageText] = useState('')

  // Mock chat data
  const [chats, setChats] = useState([
    {
      id: 1,
      name: userType === 'farmer' ? 'Rajesh Patel' : 'Fresh Farms Punjab',
      image: '👨‍🌾',
      lastMessage: 'Available wheat at ₹2500/quintal',
      timestamp: '10:30 AM',
      unread: 2,
      online: true,
      messages: [
        { id: 1, sender: 'other', text: 'Hi, do you have fresh wheat?', time: '9:45 AM' },
        { id: 2, sender: 'other', text: 'Available wheat at ₹2500/quintal', time: '10:30 AM' },
      ]
    },
    {
      id: 2,
      name: userType === 'farmer' ? 'Priya Singh' : 'Organic Valley Farm',
      image: '👩‍🌾',
      lastMessage: 'Quality assured vegetables',
      timestamp: 'Yesterday',
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: 'other', text: 'Quality assured vegetables', time: 'Yesterday' },
      ]
    },
    {
      id: 3,
      name: userType === 'farmer' ? 'Ahmed Khan' : 'Green Harvest Co.',
      image: '👨‍💼',
      lastMessage: 'Interested in bulk orders',
      timestamp: '2 days ago',
      unread: 0,
      online: true,
      messages: [
        { id: 1, sender: 'other', text: 'Interested in bulk orders', time: '2 days ago' },
      ]
    },
  ])

  const handleSendMessage = () => {
    if (messageText.trim() && selectedChat) {
      const updatedChats = chats.map(chat => {
        if (chat.id === selectedChat.id) {
          return {
            ...chat,
            messages: [
              ...chat.messages,
              { id: chat.messages.length + 1, sender: 'you', text: messageText, time: 'now' }
            ],
            lastMessage: messageText
          }
        }
        return chat
      })
      setChats(updatedChats)
      setSelectedChat(updatedChats.find(c => c.id === selectedChat.id))
      setMessageText('')
    }
  }

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Logo - Fixed in top-left corner */}
      <div className={`fixed top-6 left-6 z-50 flex items-center gap-3 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border transition-colors duration-300 ${
        isDark
          ? 'bg-slate-800/90 border-slate-700'
          : 'bg-white/90 border-emerald-100/50'
      }`}>
        <div className={`p-2 rounded-xl transition-colors duration-300 ${
          isDark ? 'bg-emerald-900/50' : 'bg-emerald-100'
        }`}>
          <Leaf className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
           <h1 className={`text-xl font-bold leading-none transition-colors duration-300 ${
             isDark ? 'text-slate-100' : 'text-emerald-950'
           }`}>KisanSetu</h1>
           <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors duration-300 ${
             isDark ? 'text-emerald-400' : 'text-emerald-600'
           }`}>Farmer Connect</span>
        </div>
      </div>

      {/* Navigation Bar - Centered at top, sticky */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-40 w-auto max-w-[90%] flex items-center gap-4">
        <div className={`backdrop-blur-xl rounded-2xl px-2 py-2 shadow-xl shadow-emerald-900/5 border transition-colors duration-300 ${
          isDark
            ? 'bg-slate-800/80 border-slate-700/50 ring-1 ring-black/20'
            : 'bg-white/80 border-white/50 ring-1 ring-black/5'
        }`}>
          <div className="flex gap-1 items-center">
            {userType === 'farmer' ? (
              // Farmer Navigation
              [
                { id: 'home', label: 'Home', icon: Home },
                { id: 'market-prices', label: 'Market Prices', icon: BarChart3 },
                { id: 'chats', label: 'Chats', icon: Bell },
                { id: 'listings', label: 'My Listings', icon: Store }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'home' && onNavigate) {
                      onNavigate('farmer-dashboard')
                    } else if (item.id === 'market-prices' && onNavigate) {
                      onNavigate('market-analysis')
                    } else if (item.id === 'chats') {
                      setActiveLink(item.id)
                    } else if (item.id === 'listings' && onNavigate) {
                      onNavigate('my-listings')
                    }
                  }}
                  className={`flex items-center gap-2 font-semibold transition-all duration-300 px-5 py-2.5 rounded-xl text-sm ${
                    activeLink === item.id 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                      : isDark
                        ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${activeLink === item.id ? 'text-emerald-100' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              ))
            ) : (
              // Customer Navigation
              [
                { id: 'home', label: 'Home', icon: Home },
                { id: 'marketplace', label: 'Marketplace', icon: Store },
                { id: 'chats', label: 'Chats', icon: Bell }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'home' && onNavigate) {
                      onNavigate('customer-dashboard')
                    } else if (item.id === 'marketplace' && onNavigate) {
                      onNavigate('customer-dashboard')
                    } else if (item.id === 'chats') {
                      setActiveLink(item.id)
                    }
                  }}
                  className={`flex items-center gap-2 font-semibold transition-all duration-300 px-5 py-2.5 rounded-xl text-sm ${
                    activeLink === item.id 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                      : isDark
                        ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${activeLink === item.id ? 'text-emerald-100' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              ))
            )}
            <div className={`w-px h-8 transition-colors duration-300 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                isDark
                  ? 'text-yellow-400 hover:bg-slate-700/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <a 
               href="#"
               title="Logout"
               className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                 isDark
                   ? 'text-slate-500 hover:text-red-400 hover:bg-red-950/30'
                   : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
               }`}
            >
               <LogOut className="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>

      {/* Top Spacing for fixed navbar */}
      <div className="h-28"></div>

      {/* Main Chat Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-160px)] flex gap-6">
        {/* Chat List */}
        <div className={`w-full md:w-96 lg:w-1/3 rounded-2xl shadow-lg overflow-hidden flex flex-col ${
          isDark ? 'bg-slate-800' : 'bg-white'
        } ${selectedChat ? 'hidden md:flex' : ''}`}>
          {/* Search */}
          <div className={`p-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
            <div className="relative">
              <Search className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all border-0 ${
                  isDark
                    ? 'bg-slate-700 text-slate-100 placeholder-slate-400'
                    : 'bg-slate-100 text-slate-900 placeholder-slate-600'
                }`}
              />
            </div>
          </div>

          {/* Chat List Items */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 border-b border-slate-700/30 transition-all text-left hover:${isDark ? 'bg-slate-700/50' : 'bg-slate-50'} ${
                  selectedChat?.id === chat.id
                    ? isDark ? 'bg-slate-700' : 'bg-teal-50'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative text-2xl">{chat.image}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{chat.name}</h3>
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{chat.timestamp}</span>
                    </div>
                    <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="bg-teal-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        {selectedChat ? (
          <div className={`flex-1 rounded-2xl shadow-lg overflow-hidden flex flex-col ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}>
            {/* Chat Header */}
            <div className={`p-4 border-b border-slate-700/50 flex items-center justify-between ${
              isDark ? 'bg-slate-700/50' : 'bg-slate-50'
            }`}>
              <div className="flex items-center gap-3 flex-1 md:hidden">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative text-3xl">{selectedChat.image}</div>
                <div>
                  <h2 className="font-semibold">{selectedChat.name}</h2>
                  <p className={`text-xs ${selectedChat.online ? 'text-green-500' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {selectedChat.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-full transition-all ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-200'}`}>
                  <Phone className="w-5 h-5 text-teal-600" />
                </button>
                <button className={`p-2 rounded-full transition-all ${isDark ? 'hover:bg-slate-600' : 'hover:bg-slate-200'}`}>
                  <Video className="w-5 h-5 text-teal-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedChat.messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'you' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender === 'you'
                        ? 'bg-teal-600 text-white rounded-br-none'
                        : isDark ? 'bg-slate-700 text-slate-100 rounded-bl-none' : 'bg-slate-200 text-slate-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.sender === 'you' ? 'text-teal-100' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className={`p-4 border-t border-slate-700/50 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className={`flex-1 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all border-0 ${
                    isDark
                      ? 'bg-slate-600 text-slate-100 placeholder-slate-400'
                      : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-600'
                  }`}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-full transition-all flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex-1 rounded-2xl shadow-lg hidden md:flex items-center justify-center flex-col gap-4 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="text-6xl">💬</div>
            <p className={`text-lg font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Select a conversation to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
