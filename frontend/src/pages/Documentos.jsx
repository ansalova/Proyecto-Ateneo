import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import API from '../services/api'
import { Download, Trash2, Plus } from 'lucide-react'

export default function Documentos() {
  const { user } = useContext(AuthContext)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [students, setStudents] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    document_type: 'certificado',
    student_id: '',
    file_url: '',
    is_public: false,
  })

  useEffect(() => {
    // Solo cargar documentos si hay usuario autenticado
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (user && token) {
      fetchDocuments()
      if (user.role === 'admin' || user.role === 'teacher') {
        fetchStudents()
      }
    } else if (!token) {
      setError('Debes iniciar sesión para ver documentos')
      setLoading(false)
    }
  }, [user])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/api/documents')
      setDocuments(data)
      setError('')
    } catch (err) {
      console.error('Error en fetchDocuments:', err.response?.status, err.response?.data, err.message)
      if (err.response?.status === 401) {
        setError('No autorizado. Por favor inicia sesión de nuevo.')
      } else if (err.response?.status === 500) {
        setError('Error del servidor. Contacta al administrador.')
      } else {
        setError('Error al cargar documentos: ' + (err.response?.data?.msg || err.message))
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const { data } = await API.get('/api/teacher/students')
      setStudents(data)
    } catch (err) {
      console.error('Error al cargar estudiantes:', err)
    }
  }

  const handleCreateDocument = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.file_url.trim()) {
      setError('Llena los campos obligatorios')
      return
    }

    try {
      await API.post('/api/documents', formData)
      setFormData({
        title: '',
        document_type: 'certificado',
        student_id: '',
        file_url: '',
        is_public: false,
      })
      setShowForm(false)
      fetchDocuments()
      setError('')
    } catch (err) {
      setError('Error al crear documento')
      console.error(err)
    }
  }

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('¿Eliminar este documento?')) return
    try {
      await API.delete(`/api/documents/${id}`)
      fetchDocuments()
    } catch (err) {
      setError('Error al eliminar documento')
      console.error(err)
    }
  }

  const documentTypeLabel = {
    certificado: 'Certificado',
    constancia: 'Constancia',
    reporte: 'Reporte',
    otro: 'Otro',
  }

  if (loading) return <div className="card"><p>Cargando documentos...</p></div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>Documentos</h1>

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
              <Plus size={18} /> Nuevo Documento
            </button>
          )}

          {showForm && (
            <div className="card" style={{ background: '#f0f9ff' }}>
              <h3>Crear documento</h3>
              <form onSubmit={handleCreateDocument}>
                <label>Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: 8, marginBottom: 12 }}
                  placeholder="Ej: Certificado de Asistencia 2026"
                />

                <label>Tipo de Documento</label>
                <select
                  value={formData.document_type}
                  onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                  style={{ width: '100%', padding: 8, marginBottom: 12 }}
                >
                  <option value="certificado">Certificado</option>
                  <option value="constancia">Constancia</option>
                  <option value="reporte">Reporte</option>
                  <option value="otro">Otro</option>
                </select>

                <label>Estudiante (Opcional)</label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value ? Number(e.target.value) : '' })}
                  style={{ width: '100%', padding: 8, marginBottom: 12 }}
                >
                  <option value="">-- Para todos --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <label>URL del Documento (link descargable)</label>
                <input
                  type="url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  style={{ width: '100%', padding: 8, marginBottom: 12 }}
                  placeholder="https://example.com/documento.pdf"
                />

                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  />
                  Disponible públicamente
                </label>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
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
        {documents.length === 0 ? (
          <div className="card">
            <p style={{ opacity: 0.7 }}>No hay documentos disponibles</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>{doc.title}</h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>
                    <strong>Tipo:</strong> {documentTypeLabel[doc.document_type] || doc.document_type}
                    {doc.student_name && ` • ${doc.student_name}`}
                  </p>
                  <small style={{ opacity: 0.6 }}>
                    {new Date(doc.created_at).toLocaleDateString('es-CO')} • Por {doc.created_by_name || 'Sistema'}
                  </small>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noreferrer">
                      <button
                        style={{
                          background: '#86efac',
                          border: 'none',
                          padding: 8,
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Download size={16} /> Descargar
                      </button>
                    </a>
                  )}
                  {user && (user.role === 'admin' || user.role === 'teacher') && (
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
