import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import API from '../services/api'
import { Trash2, Plus, MessageCircle } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'

export default function Anuncios() {
  const { user } = useContext(AuthContext)
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', content: '' })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteId, setToDeleteId] = useState(null)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/api/announcements')
      setAnnouncements(data)
      
      // Marcar todos los anuncios no leídos como leídos en una sola petición
      const unreadIds = data
        .filter(ann => !ann.is_read)
        .map(ann => ann.id)
      
      if (unreadIds.length > 0) {
        try {
          await API.post('/api/announcements/mark-read-batch', { ids: unreadIds })
        } catch (err) {
          // Si falla la petición batch, fallback: intentar individual (pero no bloquea)
          console.warn('Batch mark-read falló, intentando individual:', err)
          for (const id of unreadIds) {
            try {
              await API.post(`/api/announcements/${id}/mark-read`)
            } catch (e) {
              console.error(`Error marking announcement ${id} as read:`, e)
            }
          }
        }
      }
      
      setError('')
    } catch (err) {
      setError('Error al cargar anuncios')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Llena todos los campos')
      return
    }

    try {
      await API.post('/api/announcements', formData)
      setFormData({ title: '', content: '' })
      setShowForm(false)
      fetchAnnouncements()
      setError('')
    } catch (err) {
      setError('Error al crear anuncio')
      console.error(err)
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    setToDeleteId(id)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!toDeleteId) return
    try {
      await API.delete(`/api/announcements/${toDeleteId}`)
      setConfirmOpen(false)
      setToDeleteId(null)
      fetchAnnouncements()
    } catch (err) {
      setError('Error al eliminar anuncio')
      console.error(err)
    }
  }

  if (loading) return <div className="card"><p>Cargando anuncios...</p></div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <MessageCircle size={32} style={{ color: '#2563eb' }} />
        <h1 style={{ margin: 0 }}>Anuncios</h1>
      </div>

      {error && (
        <div
          className="card"
          style={{
            background: '#fff5f5',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {user && (user.role === 'admin' || user.role === 'teacher') && (
        <div style={{ marginBottom: 24 }}>
          {!showForm && (
            <button
              className="button"
              onClick={() => setShowForm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={18} /> Nuevo Anuncio
            </button>
          )}

          {showForm && (
            <div className="card" style={{ background: '#f0f9ff' }}>
              <h3>Crear Anuncio</h3>
              <form onSubmit={handleCreateAnnouncement}>
                <label>Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: 8, marginBottom: 12 }}
                  placeholder="Ej: Cierre de Inscripciones"
                />

                <label>Contenido</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  style={{ width: '100%', padding: 8, marginBottom: 12, height: 120, fontFamily: 'inherit' }}
                  placeholder="Escribe el contenido del anuncio..."
                />

                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="button">
                    Publicar
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={() => setShowForm(false)}
                    style={{ background: '#ccc' }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      <div>
        {announcements.length === 0 ? (
          <div className="card">
            <p style={{ opacity: 0.7 }}>No hay anuncios disponibles</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>{ann.title}</h3>
                  <p style={{ color: '#666', margin: '0 0 12px 0' }}>{ann.content}</p>
                  <small style={{ opacity: 0.6 }}>
                    {new Date(ann.created_at).toLocaleDateString('es-CO')} • Por {ann.created_by_name || 'Admin'}
                  </small>
                </div>
                {user && (user.role === 'admin' || (user.role === 'teacher' && user.id === ann.created_by)) && (
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      padding: 8,
                      borderRadius: 4,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
                <ConfirmModal
                  open={confirmOpen}
                  title="Eliminar anuncio"
                  message="¿Eliminar este anuncio? Esta acción es irreversible."
                  onConfirm={confirmDelete}
                  onCancel={() => { setConfirmOpen(false); setToDeleteId(null) }}
                />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
