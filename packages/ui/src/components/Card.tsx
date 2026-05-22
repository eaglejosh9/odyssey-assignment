import React from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";

export type CardProps = ViewProps & {
  padded?: boolean;
  raised?: boolean;
  style?: ViewStyle;
};

export function Card({ padded = true, raised = false, style, children, ...rest }: CardProps) {
  const theme = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: padded ? theme.spacing.lg : 0,
        },
        raised ? (theme.shadows.md as ViewStyle) : (theme.shadows.xs as ViewStyle),
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CardHeader({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: theme.spacing.base,
        marginBottom: theme.spacing.base,
      }}
    >
      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <Text variant="h3">{title}</Text>
        {description ? <Text variant="bodySm" color="muted">{description}</Text> : null}
      </View>
      {right}
    </View>
  );
}
