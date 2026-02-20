import { useState, useEffect } from 'react'
import { useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { Send, Trash2, Eye, Search, X } from 'lucide-react'

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
      setUnreadCount(data.count || 0)
    } catch (err) {
      console.error('Error fetching unread count:', err)
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
    if (!confirm('¿Estás seguro de que deseas eliminar este mensaje?')) return

    try {
      await api.delete(`/api/messages/${messageId}`)
      fetchMessages()
      setSelectedMessage(null)
      setSuccess('Mensaje eliminado')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al eliminar mensaje')
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
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al enviar mensaje')
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
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    Enviar mensaje
                  </button>
                  <button
                    type="button"
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
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      selectedMessage?.id === msg.id
                        ? 'bg-indigo-50 border-indigo-300'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    } ${!msg.is_read && tab === 'inbox' ? 'font-semibold bg-blue-50' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {tab === 'inbox' ? msg.sender_name : msg.recipient_name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">{msg.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!msg.is_read && tab === 'inbox' && (
                        <div className="w-3 h-3 bg-indigo-600 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Preview */}
          <div>
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">
                    {tab === 'inbox' ? 'De:' : 'Para:'}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {tab === 'inbox' ? selectedMessage.sender_name : selectedMessage.recipient_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {tab === 'inbox' ? selectedMessage.sender_email : selectedMessage.recipient_email}
                  </p>
                </div>

                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Asunto:</p>
                  <h3 className="font-semibold text-gray-900">{selectedMessage.subject}</h3>
                </div>

                <div className="mb-6 pb-6 border-b border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap break-words text-sm">
                    {selectedMessage.content}
                  </p>
                </div>

                <div className="text-xs text-gray-500 mb-6">
                  {new Date(selectedMessage.created_at).toLocaleString('es-ES')}
                </div>

                <div className="flex gap-2">
                  {tab === 'inbox' && !selectedMessage.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(selectedMessage.id)}
                      className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Marcar como leído
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                <p>Selecciona un mensaje para verlo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
