import { useSearchParams, Link } from "react-router-dom";

export default function ConfirmacionPago() {
  const [params] = useSearchParams();
  const metodo = params.get("method");
  const provider = params.get("provider");
  const result = params.get("result");

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

  const showMpResult = provider === 'mercadopago' && !!result;

  return (
    <div className="confirmacion-container">
      <h1>Confirmación de Pago</h1>

      {showMpResult ? (
        <>
          <p>Resultado del pago: <strong>{result}</strong></p>
          <p>Si tu pago fue aprobado, recibirás un correo de confirmación.</p>
        </>
      ) : reference ? (
        <>
          <h2>{title}</h2>
          <p><strong>Referencia:</strong> {reference}</p>
          {account && (<p><strong>Número:</strong> {account}</p>)}
          {message && (<p>{message}</p>)}
        </>
      ) : (
        <p>{mensajes[metodo] || "Método no encontrado"}</p>
      )}

      <Link to="/" className="btn-volver">Volver al inicio</Link>
    </div>
  );
}
