export default function PaymentCard({ title, description, onClick, disabled }) {
  return (
    <div 
      className={`payment-card ${disabled ? 'disabled' : ''}`} 
      onClick={!disabled ? onClick : undefined}
      style={{ 
        opacity: disabled ? 0.6 : 1, 
        cursor: disabled ? 'not-allowed' : 'pointer',
        pointerEvents: disabled ? 'none' : 'auto'
      }}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
