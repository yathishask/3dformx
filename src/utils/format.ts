export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount).replace('INR', '₹').trim();
}

export function calculateDiscount(current: number, original?: number): number {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}
