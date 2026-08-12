import { useState, useEffect, useRef } from 'react'
import { Send, Search, ArrowLeft, Loader, Mail, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import io from 'socket.io-client'
import AppNav from '../components/ui/AppNav'
import Slip from '../components/ui/Slip'
import { API_BASE, SOCKET_URL } from '../config/api'

export default function CustomerChatsPage({ onBack, onNavigate, onLogout }) {
  const { t } = useTranslation()
  const [selectedChat, setSelectedChat] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageText, setMessageText] = useState('')
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [conversationsFailed, setConversationsFailed] = useState(false)
  const [sendError, setSendError] = useState(false)
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

      // Initialize Socket.IO — withCredentials sends the auth cookie so the
      // server can verify identity itself rather than trusting a client-sent id.
      socketRef.current = io(SOCKET_URL, { withCredentials: true })

      socketRef.current.on('connect', () => {
        socketRef.current.emit('join')
      })

      socketRef.current.on('receive_message', (message) => {
        setMessages(prev => [...prev, message])
        // Refresh conversations list when receiving new message
        setTimeout(() => fetchConversations(), 100)
      })

      socketRef.current.on('message_sent', (message) => {
        setMessages(prev => [...prev, message])
        // Refresh conversations list after sending
        setTimeout(() => fetchConversations(), 100)
      })

      socketRef.current.on('message_error', (error) => {
        console.error('Message error:', error)
        setSendError(true)
      })

      socketRef.current.on('conversation_updated', () => {
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

      // The socket already pushes `conversation_updated`, so the old 3s
      // poll was ~1,200 redundant requests an hour against a buyer's
      // metered mobile data. Refresh on tab-visible instead, which
      // covers a socket that dropped while the phone was asleep.
      const onVisible = () => {
        if (document.visibilityState === 'visible') fetchConversations()
      }
      document.addEventListener('visibilitychange', onVisible)

      return () => {
        document.removeEventListener('visibilitychange', onVisible)
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
      const response = await axios.get(`${API_BASE}/messages/conversations`, {
        withCredentials: true
      })
      if (response.data.success) {
        setConversations(response.data.conversations)
        setConversationsFailed(false)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setConversationsFailed(true)
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
      setSendError(false)
      const messageData = {
        senderId: currentUserId,
        receiverId: selectedChat.id,
        message: messageText
      }

      // Send via Socket.IO
      socketRef.current.emit('send_message', messageData)
      setMessageText('')
      setSending(false)

      // Refresh conversations list to show new conversation
      setTimeout(() => fetchConversations(), 500)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.Username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const navLinks = [
    { id: 'home', label: t('dash.navHome'), href: 'customer-dashboard', onClick: (e) => { e.preventDefault(); onNavigate('customer-dashboard') } },
    { id: 'chats', label: t('dash.navChats'), href: 'chats', onClick: (e) => e.preventDefault() },
  ]

  return (
    <div className="ledger-scope flex min-h-screen flex-col bg-paper">
      <AppNav links={navLinks} active="chats" onLogout={onLogout || onBack} />

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-8 py-8 sm:pl-16">
        {/* Conversation list */}
        <Slip className={`flex w-full flex-col overflow-hidden md:w-96 ${selectedChat ? 'hidden md:flex' : ''}`}>
          <div className="border-b border-ink/10 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
              <input
                type="text"
                placeholder={t('chat.searchSellers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-sm border border-ink/15 bg-paper py-2 pl-9 pr-3 font-body text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conv => (
                <button
                  key={conv.otherUser._id}
                  onClick={() => fetchConversation(conv.otherUser._id, conv.otherUser.Username, conv.otherUser.email)}
                  className={`w-full border-b border-ink/10 p-4 text-left transition-colors hover:bg-paper-dim ${
                    selectedChat?.id === conv.otherUser._id ? 'bg-maroon/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-brass/20 font-display text-sm font-semibold text-brass-dark">
                      {conv.otherUser.Username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <h3 className="truncate font-display font-semibold leading-tight">{conv.otherUser.Username}</h3>
                        <span className="shrink-0 text-xs text-ink/45">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="truncate text-sm text-ink/60">{conv.lastMessage.message}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : conversationsFailed ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="mb-2 h-5 w-5 text-rule" />
                <p className="mb-2 text-sm text-ink/60">{t('common.fetchError')}</p>
                <button onClick={fetchConversations} className="text-sm font-semibold text-maroon hover:underline">
                  {t('common.retry')}
                </button>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center">
                <p className="text-sm text-ink/50">{t('chat.noConversationsCustomer')}</p>
              </div>
            )}
          </div>
        </Slip>

        {/* Chat window */}
        {selectedChat ? (
          <Slip className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-3 border-b border-ink/10 bg-paper-dim p-4">
              <button onClick={() => setSelectedChat(null)} aria-label={t('common.back')} className="md:hidden">
                <ArrowLeft className="h-5 w-5 text-ink/60" />
              </button>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-brass/20 font-display text-sm font-semibold text-brass-dark">
                {selectedChat.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h2 className="font-display font-semibold leading-tight">{selectedChat.name}</h2>
                <p className="text-xs text-ink/50">{selectedChat.location || t('chat.farmerLabel')}</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-paper p-4">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader className="h-6 w-6 animate-spin text-maroon" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.senderId._id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs rounded-sm px-4 py-2 ${
                      msg.senderId._id === currentUserId ? 'bg-maroon text-paper' : 'bg-paper-dim text-ink'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`mt-1 text-xs ${msg.senderId._id === currentUserId ? 'text-paper/70' : 'text-ink/50'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-full flex-col items-center justify-center space-y-2 p-8 text-center">
                  <Mail className="h-8 w-8 text-ink/25" />
                  <p className="font-semibold text-ink/70">{t('chat.startConversation', { name: selectedChat.name })}</p>
                  <p className="max-w-md text-sm text-ink/50">{t('chat.startConversationSub')}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-ink/10 p-4">
              {sendError && (
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-rule">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {t('common.fetchError')}
                </p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('chat.messagePlaceholder')}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={sending}
                  className="flex-1 rounded-sm border border-ink/15 bg-paper px-4 py-2 font-body text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon/40"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !messageText.trim()}
                  aria-label={t('chat.send')}
                  className="flex items-center gap-2 rounded-sm bg-maroon px-4 py-2 text-paper transition-colors hover:bg-maroon-dark disabled:opacity-50"
                >
                  {sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </Slip>
        ) : (
          <Slip className="hidden flex-1 items-center justify-center md:flex">
            <div className="text-center">
              <Mail className="mx-auto mb-4 h-10 w-10 text-ink/25" />
              <p className="font-semibold text-ink/60">{t('chat.selectSeller')}</p>
            </div>
          </Slip>
        )}
      </div>
    </div>
  )
}
