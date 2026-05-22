import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme";
import { Text } from "./Text";
import { IconButton } from "./IconButton";

export type ToastTone = "success" | "warning" | "danger" | "info" | "neutral";

export type Toast = {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
};

type ToastContextValue = {
  push: (t: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue>({ push: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const push = useCallback<ToastContextValue["push"]>((t) => {
    counter.current += 1;
    const id = counter.current;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((x) => x.id !== id))} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  const theme = useTheme();
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        bottom: theme.spacing.lg,
        right: theme.spacing.lg,
        gap: theme.spacing.sm,
        zIndex: 9999,
        // @ts-expect-error rn-web
        maxWidth: 380,
      }}
    >
      {toasts.map((t) => <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />)}
    </View>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  const toneStyles: Record<ToastTone, { bg: string; fg: string; border: string }> = {
    success: { bg: theme.colors.successBg, fg: theme.colors.successFg, border: theme.colors.successBorder },
    warning: { bg: theme.colors.warningBg, fg: theme.colors.warningFg, border: theme.colors.warningBorder },
    danger:  { bg: theme.colors.dangerBg, fg: theme.colors.dangerFg, border: theme.colors.dangerBorder },
    info:    { bg: theme.colors.infoBg, fg: theme.colors.infoFg, border: theme.colors.infoBorder },
    neutral: { bg: theme.colors.surfaceRaised, fg: theme.colors.textPrimary, border: theme.colors.border },
  };
  const tn = toneStyles[toast.tone];

  return (
    <Animated.View
      style={[
        {
          backgroundColor: tn.bg,
          borderColor: tn.border,
          borderWidth: 1,
          borderLeftWidth: 3,
          borderRadius: theme.radius.md,
          padding: theme.spacing.base,
          flexDirection: "row",
          alignItems: "flex-start",
          gap: theme.spacing.sm,
          opacity,
          transform: [{ translateY }],
        } as ViewStyle,
        theme.shadows.lg as ViewStyle,
      ]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyMd" style={{ color: tn.fg }}>{toast.title}</Text>
        {toast.description ? (
          <Text variant="bodySm" color="secondary">{toast.description}</Text>
        ) : null}
      </View>
      <IconButton ariaLabel="Dismiss" onPress={onDismiss} size="sm">
        <Text color="muted">✕</Text>
      </IconButton>
    </Animated.View>
  );
}
