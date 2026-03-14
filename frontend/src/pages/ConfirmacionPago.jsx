import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Clock, XCircle, Home, MessageSquare } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

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

  const { user } = useContext(AuthContext);

  const mensajes = {
    nequi: "Envía el valor de la mensualidad al número oficial del colegio.",
    daviplata: "Realiza el pago desde tu app Daviplata al número autorizado.",
  };

  const statusConfig = {
    success: { icon: CheckCircle, color: '#16a34a', label: 'Pago aprobado', bgColor: '#dcfce7' },
    approved: { icon: CheckCircle, color: '#16a34a', label: 'Pago aprobado', bgColor: '#dcfce7' },
    pending: { icon: Clock, color: '#ca8a04', label: 'Pago pendiente', bgColor: '#fef3c7' },
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
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{ maxWidth: 500, width: '100%' }}>
        {/* Status Card */}
        <div 
          className="card"
          style={{ 
            textAlign: 'center',
            background: currentStatus.bgColor,
            border: `2px solid ${currentStatus.color}`,
            marginBottom: 24
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <Icon size={48} style={{ color: currentStatus.color, margin: '0 auto' }} />
          </div>
          <h2 style={{ margin: '0 0 8px 0', color: currentStatus.color }}>
            {currentStatus.label}
          </h2>

          {reference ? (
            <div style={{ textAlign: 'left', marginTop: 16, background: 'rgba(255,255,255,0.7)', padding: 12, borderRadius: 6 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>{title || 'Instrucciones de Pago'}</h3>
              {reference && (
                <div style={{ marginBottom: 12 }}>
                  <small style={{ opacity: 0.7 }}>Referencia:</small>
                  <p style={{ margin: '4px 0 0 0', fontFamily: 'monospace', fontWeight: 'bold', wordBreak: 'break-all' }}>
                    {reference}
                  </p>
                </div>
              )}
              {amount && (
                <div style={{ marginBottom: 12 }}>
                  <small style={{ opacity: 0.7 }}>Monto:</small>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 'bold' }}>${parseFloat(amount).toFixed(2)}</p>
                </div>
              )}
              {account && (
                <div style={{ marginBottom: 12 }}>
                  <small style={{ opacity: 0.7 }}>Número:</small>
                  <p style={{ margin: '4px 0 0 0', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {account}
                  </p>
                </div>
              )}
              {message && <p style={{ margin: '12px 0 0 0', fontSize: 14 }}>{message}</p>}
              {user?.email && (
                <p style={{ marginTop: 12, fontSize: 13, opacity: 0.8 }}>
                  {emailSent ? (
                    <>📧 Se envió un correo a <strong>{user.email}</strong></>
                  ) : (
                    <>⚠️ No se pudo enviar el correo a <strong>{user.email}</strong>{emailError ? `: ${emailError}` : ''}</>
                  )}
                </p>
              )}
            </div>
          ) : (
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
