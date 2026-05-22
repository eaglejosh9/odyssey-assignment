import React, { useState } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";

export type TabItem<T extends string = string> = {
  value: T;
  label: string;
  hint?: string | number;
};

export type TabsProps<T extends string> = {
  value: T;
  onChange: (next: T) => void;
  items: ReadonlyArray<TabItem<T>>;
  variant?: "underline" | "pills";
  style?: ViewStyle;
};

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  variant = "pills",
  style,
}: TabsProps<T>) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          gap: variant === "pills" ? theme.spacing.xs : theme.spacing.lg,
          padding: variant === "pills" ? theme.spacing.xs : 0,
          backgroundColor: variant === "pills" ? theme.colors.surfaceMuted : "transparent",
          borderRadius: variant === "pills" ? theme.radius.md : 0,
          borderBottomWidth: variant === "underline" ? 1 : 0,
          borderColor: theme.colors.border,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      {items.map((item) => (
        <TabButton
          key={item.value}
          item={item}
          active={item.value === value}
          variant={variant}
          onPress={() => onChange(item.value)}
        />
      ))}
    </View>
  );
}

function TabButton<T extends string>({
  item,
  active,
  variant,
  onPress,
}: {
  item: TabItem<T>;
  active: boolean;
  variant: "underline" | "pills";
  onPress: () => void;
}) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);

  if (variant === "pills") {
    return (
      <Pressable
        onPress={onPress}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={{
          paddingHorizontal: theme.spacing.md,
          paddingVertical: 6,
          borderRadius: theme.radius.sm,
          backgroundColor: active
            ? theme.colors.surface
            : hovered
            ? theme.colors.surface
            : "transparent",
          borderWidth: active ? 1 : 0,
          borderColor: theme.colors.border,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Text
          variant="label"
          color={active ? "primary" : "secondary"}
          weight={active ? "600" : "500"}
        >
          {item.label}
        </Text>
        {item.hint !== undefined ? (
          <Text variant="caption" color="muted">{item.hint}</Text>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: active ? theme.colors.accent : "transparent",
        marginBottom: -1,
        flexDirection: "row",
        gap: 6,
        alignItems: "center",
      }}
    >
      <Text
        variant="label"
        color={active ? "primary" : "secondary"}
        weight={active ? "600" : "500"}
      >
        {item.label}
      </Text>
      {item.hint !== undefined ? <Text variant="caption" color="muted">{item.hint}</Text> : null}
    </Pressable>
  );
}
