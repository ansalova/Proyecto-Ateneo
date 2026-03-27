import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { Send, X, Check, Loader2, UserCircle, ArrowLeft, Smile, Mail, Trash2, Search, Paperclip, MoreVertical, CheckCheck, MessageSquare as MessageSquareIcon } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'
import AlertModal from '../components/AlertModal'
import UserProfilePanel from './UserProfilePanel' // Nuevo componente

export default function Messaging() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [activeTab, setActiveTab] = useState('contacts') // 'contacts' o 'chat' en móvil
  const [showChatSearch, setShowChatSearch] = useState(false)
  const [chatSearchTerm, setChatSearchTerm] = useState('')
  const [showChatMenu, setShowChatMenu] = useState(false)
  const [showSidebarMenu, setShowSidebarMenu] = useState(false)
  
  // Estados para Modales y Paneles Profesionales
  const [showProfilePanel, setShowProfilePanel] = useState(false)
  const [deleteOptionsOpen, setDeleteOptionsOpen] = useState(false)
  const [messageForDelete, setMessageForDelete] = useState(null)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '' })

  const [composeData, setComposeData] = useState({
    recipientId: '',
    recipientName: '',
    subject: '',
    content: ''
  })

  const [availableUsers, setAvailableUsers] = useState([])
  const [profilePanelUserId, setProfilePanelUserId] = useState(null) // Estado para guardar el ID del usuario cuyo perfil se está viendo
  const [searchUsers, setSearchUsers] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [toolbarOpen, setToolbarOpen] = useState(false)
  const [contentPreview, setContentPreview] = useState('')

  const contentRef = useRef(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const searchInputRef = useRef(null)

  // Emojis populares para el selector
  const commonEmojis = ['😊', '👍', '🙌', '🚀', '📚', '✅', '📍', '💡', '🎉', '👋'];

  // Auto-scroll al final del chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (composeData.recipientId) scrollToBottom()
  }, [messages, composeData.recipientId])

  // Load data on mount
  useEffect(() => {
    fetchUnreadCount()
    fetchMessages()
  }, [])

  // Cargar usuarios al inicio para el sidebar
  useEffect(() => {
    fetchAvailableUsers('')
  }, [])

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
      console.error('fetchUnreadCount:', err)
    }
  }

  const fetchMessages = async (targetId = null) => {
    try {
      setLoadingMessages(true)
      // Si hay un targetId, filtramos la conversación con ese usuario
      const url = targetId ? `/api/messages/?folder=inbox&contactId=${targetId}` : '/api/messages/?folder=inbox'
      const response = await api.get(url)
      const data = response.data || []
      setMessages(data)

      // Auto-marcar como leídos los mensajes recibidos en esta conversación
      if (targetId) {
        const unread = data.filter(m => !m.is_read && m.recipient_id === user?.id)
        unread.forEach(m => api.put(`/api/messages/${m.id}/read`).catch(() => {}))
        if (unread.length > 0) fetchUnreadCount()
      }
    } catch (err) {
      console.error('fetchMessages:', err)
      setError('Error cargando mensajes')
    } finally {
      setLoadingMessages(false)
    }
  }

  const fetchAvailableUsers = async (search = '') => {
    try {
      setLoadingUsers(true)
      const url = search.trim() 
        ? `/api/messages/users/available?search=${encodeURIComponent(search)}`
        : '/api/messages/users/available'
      const response = await api.get(url)
      setAvailableUsers(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error('fetchAvailableUsers:', err)
      setError('Error al cargar usuarios')
      setAvailableUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSelectUser = (selectedUser) => {
    setShowChatSearch(false)
    setChatSearchTerm('')
    setShowChatMenu(false)
    setShowSidebarMenu(false)
    setComposeData({
      recipientId: selectedUser.id,
      recipientName: `${selectedUser.name} (${selectedUser.role === 'teacher' ? 'Profesor' : selectedUser.role === 'admin' ? 'Admin' : 'Estudiante'})`,
      subject: '',
      content: ''
    })
    fetchMessages(selectedUser.id)
    setActiveTab('chat')
  }

  const handleSearchUsers = (e) => {
    const value = e.target.value
    setSearchUsers(value)
    fetchAvailableUsers(value)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (isSending) return

    const targetId = composeData.recipientId
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
      setComposeData(prev => ({ ...prev, subject: '', content: '' }))
      setSuccess('Mensaje enviado ✓')
      setTimeout(() => setSuccess(''), 3000)
      fetchMessages(targetId)
      setSelectedFile(null)
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

  const addEmoji = (emoji) => {
    const textarea = contentRef.current
    if (textarea && 'selectionStart' in textarea) {
      const start = textarea.selectionStart || 0
      const newContent = composeData.content.slice(0, start) + emoji + ' ' + composeData.content.slice(start)
      setComposeData({...composeData, content: newContent})
      setShowEmojiPicker(false)
      // Devolver el foco al textarea
      setTimeout(() => textarea.focus(), 10)
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setSuccess(`Archivo seleccionado: ${file.name}`)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleMarkAsRead = async (messageId) => {
    try {
      await api.put(`/api/messages/${messageId}/read`)
      fetchMessages()
      fetchUnreadCount()
    } catch (err) {
      console.error('markAsRead:', err)
    }
  }

  const handleDeleteClick = (msg) => {
    setMessageForDelete(msg)
    setDeleteOptionsOpen(true)
  }

  const confirmDelete = async (mode = 'me') => {
    if (!messageForDelete) return
    try {
      await api.delete(`/api/messages/${messageForDelete.id}?mode=${mode}`)
      fetchMessages(composeData.recipientId)
    } catch (err) {
      console.error('delete:', err)
    } finally {
      setDeleteOptionsOpen(false)
      setMessageForDelete(null)
    }
  }

  const showUserInfo = () => {
    // Restringir el acceso a perfiles detallados solo para profesores y admins
    if (user?.role !== 'teacher' && user?.role !== 'admin') {
      setInfoModalContent({
        title: 'Acceso Restringido',
        message: 'Por políticas de privacidad y protección de datos, la información detallada de los usuarios solo es visible para el personal docente y administrativo.'
      });
      setInfoModalOpen(true);
      return;
    }

    if (composeData.recipientId) {
      setProfilePanelUserId(composeData.recipientId)
      setShowProfilePanel(true)
    }
  }

  // Cerrar el panel de perfil cuando el destinatario cambia o el chat se cierra
  useEffect(() => {
    if (!composeData.recipientId) {
      setShowProfilePanel(false)
      setProfilePanelUserId(null)
    }
  }, [composeData.recipientId])

  // Filtrar mensajes según el término de búsqueda en el chat
  const filteredMessages = useMemo(() => {
    if (!chatSearchTerm.trim()) return messages
    return messages.filter(m => 
      m.content.toLowerCase().includes(chatSearchTerm.toLowerCase())
    )
  }, [messages, chatSearchTerm])

  return (
    <div className="messaging-layout" style={{ 
      height: 'calc(100vh - 120px)', 
      display: 'flex', 
      background: '#f0f2f5',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
      margin: '20px auto',
      maxWidth: '1200px'
    }}>
      {/* SIDEBAR: Lista de Contactos */}
      <div className={`sidebar ${activeTab === 'chat' ? 'mobile-hidden' : ''}`} style={{
        width: '350px',
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <header style={{ padding: '16px', background: '#f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div 
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1f7a4a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            className="cursor-pointer"
            title="Ir a mi perfil"
            onClick={() => navigate('/perfil')}
          >
            <UserCircle size={24} />
          </div>
          <div style={{ display: 'flex', gap: '16px', color: '#54656f', position: 'relative' }}>
            <MessageSquareIcon 
              size={22} 
              className="cursor-pointer" 
              title="Nuevo chat" 
              onClick={() => {
                setComposeData({ recipientId: '', recipientName: '', subject: '', content: '' });
                searchInputRef.current?.focus();
              }} 
            />
            <div style={{ position: 'relative' }}>
              <MoreVertical 
                size={22} 
                className="cursor-pointer" 
                title="Opciones" 
                onClick={() => setShowSidebarMenu(!showSidebarMenu)} 
              />
              {showSidebarMenu && (
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  right: '0',
                  background: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  borderRadius: '4px',
                  padding: '8px 0',
                  zIndex: 100,
                  width: '180px'
                }}>
                  <div 
                    className="menu-item"
                    style={{ padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}
                    onClick={() => {
                      fetchAvailableUsers();
                      setShowSidebarMenu(false);
                    }}
                  >
                    Actualizar contactos
                  </div>
                  <div 
                    className="menu-item"
                    style={{ padding: '8px 16px', fontSize: '14px', cursor: 'pointer', borderTop: '1px solid #f0f2f5' }}
                    onClick={() => navigate('/perfil')}
                  >
                    Configuración de perfil
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={{ padding: '8px 16px' }}>
          <div className="search-container" style={{ background: '#f0f2f5', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
            <Search size={18} color="#54656f" />
            <input 
              ref={searchInputRef}
              placeholder="Busca un contacto..." 
              value={searchUsers}
              onChange={handleSearchUsers}
              style={{ border: 'none', background: 'transparent', padding: '10px', width: '100%', outline: 'none', fontSize: '14px' }} 
            />
          </div>
        </div>

        <div className="contacts-list" style={{ flex: 1, overflowY: 'auto' }}>
          {loadingUsers ? (
            <div style={{ padding: '20px', textAlign: 'center' }}><Loader2 className="animate-spin inline" /></div>
          ) : availableUsers.map(u => (
            <div 
              key={u.id} 
              onClick={() => handleSelectUser(u)}
              className={`contact-item ${composeData.recipientId === u.id ? 'active' : ''}`}
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f2f5',
                background: composeData.recipientId === u.id ? '#f0f2f5' : 'transparent'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ccc', flexShrink: 0 }}>
                <UserCircle size={48} color="#999" />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '16px' }}>{u.name}</strong>
                  <small style={{ color: '#667781' }}>{u.role === 'teacher' ? 'Prof' : 'Est'}</small>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#667781', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {u.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className={`chat-window ${activeTab === 'contacts' && !composeData.recipientId ? 'mobile-hidden' : ''}`} style={{
        flex: 1,
        background: '#efeae2', // Color fondo WhatsApp
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {!composeData.recipientId ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
             <div style={{ width: '200px', height: '200px', background: '#ddd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Mail size={100} color="#666" />
             </div>
             <h2 style={{ margin: 0 }}>Ateneo Mensajes</h2>
             <p>Selecciona un contacto para empezar a chatear.</p>
          </div>
        ) : (
          <>
            <header style={{ padding: '10px 16px', background: '#f0f2f5', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #e5e7eb' }}>
              <ArrowLeft className="desktop-hidden cursor-pointer" onClick={() => setActiveTab('contacts')} />
              <div 
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ccc' }}
                className="cursor-pointer"
                title="Ver información de contacto"
                onClick={showUserInfo}
              >
                <UserCircle size={40} color="#999" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0 }}>{composeData.recipientName.split('(')[0]}</h4>
                <small style={{ color: '#667781' }}>En línea</small>
              </div>
              
              {showChatSearch && (
                <div style={{ background: '#fff', borderRadius: '4px', padding: '2px 8px', display: 'flex', alignItems: 'center', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
                  <input 
                    autoFocus
                    placeholder="Buscar en el chat..." 
                    value={chatSearchTerm}
                    onChange={(e) => setChatSearchTerm(e.target.value)}
                    style={{ border: 'none', outline: 'none', fontSize: '13px', width: '120px' }}
                  />
                  <X size={14} color="#54656f" className="cursor-pointer" onClick={() => { setShowChatSearch(false); setChatSearchTerm(''); }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                <Search 
                  size={20} 
                  color={showChatSearch ? "#1f7a4a" : "#54656f"} 
                  className="cursor-pointer" 
                  title="Buscar en chat"
                  onClick={() => setShowChatSearch(!showChatSearch)} 
                />
                <div style={{ position: 'relative' }}>
                  <MoreVertical 
                    size={20} 
                    color={showChatMenu ? "#1f7a4a" : "#54656f"} 
                    className="cursor-pointer" 
                    title="Opciones"
                    onClick={() => setShowChatMenu(!showChatMenu)}
                  />
                  
                  {showChatMenu && (
                    <div style={{
                      position: 'absolute',
                      top: '30px',
                      right: '0',
                      background: '#fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      borderRadius: '4px',
                      padding: '8px 0',
                      zIndex: 100,
                      width: '160px'
                    }}>
                      <div 
                        className="menu-item"
                        style={{ padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}
                        onClick={() => {
                          setComposeData({ recipientId: '', recipientName: '', subject: '', content: '' });
                          setShowChatMenu(false);
                        }}
                      >
                        Cerrar chat
                      </div>
                      <div 
                        className="menu-item"
                        style={{ padding: '8px 16px', fontSize: '14px', cursor: 'pointer', color: '#ef4444', borderTop: '1px solid #f0f2f5' }}
                        onClick={() => {
                          setInfoModalContent({
                            title: 'Próximamente',
                            message: 'La función para vaciar toda la conversación estará disponible en la próxima actualización de Ateneo.'
                          });
                          setInfoModalOpen(true);
                          setShowChatMenu(false);
                        }}
                      >
                        Vaciar chat
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <div className="messages-area" style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {filteredMessages.map(msg => {
                 const isOwn = msg.sender_id === user?.id;
                 return (
                   <div key={msg.id} style={{
                     alignSelf: isOwn ? 'flex-end' : 'flex-start',
                     maxWidth: '70%',
                     background: isOwn ? '#dcf8c6' : '#fff',
                     padding: '8px 12px',
                     borderRadius: '8px',
                     boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                     position: 'relative',
                     fontSize: '14.5px'
                   }}>
                     <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                     <div style={{ textAlign: 'right', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <small style={{ fontSize: '11px', color: '#667781' }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                        {isOwn && (
                          msg.is_read ? <CheckCheck size={14} color="#53bdeb" /> : <Check size={14} color="#667781" />
                        )}
                        <Trash2 
                          size={13} 
                          className="cursor-pointer" 
                          color="#ef4444" 
                          style={{ marginLeft: '8px', opacity: 0.6 }}
                          title="Eliminar mensaje"
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(msg); }}
                        />
                     </div>
                   </div>
                 )
               })}
               <div ref={messagesEndRef} />
            </div>

            <footer style={{ padding: '10px 16px', background: '#f0f2f5', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
              {/* Selector de Emojis */}
              {showEmojiPicker && (
                <div style={{
                  position: 'absolute',
                  bottom: '60px',
                  left: '16px',
                  background: '#fff',
                  padding: '10px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  display: 'flex',
                  gap: '8px',
                  zIndex: 10
                }}>
                  {commonEmojis.map(e => (
                    <span key={e} onClick={() => addEmoji(e)} style={{ cursor: 'pointer', fontSize: '20px' }}>{e}</span>
                  ))}
                </div>
              )}

              <Smile 
                size={24} 
                color={showEmojiPicker ? "#1f7a4a" : "#54656f"} 
                className="cursor-pointer" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              />
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              <Paperclip 
                size={24} 
                color={selectedFile ? "#1f7a4a" : "#54656f"} 
                className="cursor-pointer" 
                onClick={handleFileClick}
              />

              <div style={{ flex: 1, background: '#fff', borderRadius: '8px', padding: '5px 12px', display: 'flex', flexDirection: 'column' }}>
                {selectedFile && (
                  <div style={{ fontSize: '12px', color: '#1f7a4a', paddingBottom: '4px', borderBottom: '1px solid #eee', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Paperclip size={12} /> {selectedFile.name}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedFile(null)} />
                  </div>
                )}
                <textarea 
                  ref={contentRef}
                  placeholder="Escribe un mensaje..."
                  value={composeData.content}
                  onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                  style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', height: '24px', fontSize: '15px', paddingTop: '4px' }}
                />
              </div>
              <button 
                onClick={handleSendMessage}
                disabled={!composeData.content.trim() || isSending}
                style={{ background: 'transparent', border: 'none', color: '#1f7a4a', cursor: 'pointer' }}
              >
                {isSending ? <Loader2 className="animate-spin" /> : <Send size={24} />}
              </button>
            </footer>
          </>
        )}
      </div>

      <style>{`
        .contact-item:hover { background: #f5f6f6 !important; }
        .menu-item:hover { background: #f5f6f6 !important; }
        .mobile-hidden { display: flex !important; }
        .desktop-hidden { display: none !important; }
        @media (max-width: 768px) {
          .mobile-hidden { display: none !important; }
          .desktop-hidden { display: block !important; }
          .sidebar { width: 100% !important; }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Modales Profesionales */}
      <AlertModal 
        open={infoModalOpen}
        title={infoModalContent.title}
        message={infoModalContent.message}
        onClose={() => setInfoModalOpen(false)}
      />

      {/* Modal Profesional de Selección de Borrado (Estilo WhatsApp) */}
      {deleteOptionsOpen && (
        <div className="modal-backdrop" onClick={() => setDeleteOptionsOpen(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div className="modal-window" style={{ background: '#fff', borderRadius: '8px', padding: '24px', maxWidth: '320px', width: '90%', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#54656f' }}>¿Deseas eliminar el mensaje?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => confirmDelete('me')}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#fff', color: '#1f7a4a', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
              >
                Eliminar para mí
              </button>
              {messageForDelete?.sender_id === user?.id && (
                <button 
                  onClick={() => confirmDelete('everyone')}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#fff', color: '#ef4444', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
                >
                  Eliminar para todos
                </button>
              )}
              <button 
                onClick={() => setDeleteOptionsOpen(false)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: 'none', background: 'transparent', color: '#54656f', fontWeight: '600', cursor: 'pointer', textAlign: 'right', marginTop: '8px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nuevo Panel de Perfil de Usuario */}
      {showProfilePanel && (
        <UserProfilePanel 
          userId={profilePanelUserId} 
          onClose={() => setShowProfilePanel(false)} 
          availableUsers={availableUsers} // Pasamos availableUsers para los datos mock
        />
      )}
    </div>
  )
}
