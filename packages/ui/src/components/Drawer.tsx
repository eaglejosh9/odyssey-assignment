import React from "react";
import { Modal as RNModal, Pressable, ScrollView, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";
import { IconButton } from "./IconButton";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  side?: "right";
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
};

export function Drawer({
  open,
  onClose,
  title,
  description,
  width = 460,
  children,
  footer,
  style,
}: DrawerProps) {
  const theme = useTheme();
  return (
    <RNModal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={() => {}}
          style={[
            {
              width,
              maxWidth: "100%",
              height: "100%",
              backgroundColor: theme.colors.surface,
              borderLeftWidth: 1,
              borderColor: theme.colors.border,
              ...(theme.shadows.xl as object),
            },
            style,
          ]}
        >
          <View
            style={{
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.base,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: theme.spacing.base,
              borderBottomWidth: 1,
              borderColor: theme.colors.divider,
            }}
          >
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              {title ? <Text variant="h3">{title}</Text> : null}
              {description ? <Text variant="bodySm" color="muted">{description}</Text> : null}
            </View>
            <IconButton ariaLabel="Close" onPress={onClose}>
              <Text variant="body" color="muted">✕</Text>
            </IconButton>
          </View>
          <ScrollView contentContainerStyle={{ padding: theme.spacing.lg }}>{children}</ScrollView>
          {footer ? (
            <View
              style={{
                padding: theme.spacing.lg,
                paddingTop: theme.spacing.md,
                borderTopWidth: 1,
                borderColor: theme.colors.divider,
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: theme.spacing.sm,
              }}
            >
              {footer}
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
