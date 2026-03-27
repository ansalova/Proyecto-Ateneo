import { useSearchParams, useNavigate } from "react-router-dom"
import { CheckCircle, Clock, XCircle, Home, MessageSquare, Mail, AlertTriangle, Copy, Check, Info } from 'lucide-react'
import { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext';
import { showToast } from '../utils/helpers'

export default function ConfirmacionPago() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const metodo = params.get("method");
  const result = (params.get("result") || '').toLowerCase();
  const amount = params.get("amount");

  // Para métodos offline se puede recibir referencia
  const reference = params.get('reference');
  const title = params.get('title');
  const account = params.get('account');
  const message = params.get('message');
  const emailSentParam = params.get('emailSent');
  const emailErrorParam = params.get('emailError');
  const emailSent = emailSentParam === 'true';
  const emailError = emailErrorParam || null;

  const [copiedField, setCopiedField] = useState(null)

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    showToast(`${field} copiado`, { type: 'success' })
    setTimeout(() => setCopiedField(null), 2000)
  }

  const { user } = useContext(AuthContext);

  const mensajes = {
    nequi: "Envía el valor de la mensualidad al número oficial del colegio.",
    daviplata: "Realiza el pago desde tu app Daviplata al número autorizado.",
  };

  const statusConfig = {
    success: { icon: CheckCircle, color: '#16a34a', label: '¡Pago Exitoso!', bgColor: '#dcfce7' },
    approved: { icon: CheckCircle, color: '#16a34a', label: '¡Pago Exitoso!', bgColor: '#dcfce7' },
    pending: { icon: Clock, color: '#ca8a04', label: 'Proceso de Pago Iniciado', bgColor: '#fffbeb' },
    failure: { icon: XCircle, color: '#dc2626', label: 'Pago rechazado', bgColor: '#fee2e2' },
    failed: { icon: XCircle, color: '#dc2626', label: 'Pago rechazado', bgColor: '#fee2e2' }
  };

  const currentStatus = statusConfig[result] || statusConfig.pending;
  const Icon = currentStatus.icon;

  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 16,
      background: '#f8fafc'
    }}>
      <div style={{ maxWidth: 550, width: '100%' }}>
        {/* Status Card */}
        <div 
          className="card"
          style={{ 
            textAlign: 'center',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '40px 30px',
            marginBottom: 30,
            borderRadius: '24px'
          }}
        >
          <div style={{ marginBottom: 20, display: 'inline-flex', padding: '20px', borderRadius: '50%', background: currentStatus.bgColor }}>
            <Icon size={60} style={{ color: currentStatus.color }} />
          </div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#1e293b' }}>
            {currentStatus.label}
          </h2>
          <p style={{ color: '#64748b', fontSize: '16px', marginBottom: 30 }}>
            {result === 'success' || result === 'approved' 
              ? 'Hemos procesado tu pago correctamente. Ya puedes acceder a todos tus servicios.' 
              : 'Sigue las instrucciones a continuación para completar tu proceso de pago manual.'}
          </p>

          {reference && (
            <div style={{ textAlign: 'left', marginTop: 10, background: '#f8fafc', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Info size={20} style={{ color: '#0b63f6' }} /> {title || 'Guía de Pago Manual'}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: 16 }}>
                {account && (
                  <div style={{ background: '#ffffff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <small style={{ color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>Número de Cuenta / Teléfono:</small>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.1rem' }}>{account}</span>
                      <button 
                        onClick={() => copyToClipboard(account, 'Número')}
                        style={{ background: 'none', border: 'none', color: '#0b63f6', cursor: 'pointer' }}
                      >
                        {copiedField === 'Número' ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ background: '#ffffff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <small style={{ color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>Referencia Obligatoria:</small>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold', wordBreak: 'break-all' }}>{reference}</span>
                    <button 
                      onClick={() => copyToClipboard(reference, 'Referencia')}
                      style={{ background: 'none', border: 'none', color: '#0b63f6', cursor: 'pointer' }}
                    >
                      {copiedField === 'Referencia' ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                {amount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #e2e8f0', marginTop: '10px' }}>
                    <span style={{ color: '#64748b', fontWeight: '500' }}>Total a transferir:</span>
                    <span style={{ fontWeight: 'bold', color: '#1f7a4a', fontSize: '18px' }}>${parseFloat(amount).toLocaleString('es-CO')}</span>
                  </div>
                )}
              </div>

              {message && <p style={{ margin: '16px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', lineHeight: 1.4 }}>{message}</p>}
              
              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '15px', borderRadius: '12px', marginTop: 16 }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e', fontWeight: '600', display: 'flex', gap: '8px' }}>
                  <AlertTriangle size={18} /> Acción Requerida: Debes realizar la transferencia desde tu app bancaria para que podamos validar tu pago.
                </p>
              </div>

              {user?.email && (
                <div style={{ marginTop: 20, padding: '12px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={20} style={{ color: '#0b63f6' }} />
                  {emailSent ? (
                    <span style={{ fontSize: '13px', color: '#1e40af' }}>Hemos enviado esta <strong>guía de pago</strong> a <strong>{user.email}</strong> para que la tengas a mano.</span>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#b91c1c' }}>No pudimos enviar el correo a {user.email}. Por favor toma una captura de esta pantalla.</span>
                  )}
                </div>
              )}
            </div>
          )}
          
          {!reference && (
            <p style={{ margin: '12px 0 0 0', opacity: 0.8 }}>
              {mensajes[metodo] || "Estado del pago no disponible."}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          <button
            className="button"
            onClick={() => nav('/')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 8,
              background: '#2563eb',
              color: '#fff'
            }}
          >
            <Home size={18} /> Volver al inicio
          </button>
          
          <button
            className="button"
            onClick={() => nav('/anuncios')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 8,
              background: '#7c3aed',
              color: '#fff'
            }}
          >
            <MessageSquare size={18} /> Ver anuncios
          </button>
        </div>

        {/* Help Section */}
        {(result === 'pending' || result === 'failure' || result === 'failed') && (
          <div className="card" style={{ marginTop: 24, background: '#f0f9ff', borderLeft: '4px solid #0284c7' }}>
            <p style={{ margin: '0 0 12px 0', fontWeight: 600 }}>¿Necesitas ayuda?</p>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>
              <li>Revisa tu email para detalles del pago</li>
              <li>Contacta a la Secretaría del colegio si tienes dudas</li>
              <li>Reintentar el pago si fue temporal el error</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
