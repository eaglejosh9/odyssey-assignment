import { describe, expect, it } from "vitest";
import { actionLabel, actionTone, nextActions } from "./transitions";

describe("order transitions (UI helper)", () => {
  it("exposes accept and cancel for pending", () => {
    expect(nextActions("pending")).toEqual(["accepted", "cancelled"]);
  });

  it("exposes start prep and cancel for accepted", () => {
    expect(nextActions("accepted")).toEqual(["preparing", "cancelled"]);
  });

  it("removes cancel once ready", () => {
    expect(nextActions("ready")).toEqual(["completed"]);
  });

  it("treats completed as terminal", () => {
    expect(nextActions("completed")).toEqual([]);
  });

  it("labels each action with human-readable text", () => {
    expect(actionLabel("accepted")).toBe("Accept");
    expect(actionLabel("preparing")).toBe("Start prep");
    expect(actionLabel("cancelled")).toBe("Cancel");
  });

  it("flags cancellation as danger tone", () => {
    expect(actionTone("cancelled")).toBe("danger");
    expect(actionTone("preparing")).toBe("primary");
  });
});
