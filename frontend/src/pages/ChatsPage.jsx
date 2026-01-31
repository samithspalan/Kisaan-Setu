import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, Search, MoreVertical, Phone, Video, X, Home, BarChart3, Bell, Store, LogOut, Sun, Moon, Leaf, Loader } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import io from 'socket.io-client'

export default function ChatsPage({ onBack, onNavigate, userType = 'farmer' }) {
  const { isDark, toggleTheme } = useTheme()
  const [activeLink, setActiveLink] = useState('chats')
  const [selectedChat, setSelectedChat] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageText, setMessageText] = useState('')
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Get current user ID and initialize socket
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (userId) {
      setCurrentUserId(userId)
      
      // Initialize Socket.IO
      socketRef.current = io('http://localhost:8000')

      socketRef.current.on('connect', () => {
        console.log('Connected to socket server')
        socketRef.current.emit('join', userId)
      })

      socketRef.current.on('receive_message', (message) => {
        console.log('Received message:', message)
        setMessages(prev => [...prev, message])
        // Refresh conversations list when receiving new message
        fetchConversations()
      })

      socketRef.current.on('message_sent', (message) => {
        console.log('Message sent:', message)
        setMessages(prev => [...prev, message])
      })

      socketRef.current.on('message_error', (error) => {
        console.error('Message error:', error)
        alert('Failed to send message: ' + error.error)
      })

      // Fetch all conversations
      fetchConversations()
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/messages/conversations', {
        withCredentials: true
      })
      if (response.data.success) {
        setConversations(response.data.conversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchConversation = async (customerId, customerName) => {
    setLoading(true)
    try {
      const response = await axios.get(
        `http://localhost:8000/api/messages/conversation/${customerId}`,
        { withCredentials: true }
      )
      if (response.data.success) {
        setMessages(response.data.messages || [])
        setSelectedChat({
          id: customerId,
          name: customerName,
          online: true
        })
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
      // Keep chat open even if no messages
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  // Legacy mock data removed - using real data from backend
  const [chats] = useState([
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
    if (messageText.trim() && selectedChat && currentUserId) {
      setSending(true)
      const messageData = {
        senderId: currentUserId,
        receiverId: selectedChat.id,
        message: messageText
      }

      // Send via Socket.IO
      socketRef.current.emit('send_message', messageData)
      setMessageText('')
      setSending(false)
      
      // Refresh conversations list
      setTimeout(() => fetchConversations(), 500)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.Username?.toLowerCase().includes(searchTerm.toLowerCase())
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
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conv => (
                <button
                  key={conv.otherUser._id}
                  onClick={() => fetchConversation(conv.otherUser._id, conv.otherUser.Username)}
                  className={`w-full p-4 border-b border-slate-700/30 transition-all text-left hover:${isDark ? 'bg-slate-700/50' : 'bg-slate-50'} ${
                    selectedChat?.id === conv.otherUser._id
                      ? isDark ? 'bg-slate-700' : 'bg-teal-50'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative text-2xl">👤</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{conv.otherUser.Username}</h3>
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {conv.lastMessage.message}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex items-center justify-center h-full p-8 text-center">
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  No conversations yet. Customers will message you about your listings!
                </p>
              </div>
            )}
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
                <div className="relative text-3xl">👤</div>
                <div>
                  <h2 className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{selectedChat.name}</h2>
                  <p className={`text-xs ${selectedChat.online ? 'text-green-500' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Customer
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
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.senderId._id === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        msg.senderId._id === currentUserId
                          ? 'bg-teal-600 text-white rounded-br-none'
                          : isDark ? 'bg-slate-700 text-slate-100 rounded-bl-none' : 'bg-slate-200 text-slate-900 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.senderId._id === currentUserId ? 'text-teal-100' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-3 p-8">
                  <div className="text-5xl mb-2">💬</div>
                  <p className={`text-lg font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Reply to {selectedChat.name}
                  </p>
                  <p className={`text-sm text-center max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Start chatting with your customer!
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
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
                  disabled={sending}
                  className={`flex-1 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all border-0 ${
                    isDark
                      ? 'bg-slate-600 text-slate-100 placeholder-slate-400'
                      : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-600'
                  }`}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !messageText.trim()}
                  className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-full transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {sending ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
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
