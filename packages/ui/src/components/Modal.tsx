import React from "react";
import { Modal as RNModal, Pressable, ScrollView, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";
import { IconButton } from "./IconButton";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  width?: number | "auto";
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  width = 520,
  children,
  footer,
  style,
}: ModalProps) {
  const theme = useTheme();
  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.lg,
        }}
      >
        <Pressable
          onPress={() => {}}
          style={[
            {
              width: width === "auto" ? undefined : width,
              maxWidth: "94%",
              maxHeight: "92%",
              backgroundColor: theme.colors.surfaceRaised,
              borderRadius: theme.radius.xl,
              borderWidth: 1,
              borderColor: theme.colors.border,
              ...(theme.shadows.xl as object),
            },
            style,
          ]}
        >
          {title || description ? (
            <View
              style={{
                paddingTop: theme.spacing.lg,
                paddingBottom: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
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
          ) : null}
          <ScrollView
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ padding: theme.spacing.lg }}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
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
