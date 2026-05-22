import React, { useEffect, useRef } from "react";
import { Animated, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme";

export type SkeletonProps = {
  width?: number | string;
  height?: number;
  rounded?: number;
  style?: ViewStyle;
};

export function Skeleton({ width = "100%", height = 14, rounded, style }: SkeletonProps) {
  const theme = useTheme();
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.85, duration: 700, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0.45, duration: 700, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: rounded ?? theme.radius.sm,
          backgroundColor: theme.colors.surfaceMuted,
          opacity: pulse,
        } as ViewStyle,
        style,
      ]}
    />
  );
}

export function SkeletonStack({ lines = 3 }: { lines?: number }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? "60%" : "100%"} />
      ))}
    </View>
  );
}
