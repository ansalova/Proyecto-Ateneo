export default function PaymentCard({ title, description, icon, onClick, disabled = false, loading = false }) {
  return (
    <div 
      className="payment-card" 
      onClick={() => !disabled && onClick && onClick()}
      style={{
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {loading && <p style={{ fontSize: '0.9rem', marginTop: '8px', color: '#666' }}>Procesando...</p>}
    </div>
  );
}
