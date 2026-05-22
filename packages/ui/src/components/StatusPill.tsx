import React from "react";
import { Badge, type BadgeTone } from "./Badge";

/**
 * Status pill specialized for the order status enum.
 * The enum itself is the generated `OrderStatus` from @odyssey/api-client; this
 * component only takes a string + tone mapping, which keeps the UI package free
 * of API-contract coupling.
 */
export type StatusPillProps = {
  status: string;
  tone?: BadgeTone;
  size?: "sm" | "md";
};

const DEFAULT_TONES: Record<string, BadgeTone> = {
  pending: "warning",
  accepted: "info",
  preparing: "accent",
  ready: "success",
  completed: "neutral",
  cancelled: "danger",
};

const LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusPill({ status, tone, size = "sm" }: StatusPillProps) {
  const effectiveTone = tone ?? DEFAULT_TONES[status] ?? "neutral";
  return (
    <Badge tone={effectiveTone} variant="soft" size={size} leftDot>
      {LABELS[status] ?? status}
    </Badge>
  );
}
