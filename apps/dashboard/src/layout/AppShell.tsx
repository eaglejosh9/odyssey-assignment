import { useTheme, useThemeControls } from "@odyssey/ui";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { Text } from "@odyssey/ui";
import { Link, usePathname } from "expo-router";
import { useState, type ReactNode } from "react";

type NavItem = { href: string; label: string; glyph: string };

const NAV: NavItem[] = [
  { href: "/", label: "Home", glyph: "◆" },
  { href: "/orders", label: "Orders", glyph: "≡" },
  { href: "/menu", label: "Menu", glyph: "❖" },
  { href: "/crm", label: "CRM", glyph: "○" },
  { href: "/settings", label: "Settings", glyph: "✦" },
  { href: "/ui-library", label: "UI Library", glyph: "▦" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { themeName, toggleTheme } = useThemeControls();
  const { width } = useWindowDimensions();
  const compact = width < 900;

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: theme.colors.background }}>
      {!compact ? <Sidebar /> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          style={{
            height: 56,
            paddingHorizontal: theme.spacing.lg,
            borderBottomWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: theme.spacing.base,
          }}
        >
          <Text variant="bodyMd" color="secondary">Dashboard</Text>
          <Pressable
            onPress={toggleTheme}
            accessibilityLabel="Toggle theme"
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingVertical: 6,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            }}
          >
            <Text variant="label">{themeName === "light" ? "Light" : "Dark"} mode</Text>
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingVertical: theme.spacing.xl,
            paddingHorizontal: theme.spacing["2xl"],
            maxWidth: theme.layout.maxContentWidth + theme.layout.sidebarWidth,
            width: "100%",
          }}
        >
          <View style={{ maxWidth: theme.layout.maxContentWidth, width: "100%", alignSelf: "stretch" }}>
            {children}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function Sidebar() {
  const theme = useTheme();
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  }

  return (
    <View
      style={{
        width: theme.layout.sidebarWidth,
        borderRightWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.spacing.xl,
        paddingHorizontal: theme.spacing.base,
        gap: theme.spacing.base,
      }}
    >
      <View style={{ paddingHorizontal: theme.spacing.sm, marginBottom: theme.spacing.sm, gap: 2 }}>
        <Text variant="overline" color="muted">Odyssey</Text>
        <Text variant="h3">Trattoria Polaris</Text>
      </View>
      <View style={{ gap: 2 }}>
        {NAV.map((item) => (
          <NavLink key={item.href} item={item} active={!!isActive(item.href)} />
        ))}
      </View>
    </View>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={item.href as never} asChild>
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 8,
          borderRadius: theme.radius.md,
          backgroundColor: active
            ? theme.colors.accentSubtle
            : hovered
            ? theme.colors.surfaceMuted
            : "transparent",
        }}
      >
        <Text
          variant="body"
          style={{
            color: active ? theme.colors.accentSubtleText : theme.colors.textMuted,
            width: 18,
            textAlign: "center",
          }}
        >
          {item.glyph}
        </Text>
        <Text
          variant="bodyMd"
          color={active ? "accent" : "secondary"}
          weight={active ? "600" : "500"}
        >
          {item.label}
        </Text>
      </Pressable>
    </Link>
  );
}
