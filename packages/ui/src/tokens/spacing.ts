/**
 * 4pt-based spacing scale. Components consume named keys, never raw numbers,
 * so changing the scale propagates everywhere.
 *
 *   0  →  0
 *   px →  1   (hairline)
 *   xs →  4
 *   sm →  8
 *   md → 12
 *   base → 16
 *   lg → 20
 *   xl → 24
 *   2xl → 32
 *   3xl → 40
 *   4xl → 56
 *   5xl → 72
 */
export const spacing = {
  0: 0,
  px: 1,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 56,
  "5xl": 72,
} as const;

export type SpaceToken = keyof typeof spacing;

export const layout = {
  /** Max content width for landscape pages. */
  maxContentWidth: 1280,
  sidebarWidth: 248,
  /** Page horizontal gutter. */
  pageGutter: 32,
  /** Grid gap between cards / list items. */
  gridGap: 16,
  /** Sensible target for input/button height (single line). */
  controlHeight: 40,
  controlHeightSm: 32,
  controlHeightLg: 48,
};
