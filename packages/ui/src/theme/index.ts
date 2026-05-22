import React, { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Appearance, useColorScheme } from "react-native";
import { borders, colors, duration, easing, layout, palette, radius, shadows, spacing, typography } from "../tokens";
import type { SemanticColors } from "../tokens/colors";

export type ThemeName = "light" | "dark";

export type Theme = {
  name: ThemeName;
  colors: SemanticColors;
  palette: typeof palette;
  spacing: typeof spacing;
  radius: typeof radius;
  borders: typeof borders;
  shadows: typeof shadows;
  typography: typeof typography;
  duration: typeof duration;
  easing: typeof easing;
  layout: typeof layout;
};

function makeTheme(name: ThemeName): Theme {
  return {
    name,
    colors: colors[name],
    palette,
    spacing,
    radius,
    borders,
    shadows,
    typography,
    duration,
    easing,
    layout,
  };
}

type ThemeContextValue = {
  theme: Theme;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  toggleTheme: () => void;
};

const defaultName: ThemeName = (Appearance.getColorScheme() ?? "light") === "dark" ? "dark" : "light";

const ThemeContext = createContext<ThemeContextValue>({
  theme: makeTheme(defaultName),
  themeName: defaultName,
  setThemeName: () => {},
  toggleTheme: () => {},
});

export type ThemeProviderProps = {
  initialTheme?: ThemeName | "system";
  children: ReactNode;
};

export function ThemeProvider({ initialTheme = "system", children }: ThemeProviderProps) {
  const system = useColorScheme();
  const [override, setOverride] = useState<ThemeName | null>(
    initialTheme === "system" ? null : initialTheme
  );

  const resolvedName: ThemeName = override ?? (system === "dark" ? "dark" : "light");

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeName: resolvedName,
      theme: makeTheme(resolvedName),
      setThemeName: (n) => setOverride(n),
      toggleTheme: () => setOverride(resolvedName === "light" ? "dark" : "light"),
    }),
    [resolvedName]
  );

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

export function useThemeControls() {
  const { themeName, setThemeName, toggleTheme } = useContext(ThemeContext);
  return { themeName, setThemeName, toggleTheme };
}
