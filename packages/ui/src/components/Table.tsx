import React from "react";
import { Pressable, ScrollView, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";

export type TableColumn<T> = {
  key: string;
  header: string;
  /** Fixed width in px. If omitted, the column grows (flex: 1) with a sensible minimum. */
  width?: number;
  /** Lower bound when flex/grow columns are squeezed. Defaults to 160. */
  minWidth?: number;
  align?: "left" | "right" | "center";
  render: (row: T) => React.ReactNode;
};

export type TableProps<T> = {
  rows: ReadonlyArray<T>;
  columns: ReadonlyArray<TableColumn<T>>;
  onRowPress?: (row: T) => void;
  keyExtractor: (row: T) => string;
  emptyState?: React.ReactNode;
  loading?: boolean;
  style?: ViewStyle;
};

function alignToFlex(a: TableColumn<unknown>["align"]): ViewStyle["justifyContent"] {
  switch (a) {
    case "right": return "flex-end";
    case "center": return "center";
    default: return "flex-start";
  }
}

const CELL_PADDING = 12;

function cellStyle<T>(col: TableColumn<T>): ViewStyle {
  const fixed = typeof col.width === "number";
  return {
    width: fixed ? col.width : undefined,
    minWidth: fixed ? col.width : col.minWidth ?? 160,
    flexGrow: fixed ? 0 : 1,
    flexShrink: fixed ? 0 : 1,
    flexBasis: fixed ? col.width : 0,
    paddingRight: CELL_PADDING,
    justifyContent: alignToFlex(col.align),
    alignItems: "center",
    flexDirection: "row",
  };
}

export function Table<T>({
  rows,
  columns,
  onRowPress,
  keyExtractor,
  emptyState,
  loading,
  style,
}: TableProps<T>) {
  const theme = useTheme();

  // Sum of every column's effective min-width — the table never compresses
  // below this; instead the user scrolls horizontally.
  const minTableWidth = columns.reduce(
    (acc, c) =>
      acc + (typeof c.width === "number" ? c.width : c.minWidth ?? 160) + CELL_PADDING,
    0
  );

  return (
    <View
      style={[
        {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ minWidth: "100%" }}>
        <View style={{ minWidth: minTableWidth, flex: 1 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              paddingVertical: theme.spacing.sm,
              paddingLeft: theme.spacing.base,
              paddingRight: theme.spacing.base - CELL_PADDING,
              backgroundColor: theme.colors.surfaceMuted,
              borderBottomWidth: 1,
              borderColor: theme.colors.divider,
            }}
          >
            {columns.map((col) => (
              <View key={col.key} style={cellStyle(col)}>
                <Text variant="overline" color="muted" numberOfLines={1}>{col.header}</Text>
              </View>
            ))}
          </View>

          {/* Body */}
          {loading ? (
            <View style={{ padding: theme.spacing.xl, alignItems: "center" }}>
              <Text color="muted">Loading…</Text>
            </View>
          ) : rows.length === 0 ? (
            <View style={{ padding: theme.spacing.xl, alignItems: "center" }}>
              {emptyState ?? <Text color="muted">No results.</Text>}
            </View>
          ) : (
            rows.map((row, index) => (
              <Row
                key={keyExtractor(row)}
                item={row}
                columns={columns}
                onPress={onRowPress}
                divider={index < rows.length - 1}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Row<T>({
  item,
  columns,
  onPress,
  divider,
}: {
  item: T;
  columns: ReadonlyArray<TableColumn<T>>;
  onPress?: (row: T) => void;
  divider: boolean;
}) {
  const theme = useTheme();
  const [hovered, setHovered] = React.useState(false);

  const inner = (
    <View
      style={{
        flexDirection: "row",
        paddingVertical: theme.spacing.md,
        paddingLeft: theme.spacing.base,
        paddingRight: theme.spacing.base - CELL_PADDING,
        backgroundColor: hovered ? theme.colors.surfaceMuted : theme.colors.surface,
        borderBottomWidth: divider ? 1 : 0,
        borderColor: theme.colors.divider,
        alignItems: "center",
      }}
    >
      {columns.map((col) => (
        <View key={col.key} style={cellStyle(col)}>
          {col.render(item)}
        </View>
      ))}
    </View>
  );

  if (!onPress) return inner;
  return (
    <Pressable
      onPress={() => onPress(item)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      {inner}
    </Pressable>
  );
}