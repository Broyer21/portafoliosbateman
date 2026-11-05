export function calculateSubtotal(items) {
  return items.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0);
}

export function formatMoney(cents, currency = 'eur') {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
