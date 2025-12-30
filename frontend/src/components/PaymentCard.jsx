export default function PaymentCard({ title, description, onClick }) {
  return (
    <div className="payment-card" onClick={onClick}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
