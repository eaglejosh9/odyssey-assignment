import React from "react";
import { View, type ViewStyle } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

export type BadgeProps = {
  tone?: BadgeTone;
  variant?: "soft" | "solid" | "outline";
  size?: "sm" | "md";
  children: React.ReactNode;
  leftDot?: boolean;
  style?: ViewStyle;
};

export function Badge({
  tone = "neutral",
  variant = "soft",
  size = "sm",
  leftDot = false,
  children,
  style,
}: BadgeProps) {
  const theme = useTheme();

  const toneColors = (() => {
    switch (tone) {
      case "accent":  return { bg: theme.colors.accentSubtle, fg: theme.colors.accentSubtleText, border: theme.colors.accentSubtle };
      case "success": return { bg: theme.colors.successBg, fg: theme.colors.successFg, border: theme.colors.successBorder };
      case "warning": return { bg: theme.colors.warningBg, fg: theme.colors.warningFg, border: theme.colors.warningBorder };
      case "danger":  return { bg: theme.colors.dangerBg, fg: theme.colors.dangerFg, border: theme.colors.dangerBorder };
      case "info":    return { bg: theme.colors.infoBg, fg: theme.colors.infoFg, border: theme.colors.infoBorder };
      case "neutral":
      default:        return { bg: theme.colors.surfaceMuted, fg: theme.colors.textSecondary, border: theme.colors.border };
    }
  })();

  const isSolid = variant === "solid";
  const isOutline = variant === "outline";

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.xs,
          alignSelf: "flex-start",
          paddingHorizontal: size === "sm" ? theme.spacing.sm : theme.spacing.md,
          paddingVertical: size === "sm" ? 2 : 4,
          borderRadius: theme.radius.pill,
          backgroundColor: isOutline ? "transparent" : isSolid ? toneColors.fg : toneColors.bg,
          borderWidth: isOutline ? 1 : 0,
          borderColor: isOutline ? toneColors.border : "transparent",
        },
        style,
      ]}
    >
      {leftDot ? (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            backgroundColor: isSolid ? theme.colors.textOnAccent : toneColors.fg,
          }}
        />
      ) : null}
      <Text
        variant="caption"
        style={{
          color: isSolid ? theme.colors.textOnAccent : toneColors.fg,
          fontSize: size === "sm" ? 11 : 12,
          fontWeight: "600",
        }}
      >
        {children}
      </Text>
    </View>
  );
}
