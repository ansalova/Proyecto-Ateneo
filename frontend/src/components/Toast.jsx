import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'

export default function Toast({ message, type = 'info', duration = 4000, onClose }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)
    
    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const styles = {
    error: {
      background: '#fee2e2',
      border: '1px solid #fecaca',
      color: '#991b1b',
      icon: <AlertCircle size={20} style={{ color: '#dc2626' }} />
    },
    success: {
      background: '#dcfce7',
      border: '1px solid #bbf7d0',
      color: '#166534',
      icon: <CheckCircle size={20} style={{ color: '#16a34a' }} />
    },
    warning: {
      background: '#fef3c7',
      border: '1px solid #fde68a',
      color: '#92400e',
      icon: <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
    },
    info: {
      background: '#dbeafe',
      border: '1px solid #bfdbfe',
      color: '#0c4a6e',
      icon: <Info size={20} style={{ color: '#0284c7' }} />
    }
  }

  const style = styles[type] || styles.info

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        background: style.background,
        border: style.border,
        borderRadius: 8,
        padding: '14px 16px',
        maxWidth: 400,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      
      {style.icon}
      
      <div style={{ flex: 1, fontSize: '0.95rem' }}>
        {message}
      </div>
      
      <button
        onClick={() => setIsVisible(false)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          opacity: 0.6,
          color: 'inherit'
        }}
      >
        <X size={18} />
      </button>
    </div>
  )
}
