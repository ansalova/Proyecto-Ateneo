import { useState, useEffect, useCallback, useRef } from 'react'
import { useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { Send, X, Check, Loader2, UserCircle, ArrowLeft, Bold, Smile, Mail, Trash2, Eye, Search, MessageCircle, Phone, Video, Paperclip, Mic } from 'lucide-react'
import { Sun, Moon } from 'lucide-react'

export default function Messaging() {
  const { user } = useContext(AuthContext)
  const [darkMode, setDarkMode] = useState(false)
  const [showCompose, setShowCompose] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [typing, setTyping] = useState(false)

  const [composeData, setComposeData] = useState({
    recipientId: '',
    recipientName: '',
    subject: '',
    content: ''
  })

  const [availableUsers, setAvailableUsers] = useState([])
  const [searchUsers, setSearchUsers] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [toolbarOpen, setToolbarOpen] = useState(false)
  const [contentPreview, setContentPreview] = useState('')

  const contentRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    fetchUnreadCount()
    if (currentChat) fetchMessages(currentChat.id)
  }, [])

  useEffect(() => {
    if (showCompose) {
      setAvailableUsers([])
      setSearchUsers('')
      setError('')
      fetchAvailableUsers('')
    }
  }, [showCompose])

  useEffect(() => {
    const preview = composeData.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    setContentPreview(preview)
  }, [composeData.content])

  // Fetch functions...
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('messages/unread/count')
      setUnreadCount(response.data.count || 0)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMessages = async (recipientId) => {
    try {
      setLoadingMessages(true)
      const response = await api.get(`messages?recipientId=${recipientId}`)
      setMessages(response.data || [])
    } catch (err) {
      setError('Error cargando mensajes')
    } finally {
      setLoadingMessages(false)
    }
  }

  const fetchAvailableUsers = async (search) => {
    try {
      setLoadingUsers(true)
      const url = search ? `/api/messages/users/available?search=${search}` : '/api/messages/users/available'
      const response = await api.get(url)
      setAvailableUsers(response.data || [])
    } catch (err) {
      setError('Error usuarios')
      setAvailableUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const getRoleColor = (role) => {
    return role === 'teacher' ? 'emerald' :
           role === 'admin' ? 'purple' :
           'blue'
  }

  const handleSelectChat = (user) => {
    setCurrentChat(user)
    fetchMessages(user.id)
  }

  const toggleBold = useCallback(() => {
    const textarea = contentRef.current
    if (textarea) {
      const start = textarea.selectionStart || 0
      const end = textarea.selectionEnd || start
      const selectedText = composeData.content.slice(start, end)
      let newContent = composeData.content.replace(/\*\*(.*?)\*\*/g, '$1')
      if (!selectedText.includes('**')) {
        newContent = composeData.content.slice(0, start) + '**' + selectedText + '**' + composeData.content.slice(end)
      }
      setComposeData({ ...composeData, content: newContent })
    }
  }, [composeData.content])

  const addEmoji = useCallback(() => {
    const textarea = contentRef.current
    if (textarea) {
      const start = textarea.selectionStart || 0
      const newContent = composeData.content.slice(0, start) + '😊 ' + composeData.content.slice(start)
      setComposeData({ ...composeData, content: newContent })
    }
  }, [composeData.content])

  const handleSend = async () => {
    // Simulate send
    const newMsg = {
      id: Date.now(),
      content: composeData.content,
      created_at: new Date().toISOString(),
      is_read: false,
      is_own: true
    }
    setMessages(prev => [...prev, newMsg])
    setComposeData({ ...composeData, content: '' })
    setTyping(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 from-slate-50 via-blue-50 to-indigo-100 p-2 md:p-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto h-screen flex flex-col md:flex-row gap-4">
        
        {/* Sidebar - Lista chats */}
        <div className="w-full md:w-80 bg-white/70 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 flex flex-col">
          {/* Header sidebar */}
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 dark:from-white to-gray-700 dark:to-slate-300 bg-clip-text text-transparent">
                💬 Mensajes
              </h1>
              <p className="text-sm text-gray-600 dark:text-slate-400 flex items-center gap-1">
                {unreadCount > 0 && (
                  <span className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse">
                    {unreadCount}
                  </span>
                )}
                sin leer
              </p>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-slate-600" />}
            </button>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                placeholder="Buscar chats..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-slate-700 rounded-2xl border border-gray-200 dark:border-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Lista chats */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {Array.from({length: 10}).map((_, i) => (
              <button
                key={i}
                onClick={() => handleSelectChat({id: i, name: 'Usuario ' + (i+1), role: i%3 === 0 ? 'teacher' : i%3 === 1 ? 'student' : 'admin'})}
                className={`w-full p-4 rounded-2xl hover:shadow-xl transition-all group ${currentChat?.id === i ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-2xl ring-4 ring-emerald-400/50' : 'bg-white/50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/50 ${getRoleColor('teacher')} ring-offset-2 ring-offset-transparent`}>
                    <UserCircle size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold truncate ${currentChat?.id === i ? 'text-white' : 'text-gray-900 dark:text-white'}`}>Usuario {i+1}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">Último mensaje...</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                    <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md animate-pulse">2</span>
                    <span className="text-xs text-gray-400 group-hover:text-emerald-600">10:30</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white/60 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 overflow-hidden">
          {/* Chat Header */}
          {currentChat && (
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/50 ${getRoleColor(currentChat.role)}`}>
                <UserCircle size={24} className="text-white" />
              </div>
              <div>
                <h2 className={`font-bold text-xl ${getRoleColor(currentChat.role)}-600`}>{currentChat.name}</h2>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs rounded-full font-medium">
                  En línea
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                </span>
              </div>
              <div className="flex-1" />
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-all">
                  <Phone size={20} />
                </button>
                <button className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-all">
                  <Video size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent via-white/50 dark:via-slate-900/50 to-transparent">
            {loadingMessages ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin h-8 w-8 text-emerald-500 mr-3" />
                <span>Cargando chat...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-slate-400">
                <MessageCircle size={64} className="mb-4 opacity-50" />
                <p className="text-xl font-medium mb-2">No hay mensajes</p>
                <p className="text-sm">Empieza la conversación</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.is_own ? 'justify-end' : 'justify-start'} animate-in slide-in-from-${msg.is_own ? 'right' : 'left'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-3xl shadow-lg ring-1 ring-gray-200/50 dark:ring-slate-700/50 transition-all hover:shadow-xl ${msg.is_own ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white'}`}>
                    <p className={`text-sm leading-relaxed ${msg.is_own ? 'text-white' : 'text-gray-900 dark:text-slate-200'}`}>
                      {msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                    </p>
                    <div className={`flex items-center gap-1 mt-2 text-xs ${msg.is_own ? 'text-emerald-100' : 'text-gray-500 dark:text-slate-400'}`}>
                      <span>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      {msg.is_own && (
                        <Check className="ml-1 w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {typing && (
              <div className="flex justify-start animate-in slide-in-from-left">
                <div className="bg-gray-200 dark:bg-slate-700 px-4 py-2.5 rounded-3xl shadow-lg flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
            <div className="flex items-end gap-3">
              <button className="p-3 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-2xl transition-all">
                <Paperclip size={20} />
              </button>
              <button className="p-3 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-2xl transition-all">
                <Smile size={20} />
              </button>
              <div className="flex-1 relative">
                <textarea
                  ref={contentRef}
                  placeholder="Escribe un mensaje..."
                  value={composeData.content}
                  onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                  className="w-full resize-none p-4 pr-16 pb-12 bg-gray-100 dark:bg-slate-700 rounded-3xl border border-gray-200 dark:border-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none text-lg min-h-[56px] placeholder-gray-500"
                  onFocus={() => setToolbarOpen(true)}
                />
                {toolbarOpen && (
                  <div className="absolute bottom-14 left-4 flex gap-2 bg-white dark:bg-slate-800 backdrop-blur-sm rounded-2xl p-2 shadow-xl border">
                    <button onClick={toggleBold} className="p-2 hover:bg-emerald-100 rounded-xl transition-all group">
                      <Bold size={18} className="group-hover:text-emerald-600" />
                    </button>
                    <button onClick={addEmoji} className="p-2 hover:bg-indigo-100 rounded-xl transition-all group">
                      <Smile size={18} className="group-hover:text-indigo-600" />
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={handleSend}
                disabled={!composeData.content.trim()}
                className={`p-4 rounded-3xl transition-all shadow-lg ring-2 ring-transparent hover:ring-emerald-400 focus:ring-emerald-400 ${composeData.content.trim() ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-400/50 hover:shadow-emerald-500/60 hover:scale-[1.05] text-white' : 'bg-gray-400 text-gray-600 cursor-not-allowed shadow-none'}`}
              >
                <Send size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
