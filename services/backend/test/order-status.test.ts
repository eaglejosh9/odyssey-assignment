import { describe, expect, it } from "vitest";
import { allowedNextStatuses, canTransition } from "../src/services/order-status";

describe("order state machine", () => {
  it("allows the happy path", () => {
    expect(canTransition("pending", "accepted")).toBe(true);
    expect(canTransition("accepted", "preparing")).toBe(true);
    expect(canTransition("preparing", "ready")).toBe(true);
    expect(canTransition("ready", "completed")).toBe(true);
  });

  it("allows cancellation from non-terminal states", () => {
    expect(canTransition("pending", "cancelled")).toBe(true);
    expect(canTransition("accepted", "cancelled")).toBe(true);
    expect(canTransition("preparing", "cancelled")).toBe(true);
  });

  it("forbids cancellation once ready", () => {
    expect(canTransition("ready", "cancelled")).toBe(false);
  });

  it("treats completed and cancelled as terminal", () => {
    expect(allowedNextStatuses("completed")).toEqual([]);
    expect(allowedNextStatuses("cancelled")).toEqual([]);
  });

  it("rejects skipping states", () => {
    expect(canTransition("pending", "preparing")).toBe(false);
    expect(canTransition("pending", "ready")).toBe(false);
    expect(canTransition("accepted", "ready")).toBe(false);
  });

  it("rejects going backwards", () => {
    expect(canTransition("preparing", "accepted")).toBe(false);
    expect(canTransition("ready", "preparing")).toBe(false);
    expect(canTransition("completed", "pending")).toBe(false);
  });
});
