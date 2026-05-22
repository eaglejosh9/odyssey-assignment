import React from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme";

export type SwitchProps = {
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel: string;
  style?: ViewStyle;
};

export function Switch({ value, onChange, disabled, ariaLabel, style }: SwitchProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={ariaLabel}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={[
        {
          width: 38,
          height: 22,
          borderRadius: 999,
          backgroundColor: value ? theme.colors.accent : theme.colors.borderStrong,
          padding: 2,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          backgroundColor: theme.colors.surface,
          transform: [{ translateX: value ? 16 : 0 }],
          ...(theme.shadows.sm as object),
        }}
      />
    </Pressable>
  );
}
