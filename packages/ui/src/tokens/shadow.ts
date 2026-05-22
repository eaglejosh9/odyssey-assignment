import { Platform, type ViewStyle } from "react-native";

/**
 * Elevation tokens. On web we render box-shadow strings; on native we use
 * the platform-specific shadow* / elevation props.
 */
type ShadowStyle = Pick<
  ViewStyle,
  "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation"
> & { boxShadow?: string };

function shadow(
  blur: number,
  spread: number,
  yOffset: number,
  opacity: number,
  elevation: number
): ShadowStyle {
  if (Platform.OS === "web") {
    return {
      // RN Web honors boxShadow via style passthrough.
      boxShadow: `0 ${yOffset}px ${blur}px ${spread}px rgba(15, 18, 38, ${opacity})`,
    } as ShadowStyle;
  }
  return {
    shadowColor: "#0F1226",
    shadowOffset: { width: 0, height: yOffset },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation,
  };
}

export const shadows = {
  none: {} satisfies ShadowStyle,
  xs: shadow(2, 0, 1, 0.06, 1),
  sm: shadow(6, 0, 2, 0.06, 2),
  md: shadow(14, -2, 6, 0.08, 4),
  lg: shadow(24, -4, 10, 0.10, 8),
  xl: shadow(40, -8, 18, 0.14, 16),
  focus: {
    ...shadow(0, 4, 0, 0, 0),
    boxShadow: "0 0 0 3px rgba(82, 88, 238, 0.35)",
  } satisfies ShadowStyle,
} as const;

export type ShadowToken = keyof typeof shadows;
