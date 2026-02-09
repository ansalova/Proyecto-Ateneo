import { useSearchParams, Link } from "react-router-dom";

export default function ConfirmacionPago() {
  const [params] = useSearchParams();
  const metodo = params.get("method");
  const provider = (params.get("provider") || '').toLowerCase();
  const result = (params.get("result") || '').toLowerCase();

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

  // Aceptar tanto 'mp' (usado en back_urls) como 'mercadopago'
  const isMercadoPago = provider === 'mp' || provider === 'mercadopago';

  const resultLabel = (() => {
    if (!result) return null;
    if (result === 'success' || result === 'approved') return 'Aprobado';
    if (result === 'pending') return 'Pendiente';
    if (result === 'failure' || result === 'failed') return 'Fallido';
    return result;
  })();

  return (
    <div className="confirmacion-container">
      <h1>Confirmación de Pago</h1>

      {isMercadoPago && result ? (
        <>
          <p>Resultado del pago: <strong>{resultLabel}</strong></p>
          {result === 'success' || result === 'approved' ? (
            <p>Tu pago fue aprobado. Recibirás un correo de confirmación con los detalles.</p>
          ) : result === 'pending' ? (
            <p>Tu pago está pendiente. En cuanto se confirme, te notificaremos por correo.</p>
          ) : (
            <p>Hubo un problema con el pago. Intenta nuevamente o contacta a la Secretaría.</p>
          )}
        </>
      ) : reference ? (
        <>
          <h2>{title || 'Instrucciones de pago'}</h2>
          <p><strong>Referencia:</strong> {reference}</p>
          {account && (<p><strong>Número:</strong> {account}</p>)}
          {message && (<p>{message}</p>)}
        </>
      ) : (
        <p>{mensajes[metodo] || "Estado del pago no disponible."}</p>
      )}

      <Link to="/" className="btn-volver">Volver al inicio</Link>
    </div>
  );
}
