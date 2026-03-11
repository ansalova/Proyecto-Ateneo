import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import API, { BACKEND_URL } from '../services/api'
import { Download, Trash2, Plus } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'

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
    file: null,
    is_public: true,  // Por defecto: disponible para todos
  })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteId, setToDeleteId] = useState(null)
  const [toast, setToast] = useState(null)

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
      let errorMsg = 'Error al cargar documentos'
      
      if (err.response?.status === 401) {
        errorMsg = '⚠️ Tu sesión expiró. Por favor inicia sesión de nuevo.'
      } else if (err.response?.status === 403) {
        errorMsg = '🔒 No tienes permiso para ver estos documentos.'
      } else if (err.response?.status === 500) {
        errorMsg = '⚠️ Error del servidor. Por favor intenta más tarde.'
      }
      
      setError(errorMsg)
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

  const base64ToBlob = (dataURL) => {
    if (!dataURL) return null
    const parts = dataURL.split(',')
    const meta = parts[0] // e.g. data:application/pdf;base64
    const b64 = parts[1]
    const mimeMatch = meta.match(/data:([^;]+);/)
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
    const byteChars = atob(b64)
    const byteNumbers = new Array(byteChars.length)
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mime })
  }

  const handleDownload = (doc) => {
    // Si es URL externa http/https
    if (doc.file_url && doc.file_url.startsWith('http')) {
      window.open(doc.file_url, '_blank')
      return
    }
    
    // Si es ruta local (/uploads/...), convertir a URL completa
    if (doc.file_url && doc.file_url.startsWith('/uploads')) {
      const fullUrl = `${BACKEND_URL}${doc.file_url}`
      window.open(fullUrl, '_blank')
      return
    }
    
    // Si tiene file_content (base64 legacy)
    if (doc.file_content) {
      try {
        const blob = base64ToBlob(doc.file_content)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const filename = doc.file_url || doc.file_name || `${doc.title}.bin`
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error('Error descargando archivo:', err)
      }
      return
    }
    
    // Fallback: open file_url si existe
    if (doc.file_url) {
      window.open(doc.file_url, '_blank')
    }
  }

  const handleCreateDocument = async (e) => {
    e.preventDefault()
    
    // Validaciones
    if (!formData.title.trim()) {
      setToast({ type: 'warning', message: '📝 El título del documento es obligatorio' })
      return
    }
    
    const hasURL = formData.file_url && formData.file_url.trim()
    const hasFile = formData.file !== null
    
    if (!hasURL && !hasFile) {
      setToast({ type: 'warning', message: '📎 Debes subir un archivo o proporcionar una URL' })
      return
    }

    // Validar que sea una URL válida si la proporcionó
    if (hasURL && !hasFile) {
      try {
        new URL(formData.file_url)
      } catch {
        setToast({ type: 'warning', message: '🔗 Ingresa una URL válida (ej: https://ejemplo.com/archivo.pdf)' })
        return
      }
    }

    try {
      // Usar FormData para enviar archivo
      const data = new FormData()
      data.append('title', formData.title)
      data.append('document_type', formData.document_type)
      if (formData.student_id) data.append('student_id', formData.student_id)
      if (formData.file_url) data.append('file_url', formData.file_url)
      if (formData.file) data.append('file', formData.file)
      data.append('is_public', String(formData.is_public)) // Convertir booleano a string explícitamente

      await API.post('/api/documents', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setFormData({
        title: '',
        document_type: 'certificado',
        student_id: '',
        file_url: '',
        file: null,
        is_public: true,  // Reiniciar con públicos por defecto
      })
      setShowForm(false)
      setError('')
      setToast({ type: 'success', message: '✅ Documento publicado exitosamente' })
      fetchDocuments()
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Error al crear documento'
      console.error('Error creating document:', err)
      
      // Mensajes más amigables según el tipo de error
      let friendlyMsg = errorMsg
      if (errorMsg.includes('tamaño')) {
        friendlyMsg = '📦 El archivo es demasiado grande. Máximo 5 MB.'
      } else if (errorMsg.includes('tipo')) {
        friendlyMsg = '🚫 Este tipo de archivo no está permitido.'
      } else if (errorMsg.includes('permiso')) {
        friendlyMsg = '🔒 No tienes permiso para subir documentos.'
      }
      
      setToast({ type: 'error', message: friendlyMsg })
      setError(friendlyMsg)
    }
  }

  const handleDeleteDocument = async (id) => {
    setToDeleteId(id)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!toDeleteId) return
    try {
      await API.delete(`/api/documents/${toDeleteId}`)
      setConfirmOpen(false)
      setToDeleteId(null)
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
                  onChange={(e) => {
                    const newStudentId = e.target.value ? Number(e.target.value) : '';
                    setFormData({ 
                      ...formData, 
                      student_id: newStudentId,
                      is_public: !newStudentId // Si es "Para todos", marcar como público
                    });
                  }}
                  style={{ width: '100%', padding: 8, marginBottom: 12 }}
                >
                  <option value="">-- Para todos --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <label>URL del Documento (opcional)</label>
                <input
                  type="text"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  style={{ width: '100%', padding: 8, marginBottom: 12 }}
                  placeholder="https://example.com/documento.pdf"
                />

                <label>O sube un archivo desde tu dispositivo</label>
                <small style={{ display: 'block', marginBottom: 8, color: '#1f7a4a', fontWeight: 600 }}>
                  Máximo: 5 MB
                </small>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) {
                      const fileSizeMB = f.size / 1024 / 1024
                      
                      if (fileSizeMB > 5) {
                        setToast({ 
                          type: 'error', 
                          message: `📦 El archivo es muy grande (${fileSizeMB.toFixed(2)}MB). Máximo permitido: 5 MB.` 
                        })
                        return
                      }

                      const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'txt']
                      const fileExt = f.name.split('.').pop().toLowerCase()
                      
                      if (!allowedTypes.includes(fileExt)) {
                        setToast({ 
                          type: 'error', 
                          message: `🚫 Tipo de archivo no permitido (.${fileExt}). Permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT.` 
                        })
                        return
                      }

                      setToast(null)
                      setFormData({ ...formData, file: f })
                    }
                  }}
                  style={{ width: '100%', padding: 8, marginBottom: 12 }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                />
                {formData.file && (
                  <div style={{ marginBottom: 12, padding: 8, background: '#ecfdf5', borderRadius: 6, color: '#065f46', fontSize: 14 }}>
                    <div><strong>Archivo:</strong> {formData.file.name}</div>
                    <div><strong>Tamaño:</strong> {(formData.file.size / 1024 / 1024).toFixed(2)} MB de 5 MB máximo</div>
                  </div>
                )}

                <label>Disponible para estudiantes</label>
                <div style={{ marginBottom: 12, padding: 12, background: '#f0f9ff', border: '1px solid #0284c7', borderRadius: 6 }}>
                  {formData.student_id ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={formData.is_public}
                        onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                      />
                      Disponible para todos los estudiantes
                      <small style={{ opacity: 0.7, marginLeft: 'auto' }}>Opcional</small>
                    </label>
                  ) : (
                    <div style={{ color: '#065f46', fontWeight: 500 }}>
                      ✅ Disponible para TODOS los estudiantes
                      <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: 4 }}>Automático cuando es "Para todos"</div>
                    </div>
                  )}
                </div>

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
          <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
            <p style={{ opacity: 0.7, fontSize: '1rem', marginBottom: 8 }}>
              {user?.role === 'admin' || user?.role === 'teacher' 
                ? 'No hay documentos aún. ¡Crea uno para compartir con tus estudiantes!'
                : 'No hay documentos disponibles en este momento. Pronto tu profesor compartirá documentos aquí.'}
            </p>
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
                  {(doc.file_url || doc.file_content) && (
                    <button
                      onClick={() => handleDownload(doc)}
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

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Eliminar documento"
        message="¿Estás seguro de que deseas eliminar este documento?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
