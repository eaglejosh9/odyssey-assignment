import React, { useState } from "react";
import { Pressable, type PressableProps, type ViewStyle } from "react-native";
import { useTheme } from "../theme";

export type IconButtonProps = Omit<PressableProps, "style" | "children"> & {
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "secondary";
  children: React.ReactNode;
  style?: ViewStyle;
  ariaLabel: string;
};

export function IconButton({
  size = "md",
  variant = "ghost",
  children,
  style,
  ariaLabel,
  ...rest
}: IconButtonProps) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const dim = { sm: 28, md: 32, lg: 40 }[size];
  return (
    <Pressable
      {...rest}
      accessibilityLabel={ariaLabel}
      accessibilityRole="button"
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        {
          width: dim,
          height: dim,
          borderRadius: theme.radius.md,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            variant === "secondary"
              ? pressed
                ? theme.colors.surfaceMuted
                : hovered
                ? theme.colors.surfaceMuted
                : theme.colors.surface
              : pressed || hovered
              ? theme.colors.surfaceMuted
              : "transparent",
          borderWidth: variant === "secondary" ? 1 : 0,
          borderColor: variant === "secondary" ? theme.colors.border : undefined,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
