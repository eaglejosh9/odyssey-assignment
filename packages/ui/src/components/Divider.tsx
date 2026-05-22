import React from "react";
import { View, type ViewStyle } from "react-native";
import { useTheme } from "../theme";

export type DividerProps = {
  orientation?: "horizontal" | "vertical";
  style?: ViewStyle;
};

export function Divider({ orientation = "horizontal", style }: DividerProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        orientation === "horizontal"
          ? { height: 1, alignSelf: "stretch", backgroundColor: theme.colors.divider }
          : { width: 1, alignSelf: "stretch", backgroundColor: theme.colors.divider },
        style,
      ]}
    />
  );
}
