export default function PaymentCard({ title, description, icon, onClick }) {
  return (
    <div className="payment-card" onClick={onClick}>
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
