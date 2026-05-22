import { setApiBaseUrl } from "@odyssey/api-client";
import { ThemeProvider, ToastProvider } from "@odyssey/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useMemo, type ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined) ??
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  "http://localhost:8787";

setApiBaseUrl(API_BASE_URL);

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: { retry: 0 },
        },
      }),
    []
  );

  return (
    <SafeAreaProvider>
      <ThemeProvider initialTheme="system">
        <QueryClientProvider client={queryClient}>
          <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
