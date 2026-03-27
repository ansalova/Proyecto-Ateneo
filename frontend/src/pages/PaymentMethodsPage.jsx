import { useLocation, useNavigate } from "react-router-dom";
import PaymentCard from "../components/PaymentCard";
import { processPayment } from "../services/payments";
import { showToast } from "../utils/helpers";
import { useState } from "react";
import { CreditCard, Landmark, Smartphone, Briefcase, School } from "lucide-react";
import logger from "../utils/logger";

export default function PaymentMethodsPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const amount = state?.amount || 0;
  const metadata = state?.metadata || {};
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingMethod, setLoadingMethod] = useState(null);

  // Extraer meses del metadata para mostrar resumen profesional
  const paymentMonths = metadata.items 
    ? metadata.items
        .map(i => i.metadata?.month)
        .filter(Boolean)
    : [];

  const handleSelect = async (method) => {
    if (!amount || amount <= 0) {
      setErrorMsg("El monto no es válido. Vuelve al checkout.");
      return;
    }

    setLoadingMethod(method);
    setErrorMsg("");
    
    try {
      // Nota: El backend debería encargarse de enviar los correos de notificación
      // para garantizar que ocurran incluso si el cliente pierde conexión.
      const res = await processPayment({ amount, metadata, method });

      if (res && res.offline) {
        // Mostrar confirmación con instrucciones
        const params = new URLSearchParams({
          method,
          reference: res.reference,
          amount,
          title: res.instructions?.title || '',
          account: res.instructions?.account || '',
          message: res.instructions?.message || '',
          emailSent: res.emailSent ? 'true' : 'false',
          emailError: res.emailError || ''
        })
        // Mostrar toast inmediato con estado de envío de correo
        if (res.emailSent) showToast('Correo de confirmación enviado al pagador', { type: 'success' });
        else if (res.emailError) showToast('No se pudo enviar el correo: ' + res.emailError, { type: 'error' });
        else showToast('Se creó la orden. Revisa tu correo.', { type: 'info' });

        navigate(`/confirmacion-pago?${params.toString()}`)
        return;
      }

      if (res && res.redirected) {
        // El navegador será redirigido al checkout de la pasarela
        return;
      }

      if (res && res.success) {
        // Fallback o método simulado
        setErrorMsg("Procesando... Por favor espera.");
        return;
      }

      setErrorMsg(res?.message || "No fue posible iniciar el pago. Intenta nuevamente.");
    } catch (err) {
      logger.error("Payment error:", err);
      setErrorMsg(err.response?.data?.error || "Error al procesar el pago. Verifica tu conexión e intenta de nuevo.");
    } finally {
      setLoadingMethod(null);
    }
  };

  if (!amount || amount <= 0) {
    return (
      <div className="payment-container" style={{ textAlign: 'center', padding: '40px' }}>
        <h1>Error</h1>
        <p>El monto no es válido. <a href="/carrito">Vuelve al carrito.</a></p>
      </div>
    );
  }

  return (
    <div className="payment-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h1>Pago de mensualidad</h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>Seleccione el método de pago para completar su transacción.</p>

      {/* Card de Resumen Profesional */}
      <div className="card" style={{ background: '#f8fafc', marginBottom: '24px', border: '1px solid #e2e8f0', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Concepto:</p>
            <strong style={{ fontSize: '1rem', color: '#1e293b' }}>
              Mensualidad {paymentMonths.join(', ')}
            </strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Total:</p>
            <strong style={{ fontSize: '1.2rem', color: '#0b63f6' }}>
              ${amount.toLocaleString('es-CO')}
            </strong>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="card" style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#b91c1c', marginBottom: '20px', padding: '12px' }}>
          {errorMsg}
        </div>
      )}

      <div className="payment-grid" style={{ display: 'grid', gap: '16px' }}>
        <PaymentCard 
          title="Nequi"
          description="Pago rápido desde tu celular"
          icon={<Smartphone size={24} />}
          onClick={() => handleSelect("nequi")}
          disabled={loadingMethod !== null}
          loading={loadingMethod === "nequi"}
        />

        <PaymentCard 
          title="DaviPlata"
          description="Pagos desde monedero digital"
          icon={<Briefcase size={24} />}
          onClick={() => handleSelect("daviplata")}
          disabled={loadingMethod !== null}
          loading={loadingMethod === "daviplata"}
        />
      </div>
    </div>
  );
}
