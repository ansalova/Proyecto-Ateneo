import { useState, useEffect, useCallback, useRef } from 'react'
import { useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { Send, X, Check, Loader2, UserCircle, ArrowLeft } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'

export default function Messaging() {
  const { user } = useContext(AuthContext)
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
  const [isSending, setIsSending] = useState(false)
  const [toolbarOpen, setToolbarOpen] = useState(false)
  const [contentPreview, setContentPreview] = useState('')

  const contentRef = useRef(null)

  // Load unread count on mount
  useEffect(() => {
    console.log('Messaging mounted - loading unread count')
    fetchUnreadCount()
  }, [])

  // Load users when compose opens
  useEffect(() => {
    if (showCompose) {
      console.log('Compose modal opened - loading users')
      setAvailableUsers([])
      setSearchUsers('')
      setError('')
      fetchAvailableUsers('')
    }
  }, [showCompose])

  // Live preview
  useEffect(() => {
    const preview = composeData.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    setContentPreview(preview)
  }, [composeData.content])

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/api/messages/unread/count')
      setUnreadCount(response.data.count || 0)
    } catch (err) {
      console.error('fetchUnreadCount error:', err)
    }
  }

  const fetchAvailableUsers = async (search = '') => {
    try {
      setLoadingUsers(true)
      setError('')
      const url = search.trim() 
        ? `/api/messages/users/available?search=${encodeURIComponent(search)}`
        : '/api/messages/users/available'
      const response = await api.get(url)
      setAvailableUsers(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error('fetchAvailableUsers error:', err)
      setError('Error al cargar usuarios')
      setAvailableUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSelectUser = (selectedUser) => {
    setComposeData({
      recipientId: selectedUser.id,
      recipientName: `${selectedUser.name} (${selectedUser.role === 'teacher' ? 'Profesor' : selectedUser.role === 'admin' ? 'Admin' : 'Estudiante'})`,
      subject: '',
      content: ''
    })
  }

  const handleSearchUsers = (e) => {
    const value = e.target.value
    setSearchUsers(value)
    fetchAvailableUsers(value)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (isSending) return

    if (!composeData.recipientId) {
      setError('Selecciona destinatario')
      return
    }
    if (!composeData.content.trim()) {
      setError('Mensaje vacío')
      return
    }

    try {
      setIsSending(true)
      await api.post('/api/messages/send', composeData)
      setComposeData({ recipientId: '', recipientName: '', subject: '', content: '' })
      setShowCompose(false)
      setSuccess('Mensaje enviado ✓')
      setTimeout(() => setSuccess(''), 3000)
      fetchUnreadCount()
    } catch (err) {
      setError(err.response?.data?.msg || 'Error envío')
    } finally {
      setIsSending(false)
    }
  }

  const toggleBold = useCallback(() => {
    const textarea = contentRef.current
    if (textarea && 'selectionStart' in textarea) {
      const start = textarea.selectionStart || 0
      const end = textarea.selectionEnd || start
      const selectedText = composeData.content.slice(start, end)
      
      let newContent
      if (selectedText.includes('**')) {
        newContent = composeData.content.replace(/\*\*(.*?)\*\*/g, '$1')
      } else {
        newContent = composeData.content.slice(0, start) + '**' + selectedText + '**' + composeData.content.slice(end)
      }
      setComposeData({...composeData, content: newContent})
    }
  }, [composeData.content])

  const addEmoji = useCallback(() => {
    const textarea = contentRef.current
    if (textarea && 'selectionStart' in textarea) {
      const start = textarea.selectionStart || 0
      const emoji = '😊 '
      const newContent = composeData.content.slice(0, start) + emoji + composeData.content.slice(start)
      setComposeData({...composeData, content: newContent})
    }
  }, [composeData.content])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white/80 backdrop-blur-md shadow-xl rounded-3xl p-8 mb-8 border border-white/50">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Mensajes</h1>
              <p className="text-2xl text-gray-600 flex items-center gap-2">
                {unreadCount > 0 && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                    {unreadCount}
                  </div>
                )}
                mensajes sin leer
              </p>
            </div>
            <button
              onClick={() => setShowCompose(true)}
              className="group bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 ring-2 ring-emerald-400/50"
            >
              <Send size={24} />
              Nuevo Mensaje
            </button>
          </div>
        </header>

        {success && (
          <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <Check className="text-emerald-600" />
              <p className="font-semibold text-emerald-800">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <X className="text-red-600" />
              <p className="font-semibold text-red-800">{error}</p>
            </div>
          </div>
        )}

        {showCompose && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 mb-12">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">✉️ Nuevo Mensaje</h2>
              <button
                onClick={() => {
                  setShowCompose(false)
                  setComposeData({ recipientId: '', recipientName: '', subject: '', content: '' })
                }}
                className="p-2 hover:bg-gray-200 rounded-xl"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {!composeData.recipientId ? (
              <div>
                <div className="flex items-center gap-3 mb-6 p-4 bg-indigo-50 rounded-2xl">
                  <Search size={24} className="text-indigo-600" />
                  <input
                    type="text"
                    placeholder="🔍 Buscar por nombre o email..."
                    value={searchUsers}
                    onChange={handleSearchUsers}
                    className="flex-1 bg-transparent text-xl placeholder-gray-500 outline-none"
                  />
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={32} className="animate-spin text-indigo-600 mr-3" />
                      <span>Cargando contactos...</span>
                    </div>
                  ) : availableUsers.length > 0 ? (
                    availableUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectUser(u)}
                        className="group w-full p-6 bg-white border border-gray-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-xl transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-lg">
                            <UserCircle size={28} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900">{u.name}</h3>
                            <p className="text-sm text-gray-600">{u.email}</p>
                            <span className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-indigo-600 text-xs font-semibold text-white rounded-full">
                              {u.role === 'teacher' ? 'Profesor' : u.role === 'admin' ? 'Admin' : 'Estudiante'}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-16 text-gray-500">
                      <UserCircle size={64} className="mx-auto mb-4 opacity-50" />
                      <p>{error || 'No hay usuarios disponibles'}</p>
                      <p className="text-sm">Empieza buscando por nombre o email</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-6">
                <div className="bg-indigo-500 text-white p-6 rounded-3xl shadow-2xl -mx-8 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                      <UserCircle size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{composeData.recipientName}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setComposeData({ recipientId: '', recipientName: '', subject: '', content: '' })
                          setSearchUsers('')
                        }}
                        className="flex items-center gap-2 mt-1 text-indigo-200 hover:text-white text-sm"
                      >
                        <ArrowLeft size={16} />
                        Cambiar
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Mail size={20} className="text-indigo-600" />
                    Asunto
                  </label>
                  <input
                    name="subject"
                    type="text"
                    placeholder="Asunto del mensaje..."
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:outline-none text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    Mensaje ({composeData.content.length}/5000)
                  </label>
                  
                  {toolbarOpen && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl mb-3 border">
                      <button type="button" onClick={toggleBold} className="p-2 hover:bg-gray-200 rounded-lg">
                        <Bold size={18} />
                      </button>
                      <button type="button" onClick={addEmoji} className="p-2 hover:bg-gray-200 rounded-lg">
                        <Smile size={18} />
                      </button>
                      <div className="flex-1" />
                      <button type="button" onClick={() => setToolbarOpen(false)} className="p-2 hover:bg-gray-200 rounded-lg text-xs">
                        Done
                      </button>
                    </div>
                  )}
                  
                  <div className="relative">
                    <textarea
                      ref={contentRef}
                      name="content"
                      placeholder="Escribe tu mensaje..."
                      value={composeData.content}
                      onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                      rows={8}
                      onFocus={() => setToolbarOpen(true)}
                      className="w-full px-5 py-6 border border-gray-200 rounded-3xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 focus:outline-none resize-none min-h-[160px]"
                    />
                    <button
                      type="button"
                      onClick={toggleBold}
                      className="absolute bottom-4 right-4 p-2 bg-white border rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
                    >
                      <Bold size={18} />
                    </button>
                  </div>
                </div>

                {composeData.content && (
                  <div className="p-6 bg-gray-50 rounded-2xl border">
                    <h4 className="font-bold mb-4">Preview:</h4>
                    <div className="bg-white p-6 rounded-2xl max-h-48 overflow-y-auto border">
                      <div dangerouslySetInnerHTML={{ __html: contentPreview }} />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSending}
                    className={`flex-1 py-4 px-8 font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 text-lg ${
                      isSending
                        ? 'bg-gray-400 cursor-not-allowed opacity-60'
                        : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-emerald-400/50 ring-2 ring-emerald-400/50 text-white hover:shadow-2xl'
                    } transition-all`}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={24} />
                        Enviar Mensaje
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isSending}
                    onClick={() => {
                      setComposeData({ recipientId: '', recipientName: '', subject: '', content: '' })
                      setSearchUsers('')
                    }}
                    className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all ring-2 ring-gray-300/50"
                  >
                    <X size={20} />
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <ConfirmModal
          open={confirmOpen}
          title="🗑️ Eliminar mensaje"
          message="Esta acción es irreversible. ¿Confirmar?"
          onConfirm={confirmDelete}
          onCancel={() => { 
            setConfirmOpen(false); 
            setToDeleteId(null) 
          }}
        />
      </div>
    </div>
  )
}
