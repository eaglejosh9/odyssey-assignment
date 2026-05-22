/**
 * Color tokens — primitives + semantic.
 *
 * Primitives are the raw scale. Semantic tokens reference primitives by name
 * and are what components consume. This indirection lets us swap themes (light,
 * dark, future brand variants) without rewriting components.
 */

const palette = {
  neutral: {
    0: "#FFFFFF",
    25: "#FCFCFD",
    50: "#F8F9FB",
    100: "#F1F3F7",
    200: "#E4E7EE",
    300: "#CDD3DE",
    400: "#9CA4B3",
    500: "#6B7385",
    600: "#4B5263",
    700: "#363C4C",
    800: "#22273A",
    900: "#151828",
    950: "#0B0D1A",
    1000: "#04050E",
  },
  indigo: {
    50: "#EEF0FF",
    100: "#DBDEFF",
    200: "#B8BEFF",
    300: "#9098FF",
    400: "#6F76FB",
    500: "#5258EE",
    600: "#3D40D6",
    700: "#2F32A6",
    800: "#23267F",
    900: "#191B5C",
  },
  green: {
    50: "#E7F8EE",
    100: "#C8EFD7",
    300: "#6FD797",
    500: "#1FB264",
    600: "#129953",
    700: "#0E7541",
  },
  amber: {
    50: "#FFF7E0",
    100: "#FFE9A8",
    300: "#FFC85C",
    500: "#F0A724",
    600: "#C7860B",
    700: "#915F00",
  },
  red: {
    50: "#FDEDEC",
    100: "#FAD3CF",
    300: "#F18E83",
    500: "#DE402F",
    600: "#B82B1D",
    700: "#8A1D12",
  },
  blue: {
    50: "#E8F2FF",
    100: "#C7DDFF",
    300: "#7BAAFF",
    500: "#3674E5",
    600: "#235ABF",
    700: "#1A4592",
  },
} as const;

export type Palette = typeof palette;

export type SemanticColors = {
  // Surfaces & layout
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceSunken: string;
  surfaceRaised: string;
  border: string;
  borderStrong: string;
  divider: string;

  // Foreground
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverted: string;
  textOnAccent: string;

  // Brand
  accent: string;
  accentHover: string;
  accentPressed: string;
  accentSubtle: string;
  accentSubtleText: string;
  accentFocusRing: string;

  // States
  successFg: string;
  successBg: string;
  successBorder: string;
  warningFg: string;
  warningBg: string;
  warningBorder: string;
  dangerFg: string;
  dangerBg: string;
  dangerBorder: string;
  infoFg: string;
  infoBg: string;
  infoBorder: string;

  // Interaction
  focusRing: string;
  overlay: string;
};

const light: SemanticColors = {
  background: palette.neutral[50],
  surface: palette.neutral[0],
  surfaceMuted: palette.neutral[100],
  surfaceSunken: palette.neutral[100],
  surfaceRaised: palette.neutral[0],
  border: palette.neutral[200],
  borderStrong: palette.neutral[300],
  divider: palette.neutral[200],

  textPrimary: palette.neutral[900],
  textSecondary: palette.neutral[600],
  textMuted: palette.neutral[500],
  textInverted: palette.neutral[0],
  textOnAccent: palette.neutral[0],

  accent: palette.indigo[500],
  accentHover: palette.indigo[600],
  accentPressed: palette.indigo[700],
  accentSubtle: palette.indigo[50],
  accentSubtleText: palette.indigo[700],
  accentFocusRing: "rgba(82, 88, 238, 0.35)",

  successFg: palette.green[700],
  successBg: palette.green[50],
  successBorder: palette.green[100],
  warningFg: palette.amber[700],
  warningBg: palette.amber[50],
  warningBorder: palette.amber[100],
  dangerFg: palette.red[700],
  dangerBg: palette.red[50],
  dangerBorder: palette.red[100],
  infoFg: palette.blue[700],
  infoBg: palette.blue[50],
  infoBorder: palette.blue[100],

  focusRing: "rgba(82, 88, 238, 0.45)",
  overlay: "rgba(11, 13, 26, 0.45)",
};

const dark: SemanticColors = {
  background: palette.neutral[1000],
  surface: palette.neutral[950],
  surfaceMuted: palette.neutral[900],
  surfaceSunken: "#070914",
  surfaceRaised: palette.neutral[900],
  border: "#1E2236",
  borderStrong: palette.neutral[800],
  divider: "#1A1D2F",

  textPrimary: palette.neutral[25],
  textSecondary: palette.neutral[300],
  textMuted: palette.neutral[400],
  textInverted: palette.neutral[1000],
  textOnAccent: palette.neutral[0],

  accent: palette.indigo[400],
  accentHover: palette.indigo[300],
  accentPressed: palette.indigo[200],
  accentSubtle: "rgba(111, 118, 251, 0.16)",
  accentSubtleText: palette.indigo[200],
  accentFocusRing: "rgba(143, 152, 255, 0.45)",

  successFg: palette.green[300],
  successBg: "rgba(31, 178, 100, 0.16)",
  successBorder: "rgba(31, 178, 100, 0.35)",
  warningFg: palette.amber[300],
  warningBg: "rgba(240, 167, 36, 0.14)",
  warningBorder: "rgba(240, 167, 36, 0.30)",
  dangerFg: palette.red[300],
  dangerBg: "rgba(222, 64, 47, 0.14)",
  dangerBorder: "rgba(222, 64, 47, 0.30)",
  infoFg: palette.blue[300],
  infoBg: "rgba(54, 116, 229, 0.14)",
  infoBorder: "rgba(54, 116, 229, 0.30)",

  focusRing: "rgba(143, 152, 255, 0.55)",
  overlay: "rgba(0, 0, 0, 0.65)",
};

export const colors = { light, dark } as const;
export { palette };
