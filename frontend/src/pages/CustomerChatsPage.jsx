import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, Search, MoreVertical, Home, Mail, X, Sun, Moon, Leaf, Loader, LogOut } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import io from 'socket.io-client'
import { API_BASE, SOCKET_URL } from '../config/api'

export default function CustomerChatsPage({ onBack, onNavigate }) {
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
      socketRef.current = io(SOCKET_URL)

      socketRef.current.on('connect', () => {
        console.log('[CUSTOMER] Connected to socket server, socket ID:', socketRef.current.id)
        socketRef.current.emit('join', userId)
        console.log('[CUSTOMER] Emitted join event with userId:', userId)
      })

      socketRef.current.on('receive_message', (message) => {
        console.log('[CUSTOMER] Received message:', message)
        setMessages(prev => [...prev, message])
        // Refresh conversations list when receiving new message
        setTimeout(() => fetchConversations(), 100)
      })

      socketRef.current.on('message_sent', (message) => {
        console.log('[CUSTOMER] Message sent:', message)
        setMessages(prev => [...prev, message])
        // Refresh conversations list after sending
        setTimeout(() => fetchConversations(), 100)
      })

      socketRef.current.on('message_error', (error) => {
        console.error('[CUSTOMER] Message error:', error)
        alert('Failed to send message: ' + error.error)
      })

      socketRef.current.on('conversation_updated', () => {
        console.log('[CUSTOMER] Conversation updated event received, refreshing list...')
        fetchConversations()
      })

      // Check for selected farmer from dashboard
      const selectedFarmer = localStorage.getItem('selectedChatFarmer')
      if (selectedFarmer) {
        try {
          const farmer = JSON.parse(selectedFarmer)
          // Open chat immediately
          setSelectedChat({
            id: farmer.id,
            name: farmer.name,
            location: farmer.location,
            online: true
          })
          // Fetch conversation history (or start empty)
          fetchConversation(farmer.id, farmer.name, farmer.location)
          localStorage.removeItem('selectedChatFarmer') // Clear after opening
        } catch (error) {
          console.error('Error parsing selected farmer:', error)
        }
      }

      // Fetch all conversations
      fetchConversations()
      
      // Poll for new conversations every 3 seconds (backup for real-time)
      const pollInterval = setInterval(() => {
        fetchConversations()
      }, 3000)

      return () => {
        clearInterval(pollInterval)
        if (socketRef.current) {
          socketRef.current.disconnect()
        }
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const fetchConversations = async () => {
    try {
      console.log('[CUSTOMER] Fetching conversations...')
      const response = await axios.get(`${API_BASE}/messages/conversations`, {
        withCredentials: true
      })
      console.log('[CUSTOMER] Conversations response:', response.data)
      if (response.data.success) {
        console.log('[CUSTOMER] Setting conversations:', response.data.conversations.length, 'conversations')
        setConversations(response.data.conversations)
      } else {
        console.log('[CUSTOMER] No success in response')
      }
    } catch (error) {
      console.error('[CUSTOMER] Error fetching conversations:', error)
    }
  }

  const fetchConversation = async (farmerId, farmerName, farmerLocation) => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${API_BASE}/messages/conversation/${farmerId}`,
        { withCredentials: true }
      )
      if (response.data.success) {
        setMessages(response.data.messages || [])
        setSelectedChat({
          id: farmerId,
          name: farmerName,
          location: farmerLocation,
          online: true
        })
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
      // Even if no conversation exists, keep chat open for new message
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = () => {
    if (messageText.trim() && selectedChat && currentUserId) {
      setSending(true)
      const messageData = {
        senderId: currentUserId,
        receiverId: selectedChat.id,
        message: messageText
      }

      console.log('[CUSTOMER] Sending message:', messageData)
      // Send via Socket.IO
      socketRef.current.emit('send_message', messageData)
      setMessageText('')
      setSending(false)
      
      // Refresh conversations list to show new conversation
      setTimeout(() => fetchConversations(), 500)
    } else {
      console.log('[CUSTOMER] Cannot send message - missing data:', { messageText, selectedChat, currentUserId })
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.Username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-linear-to-b from-teal-50 via-white to-teal-50'}`}>
      {/* Logo */}
      <div className="fixed top-6 left-6 z-40 flex items-center gap-2">
        <Leaf className="w-8 h-8 text-teal-600" />
        <div>
          <h1 className={`text-xl font-bold leading-none transition-colors duration-300 ${
            isDark ? 'text-slate-100' : 'text-teal-950'
          }`}>KisanSetu</h1>
          <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors duration-300 ${
            isDark ? 'text-teal-400' : 'text-teal-600'
          }`}>Customer</span>
        </div>
      </div>

      {/* Navigation Bar - Centered at top, floating */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-40 w-auto max-w-[90%] flex items-center gap-4">
        <div className={`backdrop-blur-2xl rounded-full px-2 py-1.5 shadow-2xl transition-colors duration-300 ${
          isDark
            ? 'bg-linear-to-r from-slate-800/40 via-slate-700/30 to-slate-800/40 border border-slate-600/30'
            : 'bg-linear-to-r from-teal-50/20 via-white/10 to-teal-50/20 border border-teal-200/30'
        }`}>
          <div className="flex gap-1 items-center">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'chats', label: 'Chats', icon: Mail },
              { id: 'theme', label: '', icon: isDark ? Sun : Moon, isButton: true },
              { id: 'logout', label: 'Logout', icon: LogOut, isButton: true }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'theme') {
                    toggleTheme()
                  } else if (item.id === 'logout' && onBack) {
                    onBack()
                  } else if (item.id === 'home' && onNavigate) {
                    onNavigate('customer-dashboard')
                  } else if (item.id === 'chats') {
                    setActiveLink(item.id)
                  }
                }}
                className={`flex items-center gap-2 font-semibold transition-all duration-300 px-6 py-3.5 rounded-full text-sm ${
                  !item.isButton && activeLink === item.id
                    ? isDark
                      ? 'bg-linear-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-600/40'
                      : 'bg-linear-to-r from-teal-500 to-teal-400 text-white shadow-lg shadow-teal-500/40'
                    : !item.isButton && activeLink !== item.id
                    ? isDark
                      ? 'text-slate-300 hover:text-teal-400 hover:bg-slate-700/30'
                      : 'text-slate-600 hover:text-teal-600 hover:bg-white/30'
                    : item.id === 'theme'
                    ? isDark
                      ? 'text-yellow-400 hover:text-yellow-300 hover:bg-slate-700/30'
                      : 'text-amber-500 hover:text-amber-600 hover:bg-white/30'
                    : item.id === 'logout'
                    ? isDark
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50/30'
                    : ''
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label && item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Top Spacing for fixed navbar */}
      <div className="h-24"></div>

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
                placeholder="Search sellers..."
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
                  onClick={() => fetchConversation(conv.otherUser._id, conv.otherUser.Username, conv.otherUser.email)}
                  className={`w-full p-4 border-b ${isDark ? 'border-slate-700/30' : 'border-slate-200/50'} transition-all text-left ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} ${selectedChat?.id === conv.otherUser._id ? (isDark ? 'bg-slate-700/50' : 'bg-teal-50') : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl shrink-0">🌾</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className={`font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{conv.otherUser.Username}</h3>
                        <span className={`text-xs shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{conv.otherUser.email}</p>
                      <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{conv.lastMessage.message}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex items-center justify-center h-full p-8 text-center">
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  No conversations yet. Click "Message" on a farmer listing to start chatting!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        {selectedChat ? (
          <div className={`flex-1 rounded-2xl shadow-lg overflow-hidden flex flex-col ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            {/* Chat Header */}
            <div className={`p-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200'} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedChat(null)} className="md:hidden">
                  <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                </button>
                <div className="text-3xl">🌾</div>
                <div>
                  <h2 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{selectedChat.name}</h2>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {selectedChat.location || 'Farmer'}
                  </p>
                </div>
              </div>
              <button className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                <MoreVertical className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
              </button>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.senderId._id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                      msg.senderId._id === currentUserId
                        ? isDark
                          ? 'bg-teal-600 text-white'
                          : 'bg-teal-600 text-white'
                        : isDark
                        ? 'bg-slate-700 text-slate-100'
                        : 'bg-slate-100 text-slate-900'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.senderId._id === currentUserId ? 'text-teal-100' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-3 p-8">
                  <div className="text-5xl mb-2">💬</div>
                  <p className={`text-lg font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Start conversation with {selectedChat.name}
                  </p>
                  <p className={`text-sm text-center max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Send a message to begin your chat. They'll be notified instantly!
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className={`p-4 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={sending}
                  className={`flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all border-0 ${
                    isDark
                      ? 'bg-slate-700 text-slate-100 placeholder-slate-400'
                      : 'bg-slate-100 text-slate-900 placeholder-slate-600'
                  }`}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !messageText.trim()}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex-1 rounded-2xl shadow-lg flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="text-center">
              <Mail className={`w-12 h-12 mx-auto mb-4 opacity-50 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
              <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Select a seller to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
