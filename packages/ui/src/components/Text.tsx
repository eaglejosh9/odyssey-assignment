import React from "react";
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";
import { useTheme } from "../theme";
import type { TypographyName } from "../tokens/typography";

type ColorVariant =
  | "primary"
  | "secondary"
  | "muted"
  | "inverted"
  | "onAccent"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type TextProps = Omit<RNTextProps, "style"> & {
  variant?: TypographyName;
  color?: ColorVariant;
  align?: TextStyle["textAlign"];
  weight?: TextStyle["fontWeight"];
  numberOfLines?: number;
  style?: TextStyle;
};

export function Text({
  variant = "body",
  color = "primary",
  align,
  weight,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const baseStyle = theme.typography[variant] as TextStyle;
  const colorMap: Record<ColorVariant, string> = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    inverted: theme.colors.textInverted,
    onAccent: theme.colors.textOnAccent,
    accent: theme.colors.accentSubtleText,
    success: theme.colors.successFg,
    warning: theme.colors.warningFg,
    danger: theme.colors.dangerFg,
    info: theme.colors.infoFg,
  };
  return (
    <RNText
      {...rest}
      style={[
        baseStyle,
        { color: colorMap[color] },
        align ? { textAlign: align } : null,
        weight ? { fontWeight: weight } : null,
        style,
      ]}
    />
  );
}
