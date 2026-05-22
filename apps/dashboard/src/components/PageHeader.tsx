import { Text, useTheme } from "@odyssey/ui";
import { View, type ViewStyle } from "react-native";

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
};

export function PageHeader({ title, subtitle, right, style }: PageHeaderProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: theme.spacing.base,
          marginBottom: theme.spacing.xl,
        },
        style,
      ]}
    >
      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <Text variant="h1">{title}</Text>
        {subtitle ? <Text variant="body" color="secondary">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
