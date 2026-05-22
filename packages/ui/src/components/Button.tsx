import React, { useState } from "react";
import { ActivityIndicator, Pressable, View, type PressableProps, type ViewStyle } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<PressableProps, "style" | "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  children?: React.ReactNode;
  style?: ViewStyle;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  fullWidth,
  leftSlot,
  rightSlot,
  style,
  children,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);

  const heightMap = {
    sm: theme.layout.controlHeightSm,
    md: theme.layout.controlHeight,
    lg: theme.layout.controlHeightLg,
  };
  const padXMap = { sm: theme.spacing.md, md: theme.spacing.base, lg: theme.spacing.lg };
  const fontSizeMap = { sm: 13, md: 14, lg: 16 };

  const labelColorFor = (v: ButtonVariant): string => {
    switch (v) {
      case "primary": return theme.colors.textOnAccent;
      case "danger": return theme.colors.textOnAccent;
      case "secondary": return theme.colors.textPrimary;
      case "ghost": return theme.colors.textPrimary;
      case "subtle": return theme.colors.accentSubtleText;
    }
  };

  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        {
          height: heightMap[size],
          paddingHorizontal: padXMap[size],
          borderRadius: theme.radius.md,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: theme.spacing.sm,
          width: fullWidth ? "100%" : undefined,
          opacity: disabled ? 0.5 : 1,
          borderWidth: 1,
          borderColor: "transparent",
        },
        variantStyle(variant, theme, { hovered, pressed }),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={labelColorFor(variant)} />
      ) : (
        <>
          {leftSlot ? <View style={{ marginRight: -2 }}>{leftSlot}</View> : null}
          <Text
            variant="label"
            style={{
              color: labelColorFor(variant),
              fontSize: fontSizeMap[size],
              fontWeight: "600",
            }}
          >
            {children}
          </Text>
          {rightSlot ? <View style={{ marginLeft: -2 }}>{rightSlot}</View> : null}
        </>
      )}
    </Pressable>
  );
}

function variantStyle(
  v: ButtonVariant,
  theme: ReturnType<typeof useTheme>,
  state: { hovered: boolean; pressed: boolean }
): ViewStyle {
  const { hovered, pressed } = state;
  switch (v) {
    case "primary": {
      const bg = pressed ? theme.colors.accentPressed : hovered ? theme.colors.accentHover : theme.colors.accent;
      return { backgroundColor: bg, borderColor: bg };
    }
    case "secondary": {
      return {
        backgroundColor: pressed ? theme.colors.surfaceMuted : hovered ? theme.colors.surfaceMuted : theme.colors.surface,
        borderColor: theme.colors.border,
      };
    }
    case "ghost": {
      return {
        backgroundColor: pressed || hovered ? theme.colors.surfaceMuted : "transparent",
        borderColor: "transparent",
      };
    }
    case "subtle": {
      return {
        backgroundColor: pressed || hovered ? theme.colors.accentSubtle : theme.colors.accentSubtle,
        borderColor: "transparent",
      };
    }
    case "danger": {
      const bg = pressed ? theme.colors.dangerFg : hovered ? theme.colors.dangerFg : theme.colors.dangerFg;
      return { backgroundColor: bg, borderColor: bg };
    }
  }
}
