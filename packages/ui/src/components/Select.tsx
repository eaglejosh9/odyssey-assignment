import React, { useState } from "react";
import { Modal, Pressable, ScrollView, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";

export type SelectOption<T extends string | number> = {
  value: T;
  label: string;
  description?: string;
};

export type SelectProps<T extends string | number> = {
  value: T | null;
  onChange: (next: T) => void;
  options: ReadonlyArray<SelectOption<T>>;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Select<T extends string | number>({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  invalid,
  fullWidth = true,
  style,
}: SelectProps<T>) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const selected = options.find((o) => o.value === value);

  const borderColor = invalid ? theme.colors.dangerFg : open ? theme.colors.accent : theme.colors.border;

  return (
    <>
      <Pressable
        disabled={disabled}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={({ pressed }) => [
          {
            height: theme.layout.controlHeight,
            paddingHorizontal: theme.spacing.base,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor,
            backgroundColor: disabled
              ? theme.colors.surfaceMuted
              : pressed || hovered
              ? theme.colors.surfaceMuted
              : theme.colors.surface,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: fullWidth ? "100%" : undefined,
            opacity: disabled ? 0.6 : 1,
          },
          open ? ({ boxShadow: `0 0 0 3px ${theme.colors.accentFocusRing}` } as ViewStyle) : null,
          style,
        ]}
      >
        <Text variant="body" color={selected ? "primary" : "muted"} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text variant="body" color="muted">
          ▾
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: "center", alignItems: "center" }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              maxWidth: 360,
              width: "92%",
              maxHeight: 440,
              backgroundColor: theme.colors.surfaceRaised,
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingVertical: theme.spacing.sm,
              ...(theme.shadows.xl as object),
            }}
          >
            <ScrollView>
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <Option
                    key={String(opt.value)}
                    option={opt}
                    selected={isSelected}
                    onPress={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  />
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function Option<T extends string | number>({
  option,
  selected,
  onPress,
}: {
  option: SelectOption<T>;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.base,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: pressed || hovered ? theme.colors.surfaceMuted : "transparent",
      })}
    >
      <View style={{ flex: 1 }}>
        <Text variant="body" weight="500">{option.label}</Text>
        {option.description ? <Text variant="caption" color="muted">{option.description}</Text> : null}
      </View>
      {selected ? <Text variant="body" color="accent">✓</Text> : null}
    </Pressable>
  );
}

