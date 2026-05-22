import React from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../theme";
import type { SpaceToken } from "../tokens/spacing";

type Align = "start" | "center" | "end" | "stretch" | "baseline";
type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";

function mapAlign(a?: Align): ViewStyle["alignItems"] | undefined {
  switch (a) {
    case "start": return "flex-start";
    case "end": return "flex-end";
    case "center": return "center";
    case "stretch": return "stretch";
    case "baseline": return "baseline";
    default: return undefined;
  }
}
function mapJustify(j?: Justify): ViewStyle["justifyContent"] | undefined {
  switch (j) {
    case "start": return "flex-start";
    case "end": return "flex-end";
    case "center": return "center";
    case "between": return "space-between";
    case "around": return "space-around";
    case "evenly": return "space-evenly";
    default: return undefined;
  }
}

export type StackProps = ViewProps & {
  direction?: "row" | "column";
  gap?: SpaceToken;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  flex?: number;
  style?: ViewStyle;
};

export function Stack({
  direction = "column",
  gap,
  align,
  justify,
  wrap,
  flex,
  style,
  children,
  ...rest
}: StackProps) {
  const theme = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: direction,
          gap: gap !== undefined ? theme.spacing[gap] : undefined,
          alignItems: mapAlign(align),
          justifyContent: mapJustify(justify),
          flexWrap: wrap ? "wrap" : undefined,
          flex,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function HStack(props: Omit<StackProps, "direction">) {
  return <Stack direction="row" {...props} />;
}

export function VStack(props: Omit<StackProps, "direction">) {
  return <Stack direction="column" {...props} />;
}
