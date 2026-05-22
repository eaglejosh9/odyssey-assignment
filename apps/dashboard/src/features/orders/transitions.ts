import type { OrderStatus, OrderStatusAction } from "@odyssey/api-client/generated";

/**
 * Frontend mirror of the backend state machine in services/backend/src/services/order-status.ts.
 *
 * This isn't a duplicated *enum* (those flow from the generated contract);
 * it's just a UI helper that decides which action buttons to surface for a
 * given status. The backend is authoritative — if we let the user fire an
 * invalid transition the API will reject it with INVALID_STATUS_TRANSITION.
 */

const TRANSITIONS: Record<OrderStatus, ReadonlyArray<OrderStatusAction>> = {
  pending: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

export function nextActions(from: OrderStatus): ReadonlyArray<OrderStatusAction> {
  return TRANSITIONS[from];
}

const LABELS: Record<OrderStatusAction, string> = {
  accepted: "Accept",
  preparing: "Start prep",
  ready: "Mark ready",
  completed: "Complete",
  cancelled: "Cancel",
};

export function actionLabel(action: OrderStatusAction): string {
  return LABELS[action];
}

export function actionTone(action: OrderStatusAction): "primary" | "secondary" | "danger" {
  if (action === "cancelled") return "danger";
  if (action === "completed" || action === "ready") return "primary";
  return "primary";
}
