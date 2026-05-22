import { describe, expect, it } from "vitest";
import { formatCents, formatCentsCompact } from "./money";

describe("formatCents", () => {
  it("formats whole dollars", () => {
    expect(formatCents(1200)).toBe("$12.00");
  });
  it("formats with cents", () => {
    expect(formatCents(199)).toBe("$1.99");
  });
  it("formats zero", () => {
    expect(formatCents(0)).toBe("$0.00");
  });
  it("formats large numbers with grouping", () => {
    expect(formatCents(1234567)).toBe("$12,345.67");
  });
});

describe("formatCentsCompact", () => {
  it("uses dollars for small amounts", () => {
    expect(formatCentsCompact(9999)).toBe("$99.99");
  });
  it("uses k for amounts >= $10k", () => {
    expect(formatCentsCompact(1_500_000)).toBe("$15.0k");
  });
  it("uses M for amounts >= $1M", () => {
    expect(formatCentsCompact(150_000_000)).toBe("$1.5M");
  });
});
