/**
 * Motion tokens. We use multiples of 80ms so durations stay visually consistent.
 */
export const duration = {
  instant: 0,
  fast: 120,
  base: 200,
  slow: 320,
} as const;

export const easing = {
  /** Standard ease for most UI motion. */
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  /** Pronounced ease-out for entrance/exit. */
  decelerate: "cubic-bezier(0, 0, 0.2, 1)",
} as const;
