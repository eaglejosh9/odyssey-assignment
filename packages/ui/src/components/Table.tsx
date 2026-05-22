import React from "react";
import { FlatList, Pressable, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";

export type TableColumn<T> = {
  key: string;
  header: string;
  width?: number | string;
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
      <View
        style={{
          flexDirection: "row",
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.base,
          backgroundColor: theme.colors.surfaceMuted,
          borderBottomWidth: 1,
          borderColor: theme.colors.divider,
          gap: theme.spacing.base,
        }}
      >
        {columns.map((col) => (
          <View
            key={col.key}
            style={{
              width: typeof col.width === "number" ? col.width : undefined,
              flex: col.width === undefined ? 1 : 0,
              justifyContent: alignToFlex(col.align),
              flexDirection: "row",
            }}
          >
            <Text variant="overline" color="muted">{col.header}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View style={{ padding: theme.spacing.xl, alignItems: "center" }}>
          <Text color="muted">Loading…</Text>
        </View>
      ) : rows.length === 0 ? (
        <View style={{ padding: theme.spacing.xl, alignItems: "center" }}>
          {emptyState ?? <Text color="muted">No results.</Text>}
        </View>
      ) : (
        <FlatList
          data={rows as T[]}
          keyExtractor={keyExtractor}
          renderItem={({ item, index }) => (
            <Row
              item={item}
              columns={columns}
              onPress={onRowPress}
              divider={index < rows.length - 1}
            />
          )}
          scrollEnabled={false}
        />
      )}
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
        paddingHorizontal: theme.spacing.base,
        gap: theme.spacing.base,
        backgroundColor: hovered ? theme.colors.surfaceMuted : theme.colors.surface,
        borderBottomWidth: divider ? 1 : 0,
        borderColor: theme.colors.divider,
        alignItems: "center",
      }}
    >
      {columns.map((col) => (
        <View
          key={col.key}
          style={{
            width: typeof col.width === "number" ? col.width : undefined,
            flex: col.width === undefined ? 1 : 0,
            justifyContent: alignToFlex(col.align),
            flexDirection: "row",
          }}
        >
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
