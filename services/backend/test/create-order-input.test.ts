import { describe, expect, it } from "vitest";
import { CreateOrderInput } from "../src/db/zod";

describe("CreateOrderInput validation", () => {
  it("accepts a well-formed payload", () => {
    const result = CreateOrderInput.safeParse({
      customerId: 1,
      items: [{ menuItemId: 4, quantity: 2 }],
      notes: "No cilantro",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty item list", () => {
    const result = CreateOrderInput.safeParse({ customerId: 1, items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive customerId", () => {
    const result = CreateOrderInput.safeParse({
      customerId: 0,
      items: [{ menuItemId: 1, quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive quantity", () => {
    const result = CreateOrderInput.safeParse({
      customerId: 1,
      items: [{ menuItemId: 1, quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects oversized quantity", () => {
    const result = CreateOrderInput.safeParse({
      customerId: 1,
      items: [{ menuItemId: 1, quantity: 100 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown menu item id types", () => {
    const result = CreateOrderInput.safeParse({
      customerId: 1,
      items: [{ menuItemId: "not-a-number", quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });
});
