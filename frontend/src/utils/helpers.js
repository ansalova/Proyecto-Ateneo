export const formatCurrency = n =>
  `${n.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`

// Simple toast utility for quick user feedback (no external deps)
export function showToast(message, { type = 'info', duration = 4000 } = {}) {
  if (typeof document === 'undefined') return;
  const el = document.createElement('div');
  el.textContent = message;
  el.style.position = 'fixed';
  el.style.right = '16px';
  el.style.top = '16px';
  el.style.zIndex = 9999;
  el.style.padding = '12px 16px';
  el.style.borderRadius = '8px';
  el.style.boxShadow = '0 6px 18px rgba(2,6,23,0.12)';
  el.style.color = '#fff';
  el.style.fontWeight = '600';
  el.style.minWidth = '200px';
  el.style.maxWidth = '360px';
  el.style.fontSize = '14px';
  el.style.opacity = '0';
  el.style.transition = 'opacity 200ms ease, transform 200ms ease';
  el.style.transform = 'translateY(-8px)';
  if (type === 'success') el.style.background = '#16a34a';
  else if (type === 'error') el.style.background = '#dc2626';
  else el.style.background = '#0369a1';
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
  setTimeout(() => {
    el.style.opacity = '0'; el.style.transform = 'translateY(-8px)';
    setTimeout(() => el.remove(), 250);
  }, duration);
}
