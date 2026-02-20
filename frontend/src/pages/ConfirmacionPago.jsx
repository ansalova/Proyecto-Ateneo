import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle, Clock, XCircle, Home, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';

export default function ConfirmacionPago() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const metodo = params.get("method");
  const provider = (params.get("provider") || '').toLowerCase();
  const result = (params.get("result") || '').toLowerCase();
  const amount = params.get("amount");

  // Para métodos offline
  const reference = params.get('reference');
  const title = params.get('title');
  const account = params.get('account');
  const message = params.get('message');

  const mensajes = {
    tarjeta: "Hemos iniciado tu pago con tarjeta. Si no fuiste redirigido, vuelve a intentar.",
    pse: "Hemos iniciado tu pago por PSE. Si no fuiste redirigido, vuelve a intentar.",
    nequi: "Envía el valor de la mensualidad al número oficial del colegio.",
    daviplata: "Realiza el pago desde tu app Daviplata al número autorizado.",
    oficina: "Puedes dirigirte a la Secretaría del colegio para completar el pago.",
  };

  const isMercadoPago = provider === 'mp' || provider === 'mercadopago';

  const statusConfig = {
    success: { icon: CheckCircle, color: '#16a34a', label: 'Pago Aprobado', bgColor: '#dcfce7' },
    approved: { icon: CheckCircle, color: '#16a34a', label: 'Pago Aprobado', bgColor: '#dcfce7' },
    pending: { icon: Clock, color: '#ca8a04', label: 'Pago Pendiente', bgColor: '#fef3c7' },
    failure: { icon: XCircle, color: '#dc2626', label: 'Pago Rechazado', bgColor: '#fee2e2' },
    failed: { icon: XCircle, color: '#dc2626', label: 'Pago Rechazado', bgColor: '#fee2e2' }
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

          {isMercadoPago && result ? (
            <div>
              {(result === 'success' || result === 'approved') ? (
                <p style={{ margin: '12px 0 0 0', opacity: 0.8 }}>
                  ✓ Tu pago fue procesado correctamente. Recibirás un correo de confirmación pronto.
                </p>
              ) : result === 'pending' ? (
                <p style={{ margin: '12px 0 0 0', opacity: 0.8 }}>
                  ⏳ Tu pago está siendo procesado. Te notificaremos una vez se confirme.
                </p>
              ) : (
                <p style={{ margin: '12px 0 0 0', opacity: 0.8 }}>
                  ✗ El pago no se pudo procesar. Por favor, intenta nuevamente.
                </p>
              )}
              
              {amount && (
                <div style={{ 
                  marginTop: 16, 
                  padding: 12, 
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: 6
                }}>
                  <small style={{ opacity: 0.7 }}>Monto</small>
                  <p style={{ margin: '4px 0 0 0', fontSize: 20, fontWeight: 'bold' }}>
                    ${parseFloat(amount).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          ) : reference ? (
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
              {account && (
                <div style={{ marginBottom: 12 }}>
                  <small style={{ opacity: 0.7 }}>Número:</small>
                  <p style={{ margin: '4px 0 0 0', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {account}
                  </p>
                </div>
              )}
              {message && <p style={{ margin: '12px 0 0 0', fontSize: 14 }}>{message}</p>}
            </div>
          ) : (
            <p style={{ margin: '12px 0 0 0', opacity: 0.8 }}>
              {mensajes[metodo] || "Estado del pago no disponible."}
            </p>
          )}
        </div>

        {/* Info Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 12,
          marginBottom: 24 
        }}>
          <div className="card" style={{ textAlign: 'center', padding: 12 }}>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>📧 Correo Confirmación</p>
            <small style={{ margin: '8px 0 0 0', display: 'block', opacity: 0.6 }}>
              Revisá tu email
            </small>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: 12 }}>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>📋 Orden Registrada</p>
            <small style={{ margin: '8px 0 0 0', display: 'block', opacity: 0.6 }}>
              En tu perfil
            </small>
          </div>
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
            <Home size={18} /> Volver al Inicio
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
            <MessageSquare size={18} /> Ver Anuncios
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
