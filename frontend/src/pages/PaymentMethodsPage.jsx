import { useLocation, useNavigate } from "react-router-dom";
import PaymentCard from "../components/PaymentCard";
import { processPayment } from "../services/payments";

export default function PaymentMethodsPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const amount = state?.amount || 0;
  const metadata = state?.metadata || {};

  const handleSelect = async (method) => {
    if (!amount || amount <= 0) {
      return alert("El monto no es válido. Vuelve al checkout.");
    }

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
        />

        <PaymentCard 
          title="PSE"
          description="Pago seguro en línea"
          onClick={() => handleSelect("pse")}
        />

        <PaymentCard 
          title="Nequi"
          description="Pago rápido desde tu celular"
          onClick={() => handleSelect("nequi")}
        />

        <PaymentCard 
          title="DaviPlata"
          description="Pagos desde monedero digital"
          onClick={() => handleSelect("daviplata")}
        />

        <PaymentCard 
          title="Pago en Secretaría del Colegio"
          description="Realice el pago de forma presencial"
          onClick={() => handleSelect("oficina")}
        />
      </div>
    </div>
  );
}
