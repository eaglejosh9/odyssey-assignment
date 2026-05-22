import { describe, expect, it } from "vitest";
import { computeTotals } from "../src/services/totals";

describe("computeTotals", () => {
  it("computes subtotal/tax/total for a single line", () => {
    expect(computeTotals([{ priceCents: 1000, quantity: 2 }], 875)).toEqual({
      subtotalCents: 2000,
      taxCents: 175,
      totalCents: 2175,
    });
  });

  it("handles zero tax rate", () => {
    expect(computeTotals([{ priceCents: 1234, quantity: 3 }], 0)).toEqual({
      subtotalCents: 3702,
      taxCents: 0,
      totalCents: 3702,
    });
  });

  it("rounds tax half-up", () => {
    // 1000 cents * 1.55% = 15.5 → rounds to 16
    expect(computeTotals([{ priceCents: 1000, quantity: 1 }], 155).taxCents).toBe(16);
  });

  it("sums multiple lines", () => {
    const t = computeTotals(
      [
        { priceCents: 500, quantity: 1 },
        { priceCents: 1500, quantity: 2 },
        { priceCents: 200, quantity: 3 },
      ],
      875
    );
    expect(t.subtotalCents).toBe(500 + 3000 + 600);
    expect(t.taxCents).toBe(Math.round((4100 * 875) / 10_000));
    expect(t.totalCents).toBe(t.subtotalCents + t.taxCents);
  });

  it("handles empty line list (degenerate)", () => {
    expect(computeTotals([], 875)).toEqual({ subtotalCents: 0, taxCents: 0, totalCents: 0 });
  });
});
