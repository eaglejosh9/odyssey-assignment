import { Platform } from "react-native";

/**
 * Typography tokens. Web uses a modern system stack; native falls back to the
 * platform default. Sizes/weights are referenced semantically (display, h1, h2,
 * body, bodySm, label, caption, code) — components never use raw values.
 */

const sansStack =
  Platform.OS === "web"
    ? '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
    : "System";

const monoStack =
  Platform.OS === "web"
    ? '"JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
    : "Menlo";

export type TypeStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight:
    | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900"
    | "normal" | "bold";
  letterSpacing?: number;
};

export const typography = {
  fonts: { sans: sansStack, mono: monoStack },
  display: { fontFamily: sansStack, fontSize: 36, lineHeight: 42, fontWeight: "700", letterSpacing: -0.4 } satisfies TypeStyle,
  h1:      { fontFamily: sansStack, fontSize: 28, lineHeight: 34, fontWeight: "700", letterSpacing: -0.2 } satisfies TypeStyle,
  h2:      { fontFamily: sansStack, fontSize: 22, lineHeight: 28, fontWeight: "600", letterSpacing: -0.1 } satisfies TypeStyle,
  h3:      { fontFamily: sansStack, fontSize: 18, lineHeight: 24, fontWeight: "600" } satisfies TypeStyle,
  body:    { fontFamily: sansStack, fontSize: 15, lineHeight: 22, fontWeight: "400" } satisfies TypeStyle,
  bodyMd:  { fontFamily: sansStack, fontSize: 15, lineHeight: 22, fontWeight: "500" } satisfies TypeStyle,
  bodySm:  { fontFamily: sansStack, fontSize: 13, lineHeight: 19, fontWeight: "400" } satisfies TypeStyle,
  label:   { fontFamily: sansStack, fontSize: 13, lineHeight: 18, fontWeight: "500" } satisfies TypeStyle,
  caption: { fontFamily: sansStack, fontSize: 12, lineHeight: 16, fontWeight: "500", letterSpacing: 0.2 } satisfies TypeStyle,
  overline:{ fontFamily: sansStack, fontSize: 11, lineHeight: 14, fontWeight: "600", letterSpacing: 0.8 } satisfies TypeStyle,
  code:    { fontFamily: monoStack, fontSize: 13, lineHeight: 19, fontWeight: "400" } satisfies TypeStyle,
} as const;

export type TypographyName = Exclude<keyof typeof typography, "fonts">;
