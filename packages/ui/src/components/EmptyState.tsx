import React from "react";
import { View, type ViewStyle } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  style?: ViewStyle;
};

export function EmptyState({ title, description, icon, action, style }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          alignItems: "center",
          gap: theme.spacing.sm,
          paddingVertical: theme.spacing["3xl"],
          paddingHorizontal: theme.spacing.lg,
        },
        style,
      ]}
    >
      {icon ? (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: theme.radius.lg,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.surfaceMuted,
            marginBottom: theme.spacing.xs,
          }}
        >
          {icon}
        </View>
      ) : null}
      <Text variant="h3" align="center">{title}</Text>
      {description ? (
        <Text variant="bodySm" color="muted" align="center" style={{ maxWidth: 360 }}>
          {description}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: theme.spacing.sm }}>{action}</View> : null}
    </View>
  );
}
