import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PaymentCard from "../components/PaymentCard";
import { processPayment } from "../services/payments";

export default function PaymentMethodsPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const amount = state?.amount || 0;
  const metadata = state?.metadata || {};
  const [loading, setLoading] = useState(false);

  const handleSelect = async (method) => {
    if (loading) return;
    if (!amount || amount <= 0) {
      return alert("El monto no es válido. Vuelve al checkout.");
    }

    setLoading(true);
    try {
      const res = await processPayment({ amount, metadata, method });

      if (res.offline) {
        // Mostrar confirmación con instrucciones
        const params = new URLSearchParams({
          method,
          reference: res.reference,
          title: res.instructions?.title || '',
          account: res.instructions?.account || '',
          message: res.instructions?.message || ''
        })
        navigate(`/confirmacion-pago?${params.toString()}`)
        return;
      }

      if (res.redirected) {
        // El navegador será redirigido al checkout de la pasarela
        return;
      }

      alert(res.message || 'No fue posible iniciar el pago');
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al procesar el pago. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <h1>Pago de Mensualidad</h1>
      <p>Seleccione uno de los métodos de pago disponibles.</p>

      <div className="monto">
        <strong>Valor a pagar: </strong> ${amount.toLocaleString('es-CO')}
      </div>

      <div className="payment-grid">
        <PaymentCard 
          title="Tarjeta de Crédito / Débito"
          description="Visa, MasterCard, American Express"
          onClick={() => handleSelect("tarjeta")}
          disabled={loading}
        />

        <PaymentCard 
          title="PSE"
          description="Pago seguro en línea"
          onClick={() => handleSelect("pse")}
          disabled={loading}
        />

        <PaymentCard 
          title="Nequi"
          description="Pago rápido desde tu celular"
          onClick={() => handleSelect("nequi")}
          disabled={loading}
        />

        <PaymentCard 
          title="DaviPlata"
          description="Pagos desde monedero digital"
          onClick={() => handleSelect("daviplata")}
          disabled={loading}
        />

        <PaymentCard 
          title="Pago en Secretaría del Colegio"
          description="Realice el pago de forma presencial"
          onClick={() => handleSelect("oficina")}
          disabled={loading}
        />
      </div>
    </div>
  );
}
