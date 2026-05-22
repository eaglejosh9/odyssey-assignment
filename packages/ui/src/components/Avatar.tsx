import React from "react";
import { View, type ViewStyle } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";

export type AvatarProps = {
  name: string;
  size?: number;
  tone?: "neutral" | "accent";
  style?: ViewStyle;
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");
}

export function Avatar({ name, size = 32, tone = "neutral", style }: AvatarProps) {
  const theme = useTheme();
  const bg = tone === "accent" ? theme.colors.accentSubtle : theme.colors.surfaceMuted;
  const fg = tone === "accent" ? theme.colors.accentSubtleText : theme.colors.textSecondary;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: 999,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Text style={{ color: fg, fontSize: Math.max(11, size * 0.4), fontWeight: "600" }}>{initials(name)}</Text>
    </View>
  );
}
