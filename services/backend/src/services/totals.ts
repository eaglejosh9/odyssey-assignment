export type LineForTotals = {
  priceCents: number;
  quantity: number;
};

export type OrderTotals = {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
};

/**
 * Compute order totals server-side from line snapshots. Client-supplied totals
 * are never trusted.
 */
export function computeTotals(lines: ReadonlyArray<LineForTotals>, taxRateBps: number): OrderTotals {
  const subtotalCents = lines.reduce((acc, l) => acc + l.priceCents * l.quantity, 0);
  // bps = basis points, 1bps = 0.01%. Round half-up.
  const taxCents = Math.round((subtotalCents * taxRateBps) / 10_000);
  const totalCents = subtotalCents + taxCents;
  return { subtotalCents, taxCents, totalCents };
}
