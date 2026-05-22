import React from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../theme";
import type { RadiusToken } from "../tokens/radius";
import type { ShadowToken } from "../tokens/shadow";
import type { SpaceToken } from "../tokens/spacing";

type SemanticBg =
  | "background"
  | "surface"
  | "surfaceMuted"
  | "surfaceSunken"
  | "surfaceRaised"
  | "accent"
  | "accentSubtle";

export type BoxProps = ViewProps & {
  p?: SpaceToken;
  px?: SpaceToken;
  py?: SpaceToken;
  pt?: SpaceToken;
  pr?: SpaceToken;
  pb?: SpaceToken;
  pl?: SpaceToken;
  m?: SpaceToken;
  mx?: SpaceToken;
  my?: SpaceToken;
  bg?: SemanticBg;
  rounded?: RadiusToken;
  shadow?: ShadowToken;
  border?: boolean;
  borderColor?: string;
  flex?: number;
  style?: ViewStyle | ViewStyle[];
};

export function Box({
  p, px, py, pt, pr, pb, pl,
  m, mx, my,
  bg,
  rounded,
  shadow,
  border,
  borderColor,
  flex,
  style,
  children,
  ...rest
}: BoxProps) {
  const theme = useTheme();
  const s = theme.spacing;
  const bgMap: Record<SemanticBg, string> = {
    background: theme.colors.background,
    surface: theme.colors.surface,
    surfaceMuted: theme.colors.surfaceMuted,
    surfaceSunken: theme.colors.surfaceSunken,
    surfaceRaised: theme.colors.surfaceRaised,
    accent: theme.colors.accent,
    accentSubtle: theme.colors.accentSubtle,
  };
  return (
    <View
      {...rest}
      style={[
        {
          padding: p !== undefined ? s[p] : undefined,
          paddingHorizontal: px !== undefined ? s[px] : undefined,
          paddingVertical: py !== undefined ? s[py] : undefined,
          paddingTop: pt !== undefined ? s[pt] : undefined,
          paddingRight: pr !== undefined ? s[pr] : undefined,
          paddingBottom: pb !== undefined ? s[pb] : undefined,
          paddingLeft: pl !== undefined ? s[pl] : undefined,
          margin: m !== undefined ? s[m] : undefined,
          marginHorizontal: mx !== undefined ? s[mx] : undefined,
          marginVertical: my !== undefined ? s[my] : undefined,
          backgroundColor: bg ? bgMap[bg] : undefined,
          borderRadius: rounded !== undefined ? theme.radius[rounded] : undefined,
          borderWidth: border ? theme.borders.width : undefined,
          borderColor: border ? borderColor ?? theme.colors.border : undefined,
          flex,
        },
        shadow ? (theme.shadows[shadow] as ViewStyle) : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}
