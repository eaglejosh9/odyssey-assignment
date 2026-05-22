import React, { useState } from "react";
import { TextInput, View, type TextInputProps, type ViewStyle } from "react-native";
import { useTheme } from "../theme";

export type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<TextInputProps, "style"> & {
  size?: InputSize;
  invalid?: boolean;
  fullWidth?: boolean;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  style?: ViewStyle;
};

export function Input({
  size = "md",
  invalid,
  fullWidth = true,
  leftSlot,
  rightSlot,
  editable = true,
  style,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const heightMap = {
    sm: theme.layout.controlHeightSm,
    md: theme.layout.controlHeight,
    lg: theme.layout.controlHeightLg,
  };
  const padX = size === "sm" ? theme.spacing.md : theme.spacing.base;

  const borderColor = invalid
    ? theme.colors.dangerFg
    : focused
    ? theme.colors.accent
    : theme.colors.border;

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
          height: heightMap[size],
          paddingHorizontal: padX,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor,
          backgroundColor: editable ? theme.colors.surface : theme.colors.surfaceMuted,
          width: fullWidth ? "100%" : undefined,
          opacity: editable ? 1 : 0.7,
        },
        focused
          ? ({ boxShadow: `0 0 0 3px ${theme.colors.accentFocusRing}` } as ViewStyle)
          : null,
        style,
      ]}
    >
      {leftSlot}
      <TextInput
        {...rest}
        editable={editable}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        placeholderTextColor={theme.colors.textMuted}
        style={{
          flex: 1,
          color: theme.colors.textPrimary,
          fontFamily: theme.typography.body.fontFamily,
          fontSize: size === "sm" ? 13 : 14,
          // Web RN sets outlineStyle to "auto" by default — kill it; we draw our own focus.
          ...(({ outlineStyle: "none" } as unknown) as object),
        }}
      />
      {rightSlot}
    </View>
  );
}
