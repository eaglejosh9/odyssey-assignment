import React, { useState } from "react";
import { TextInput, View, type TextInputProps, type ViewStyle } from "react-native";
import { useTheme } from "../theme";

export type TextAreaProps = Omit<TextInputProps, "style" | "multiline"> & {
  invalid?: boolean;
  rows?: number;
  style?: ViewStyle;
};

export function TextArea({ invalid, rows = 4, style, editable = true, ...rest }: TextAreaProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const minH = 18 * rows + 16;
  const borderColor = invalid ? theme.colors.dangerFg : focused ? theme.colors.accent : theme.colors.border;
  return (
    <View
      style={[
        {
          minHeight: minH,
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor,
          backgroundColor: editable ? theme.colors.surface : theme.colors.surfaceMuted,
        },
        focused ? ({ boxShadow: `0 0 0 3px ${theme.colors.accentFocusRing}` } as ViewStyle) : null,
        style,
      ]}
    >
      <TextInput
        {...rest}
        editable={editable}
        multiline
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
        placeholderTextColor={theme.colors.textMuted}
        style={{
          color: theme.colors.textPrimary,
          fontFamily: theme.typography.body.fontFamily,
          fontSize: 14,
          textAlignVertical: "top",
          minHeight: 18 * rows,
          ...(({ outlineStyle: "none" } as unknown) as object),
        }}
      />
    </View>
  );
}
