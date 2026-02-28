import React from 'react'

export default function ConfirmModal({ open, title = 'Confirmar', message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onCancel} />
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: 400, boxShadow: '0 6px 18px rgba(0,0,0,0.12)', zIndex: 10000 }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p style={{ margin: '12px 0' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button onClick={onCancel} style={{ padding: '8px 12px', background: '#eee', border: 'none', borderRadius: 6 }}>Cancelar</button>
          <button onClick={onConfirm} style={{ padding: '8px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6 }}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}
