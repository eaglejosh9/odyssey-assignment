import { Stack as ExpoStack } from "expo-router";
import { useEffect } from "react";
import { Providers } from "../src/providers";

export default function RootLayout() {
  useEffect(() => {
    // Set the document title on web.
    if (typeof document !== "undefined") {
      document.title = "Odyssey — Dashboard";
    }
  }, []);

  return (
    <Providers>
      <ExpoStack screenOptions={{ headerShown: false, animation: "none" }} />
    </Providers>
  );
}
