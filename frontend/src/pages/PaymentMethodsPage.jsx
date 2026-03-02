import { useLocation, useNavigate } from "react-router-dom";
import PaymentCard from "../components/PaymentCard";
import { processPayment } from "../services/payments";
import { showToast } from "../utils/helpers";
import { useState } from "react";
import { CreditCard, Landmark, Smartphone, Briefcase, School } from "lucide-react";
import API from "../services/api";

export default function PaymentMethodsPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const amount = state?.amount || 0;
  const metadata = state?.metadata || {};
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingMethod, setLoadingMethod] = useState(null);

  const handleSelect = async (method) => {
    if (!amount || amount <= 0) {
      setErrorMsg("El monto no es válido. Vuelve al checkout.");
      return;
    }

    setLoadingMethod(method);
    setErrorMsg("");
    
    try {
      const res = await processPayment({ amount, metadata, method });

      // Intentar enviar email de iniciación de pago después de que se creó la orden
      if (res.success && res.externalReference) {
        try {
          const emailResponse = await API.post('/api/payments/send-init-email', {
            studentName: metadata.studentName || 'Estudiante',
            amount,
            method,
            reference: res.externalReference
          });
          
          if (emailResponse.data?.success) {
            console.log('✉️ Email de pago iniciado enviado:', emailResponse.data.messageId);
          } else if (emailResponse.data?.emailError) {
            console.warn('⚠️ Error enviando email de pago:', emailResponse.data.emailError);
          }
        } catch (emailErr) {
          console.warn('⚠️ No se pudo enviar email de iniciación:', emailErr.message);
          // No bloquear el flujo de pago por un error de email
        }
      }

      if (res.offline) {
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

      if (res.redirected) {
        // El navegador será redirigido al checkout de la pasarela
        return;
      }

      if (res.success) {
        // Fallback o método simulado
        setErrorMsg("Procesando... Por favor espera.");
        return;
      }

      setErrorMsg(res.message || "No fue posible iniciar el pago. Intenta nuevamente.");
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMsg("Error al procesar el pago. Verifica tu conexión e intenta de nuevo.");
    } finally {
      setLoadingMethod(null);
    }
  };

  if (!amount || amount <= 0) {
    return (
      <div className="payment-container">
        <h1>Error</h1>
        <p>El monto no es válido. <a href="/carrito">Vuelve al carrito.</a></p>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <h1>Pago de mensualidad</h1>
      <p>Seleccione uno de los métodos de pago disponibles.</p>

      <div className="monto">
        <strong>Valor a pagar: </strong> ${amount.toLocaleString('es-CO')}
      </div>

      {errorMsg && (
        <div className="card" style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#b91c1c', margin: '12px 0', padding: '12px' }}>
          {errorMsg}
        </div>
      )}

      <div className="payment-grid">
        <PaymentCard 
          title="Tarjeta de Crédito / Débito"
          description="Visa, MasterCard, American Express"
          icon={<CreditCard size={24} />}
          onClick={() => handleSelect("tarjeta")}
          disabled={loadingMethod !== null}
          loading={loadingMethod === "tarjeta"}
        />

        <PaymentCard 
          title="PSE"
          description="Pago seguro en línea"
          icon={<Landmark size={24} />}
          onClick={() => handleSelect("pse")}
          disabled={loadingMethod !== null}
          loading={loadingMethod === "pse"}
        />

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

        <PaymentCard 
          title="Pago en Secretaría del Colegio"
          description="Realice el pago de forma presencial"
          icon={<School size={24} />}
          onClick={() => handleSelect("oficina")}
          disabled={loadingMethod !== null}
          loading={loadingMethod === "oficina"}
        />
      </div>
    </div>
  );
}
