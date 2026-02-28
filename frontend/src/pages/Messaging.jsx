import { useState, useEffect } from 'react'
import { useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { Send, Trash2, Eye, Search, X } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'

export default function Messaging() {
  const { user } = useContext(AuthContext)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('inbox') // inbox, sent
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showCompose, setShowCompose] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [composeData, setComposeData] = useState({
    recipientId: '',
    recipientName: '',
    subject: '',
    content: ''
  })

  const [availableUsers, setAvailableUsers] = useState([])
  const [searchUsers, setSearchUsers] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteId, setToDeleteId] = useState(null)
  const [isSending, setIsSending] = useState(false)

  // Cargar usuarios cuando se abre el modal de composición
  useEffect(() => {
    if (showCompose) {
      console.log('Modal opened, loading users...')
      setAvailableUsers([])
      setSearchUsers('')
      setError('')
      // Si no hay usuario autenticado ni token, no intentar cargar
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!user || !token) {
        setError('Debes iniciar sesión para enviar mensajes y ver usuarios registrados.')
        setLoadingUsers(false)
        return
      }

      // Cargar usuarios inmediatamente
      fetchAvailableUsers('')
    }
  }, [showCompose])

  // Fetch available users
  const fetchAvailableUsers = async (search = '') => {
    try {
      setLoadingUsers(true)
      setError('')
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        setError('Debes iniciar sesión para ver usuarios disponibles.')
        setAvailableUsers([])
        setLoadingUsers(false)
        return
      }

      const url = search.trim() 
        ? `/api/messages/users/available?search=${encodeURIComponent(search)}`
        : '/api/messages/users/available'
      console.log('Fetching from:', url)
      const { data } = await api.get(url)
      console.log('Users received:', data)
      setAvailableUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching users:', err)
      if (err.response?.status === 401) {
        setError('No autorizado. Por favor inicia sesión.')
      } else {
        setError('Error al cargar usuarios: ' + (err.response?.data?.msg || err.message))
      }
      setAvailableUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  // Fetch messages
  useEffect(() => {
    fetchMessages()
    fetchUnreadCount()
    // Actualizar cada 5 segundos mientras el usuario está en mensajes
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 5000)
    return () => clearInterval(interval)
  }, [tab])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/api/messages?folder=${tab}`)
      setMessages(data || [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al cargar mensajes')
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/api/messages/unread/count')
      const count = data.count || 0
      setUnreadCount(count)
      // notify header (and others) every time we refresh
      window.dispatchEvent(new Event('messagesUpdated'))
      return count
    } catch (err) {
      console.error('Error fetching unread count:', err)
      return null
    }
  }

  const handleMarkAsRead = async (messageId) => {
    try {
      await api.put(`/api/messages/${messageId}/read`)
      fetchMessages()
      fetchUnreadCount()
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const handleDelete = async (messageId) => {
    setToDeleteId(messageId)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!toDeleteId) return
    try {
      await api.delete(`/api/messages/${toDeleteId}`)
      fetchMessages()
      setSelectedMessage(null)
      setSuccess('Mensaje eliminado')
      setTimeout(() => setSuccess(''), 3000)
      setConfirmOpen(false)
      setToDeleteId(null)
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al eliminar mensaje')
      setConfirmOpen(false)
      setToDeleteId(null)
    }
  }

  const handleSelectUser = (selectedUser) => {
    console.log('User selected:', selectedUser)
    setComposeData({
      recipientId: selectedUser.id,
      recipientName: selectedUser.name,
      subject: '',
      content: ''
    })
  }

  const handleSearchUsers = (e) => {
    const value = e.target.value
    setSearchUsers(value)
    if (value.trim().length > 0) {
      fetchAvailableUsers(value)
    } else {
      fetchAvailableUsers('')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Protección contra envíos duplicados
    if (isSending) {
      return
    }

    if (!composeData.recipientId) {
      setError('Debes seleccionar un destinatario')
      return
    }

    if (!composeData.subject.trim()) {
      setError('El asunto es requerido')
      return
    }

    if (!composeData.content.trim()) {
      setError('El mensaje no puede estar vacío')
      return
    }

    if (composeData.content.length > 5000) {
      setError('Mensaje demasiado largo (máx 5000 caracteres)')
      return
    }

    try {
      setIsSending(true)
      await api.post('/api/messages/send', {
        recipientId: composeData.recipientId,
        subject: composeData.subject,
        content: composeData.content
      })
      setComposeData({ recipientId: '', recipientName: '', subject: '', content: '' })
      setShowCompose(false)
      setSuccess('Mensaje enviado correctamente')
      setTimeout(() => setSuccess(''), 3000)
      setTab('sent')
      fetchMessages()
      fetchUnreadCount()
      // Notificar al Header para actualizar el contador
      window.dispatchEvent(new Event('messagesUpdated'))
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al enviar mensaje')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mensajes</h1>
          <p className="text-gray-600">
            Tienes {unreadCount} mensaje{unreadCount !== 1 ? 's' : ''} sin leer
          </p>
        </div>

        {/* Tabs and Compose */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setTab('inbox')}
              className={`px-4 py-2 font-medium transition-colors ${
                tab === 'inbox'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bandeja de entrada
            </button>
            <button
              onClick={() => setTab('sent')}
              className={`px-4 py-2 font-medium transition-colors ${
                tab === 'sent'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Enviados
            </button>
          </div>

          <button
            onClick={() => {
              setShowCompose(!showCompose)
              setError('')
              setSuccess('')
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Nuevo mensaje
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">✓ {success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">✗ {error}</p>
          </div>
        )}

        {/* Compose Form */}
        {showCompose && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-2 border-indigo-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Nuevo mensaje</h2>
              <button
                type="button"
                onClick={() => {
                  setShowCompose(false)
                  setComposeData({ recipientId: '', recipientName: '', subject: '', content: '' })
                  setSearchUsers('')
                  setError('')
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* USUARIOS DISPONIBLES - LISTA GRANDE */}
            {!composeData.recipientId ? (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Selecciona un destinatario:
                </label>
                
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar usuario por nombre o email..."
                      value={searchUsers}
                      onChange={handleSearchUsers}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Grid de Usuarios */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {loadingUsers ? (
                    <div className="p-12 text-center">
                      <p className="text-gray-600 font-medium">Cargando usuarios...</p>
                    </div>
                  ) : availableUsers && availableUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {availableUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleSelectUser(u)}
                          className="text-left p-4 bg-white border border-gray-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-400 transition hover:shadow-md"
                        >
                          <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                          <p className="text-xs text-gray-600 mt-1">{u.email}</p>
                          <p className="text-xs text-indigo-600 font-medium mt-2">
                            {u.role === 'teacher' ? 'Profesor' : u.role === 'admin' ? 'Admin' : 'Estudiante'}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-gray-600">
                        {error ? `${error}` : 'No hay usuarios disponibles'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* FORMULARIO DE MENSAJE */
              <form onSubmit={handleSendMessage} className="space-y-4">
                {/* Destinatario Seleccionado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinatario
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 px-4 py-3 border-2 border-indigo-400 rounded-lg bg-indigo-50">
                      <p className="font-semibold text-gray-900">{composeData.recipientName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setComposeData({ recipientId: '', recipientName: '', subject: '', content: '' })
                        setSearchUsers('')
                        fetchAvailableUsers('')
                      }}
                      className="px-4 py-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition font-medium text-sm"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>

                {/* Asunto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    placeholder="Tema del mensaje"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Mensaje */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Mensaje *
                    </label>
                    <span className="text-sm text-gray-500">
                      {composeData.content.length}/5000
                    </span>
                  </div>
                  <textarea
                    placeholder="Escribe tu mensaje..."
                    value={composeData.content}
                    onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={isSending}
                    className={`px-6 py-2 text-white rounded-lg transition font-medium ${
                      isSending
                        ? 'bg-gray-400 cursor-not-allowed opacity-60'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isSending ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                  <button
                    type="button"
                    disabled={isSending}
                    onClick={() => {
                      setComposeData({ recipientId: '', recipientName: '', subject: '', content: '' })
                      setSearchUsers('')
                      fetchAvailableUsers('')
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Volver
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Messages List */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Messages Column */}
          <div className="md:col-span-2">
            {loading ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">Cargando mensajes...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">
                  {tab === 'inbox' ? 'No hay mensajes en la bandeja de entrada' : 'No hay mensajes enviados'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg) => {
                  const isInbox = tab === 'inbox'
                  const isUnread = isInbox && !msg.is_read
                  const senderName = isInbox ? msg.sender_name : msg.recipient_name
                  const senderEmail = isInbox ? msg.sender_email : msg.recipient_email
                  const isSelected = selectedMessage?.id === msg.id
                  
                  let bgColor, borderColor, textColor, avatarBg
                  if (isSelected) {
                    bgColor = '#4F46E5'
                    textColor = '#FFFFFF'
                    avatarBg = 'rgba(255,255,255,0.3)'
                  } else if (isInbox) {
                    bgColor = '#f0fdf4'
                    borderColor = '#22c55e'
                    textColor = '#111827'
                    avatarBg = '#22c55e'
                  } else {
                    bgColor = '#f0f9ff'
                    borderColor = '#0ea5e9'
                    textColor = '#111827'
                    avatarBg = '#0ea5e9'
                  }
                  
                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        backgroundColor: bgColor,
                        borderLeft: !isSelected ? `4px solid ${borderColor}` : 'none',
                        color: textColor,
                        border: isSelected ? 'none' : undefined,
                        boxShadow: isSelected ? '0 10px 25px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.3s ease',
                        marginBottom: '8px'
                      }}
                      onMouseEnter={(e) => !isSelected && (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
                      onMouseLeave={(e) => !isSelected && (e.currentTarget.style.boxShadow = 'none')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '12px', minWidth: 0, flex: 1, alignItems: 'flex-start' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: avatarBg,
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}>
                            {(senderName || 'U').split(' ').map(n=>n[0]).slice(0,2).join('')}
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {senderName}
                            </p>
                            <p style={{ fontSize: '12px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.8 }}>
                              {msg.subject || 'Sin asunto'}
                            </p>
                            <p style={{ fontSize: '12px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.7 }}>
                              {(msg.content || '').slice(0, 100)}
                            </p>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', fontSize: '12px', flexShrink: 0, opacity: 0.8 }}>
                          <div>{new Date(msg.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</div>
                          {isInbox && (
                            <div style={{ marginTop: '4px', fontWeight: 'bold', color: isUnread && !isSelected ? '#22c55e' : 'inherit' }}>
                              {isUnread ? '🔵 Nuevo' : '✓'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Message Preview - Chat Style */}
          <div>
            {selectedMessage ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'calc(100vh - 200px)'
              }}>
                {/* Header */}
                <div style={{
                  padding: '16px',
                  background: tab === 'inbox' ? 'linear-gradient(135deg, #22c55e 0%, #059669 100%)' : 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                  color: '#FFFFFF'
                }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', opacity: 0.9, margin: '0 0 8px 0' }}>
                    {tab === 'inbox' ? 'De:' : 'Para:'}
                  </p>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
                    {tab === 'inbox' ? selectedMessage.sender_name : selectedMessage.recipient_name}
                  </h3>
                  <p style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px', margin: '4px 0 0 0' }}>
                    {tab === 'inbox' ? selectedMessage.sender_email : selectedMessage.recipient_email}
                  </p>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                  {/* Asunto */}
                  <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '2px solid #e5e7eb' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px 0' }}>
                      Asunto
                    </p>
                    <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px', margin: 0 }}>
                      {selectedMessage.subject}
                    </p>
                  </div>

                  {/* Mensaje */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      padding: '16px',
                      borderRadius: '8px',
                      backgroundColor: tab === 'inbox' ? '#dcfce7' : '#cffafe',
                      borderLeft: `4px solid ${tab === 'inbox' ? '#22c55e' : '#0ea5e9'}`,
                      color: '#111827'
                    }}>
                      <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                        {selectedMessage.content}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', backgroundColor: '#f3f4f6', display: 'inline-block', padding: '4px 12px', borderRadius: '16px', margin: 0 }}>
                      {new Date(selectedMessage.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>

                {/* Status */}
                {tab === 'inbox' && (
                  <div style={{
                    textAlign: 'center',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    borderTop: '1px solid #e5e7eb',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: selectedMessage.is_read ? '#f9fafb' : '#f0fdf4',
                    color: selectedMessage.is_read ? '#4b5563' : '#22c55e'
                  }}>
                    {selectedMessage.is_read ? '✓ Mensaje leído' : '🔵 No leído'}
                  </div>
                )}

                {/* Actions */}
                <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tab === 'inbox' && !selectedMessage.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(selectedMessage.id)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, #22c55e 0%, #059669 100%)',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '500',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)'}
                      onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                    >
                      <Eye className="w-4 h-4" />
                      Marcar como leído
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '500',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)'}
                    onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #f3e8ff 100%)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '32px 16px',
                textAlign: 'center',
                position: 'sticky',
                top: '20px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                <p style={{ color: '#4b5563', fontWeight: '500', margin: '0 0 8px 0' }}>Selecciona un mensaje para verlo</p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Haz clic en cualquier mensaje de la lista</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        open={confirmOpen}
        title="Eliminar mensaje"
        message="¿Estás seguro de que deseas eliminar este mensaje? Esta acción es irreversible."
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setToDeleteId(null) }}
      />
    </div>
  )
}
