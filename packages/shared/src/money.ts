const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCents(cents: number): string {
  return formatter.format(cents / 100);
}

export function formatCentsCompact(cents: number): string {
  if (Math.abs(cents) >= 100_000) {
    const dollars = cents / 100;
    if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
    if (dollars >= 10_000) return `$${(dollars / 1_000).toFixed(1)}k`;
  }
  return formatCents(cents);
}
