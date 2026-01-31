import { useState, useEffect, useRef } from 'react'
import { X, Send, Loader } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import io from 'socket.io-client'

export default function MessageModal({ farmer, currentUserId, currentUsername, onClose }) {
  const { isDark } = useTheme()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch initial conversation
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/messages/conversation/${farmer.farmerId}`,
          { withCredentials: true }
        )
        if (response.data.success) {
          setMessages(response.data.messages)
        }
      } catch (error) {
        console.error('Error fetching conversation:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversation()
  }, [farmer.farmerId])

  // Initialize Socket.IO
  useEffect(() => {
    socketRef.current = io('http://localhost:8000')

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server')
      socketRef.current.emit('join', currentUserId)
    })

    socketRef.current.on('receive_message', (message) => {
      setMessages(prev => [...prev, message])
    })

    socketRef.current.on('message_sent', (message) => {
      setMessages(prev => [...prev, message])
    })

    socketRef.current.on('message_error', (error) => {
      console.error('Message error:', error)
      alert('Failed to send message: ' + error.error)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [currentUserId])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    const messageData = {
      senderId: currentUserId,
      receiverId: farmer.farmerId,
      message: newMessage,
      listingId: farmer.id
    }

    // Send via Socket.IO
    socketRef.current.emit('send_message', messageData)
    setNewMessage('')
    setSending(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl h-96 rounded-2xl flex flex-col ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div>
            <h3 className="text-lg font-bold">{farmer.name}</h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{farmer.location}</p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
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
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.senderId._id === currentUserId
                      ? 'bg-teal-600 text-white rounded-br-none'
                      : isDark
                      ? 'bg-slate-700 text-slate-100 rounded-bl-none'
                      : 'bg-slate-200 text-slate-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${msg.senderId._id === currentUserId ? 'text-teal-100' : 'text-slate-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No messages yet. Start the conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className={`flex gap-2 p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className={`flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 ${
              isDark
                ? 'bg-slate-700 border-0 text-slate-100 placeholder-slate-400'
                : 'bg-slate-100 border-0 text-slate-900 placeholder-slate-500'
            }`}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}
