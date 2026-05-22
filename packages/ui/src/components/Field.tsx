import React from "react";
import { View, type ViewStyle } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";

export type FieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function Field({ label, hint, error, required, children, style }: FieldProps) {
  const theme = useTheme();
  return (
    <View style={[{ gap: theme.spacing.xs }, style]}>
      {label ? (
        <Text variant="label" color="secondary">
          {label}
          {required ? <Text variant="label" color="danger"> *</Text> : null}
        </Text>
      ) : null}
      {children}
      {error ? (
        <Text variant="caption" color="danger">{error}</Text>
      ) : hint ? (
        <Text variant="caption" color="muted">{hint}</Text>
      ) : null}
    </View>
  );
}
