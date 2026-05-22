import { EmptyState, SkeletonStack, useTheme } from "@odyssey/ui";
import type { ReactNode } from "react";
import { View } from "react-native";

type State<T> = {
  isLoading: boolean;
  isError: boolean;
  error?: { message?: string } | null;
  data?: T;
};

/**
 * Tiny wrapper around React Query result states. Renders the children only
 * when `data` is defined; otherwise shows skeleton, error empty-state, or the
 * caller-provided empty state.
 */
export function QueryBoundary<T>({
  state,
  empty,
  children,
}: {
  state: State<T>;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}) {
  const theme = useTheme();

  if (state.isLoading || (!state.data && !state.isError)) {
    return (
      <View style={{ gap: theme.spacing.lg }}>
        <SkeletonStack lines={3} />
        <SkeletonStack lines={4} />
      </View>
    );
  }
  if (state.isError || !state.data) {
    return (
      <EmptyState
        title="Couldn't load data"
        description={state.error?.message ?? "An unexpected error occurred. Try refreshing the page."}
      />
    );
  }
  if (Array.isArray(state.data) && state.data.length === 0 && empty) {
    return <>{empty}</>;
  }
  return <>{children(state.data)}</>;
}
