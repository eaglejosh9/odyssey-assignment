export const radius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radius;

export const borders = {
  width: 1,
  widthThick: 2,
} as const;
