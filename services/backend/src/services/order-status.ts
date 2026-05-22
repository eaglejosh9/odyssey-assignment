import type { OrderStatus } from "../db/zod";

/**
 * Allowed transitions for the order state machine.
 *
 *   pending → accepted | cancelled
 *   accepted → preparing | cancelled
 *   preparing → ready | cancelled
 *   ready → completed
 *   completed → (terminal)
 *   cancelled → (terminal)
 */
const TRANSITIONS: Record<OrderStatus, ReadonlyArray<OrderStatus>> = {
  pending: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function allowedNextStatuses(from: OrderStatus): ReadonlyArray<OrderStatus> {
  return TRANSITIONS[from];
}

export class InvalidStatusTransitionError extends Error {
  public readonly code = "INVALID_STATUS_TRANSITION" as const;
  constructor(
    public readonly from: OrderStatus,
    public readonly to: OrderStatus
  ) {
    super(`Cannot transition order from "${from}" to "${to}".`);
  }
}
