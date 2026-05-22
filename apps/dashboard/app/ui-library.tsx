import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Divider,
  EmptyState,
  Field,
  IconButton,
  Input,
  Modal,
  Select,
  Skeleton,
  SkeletonStack,
  StatusPill,
  Switch,
  Table,
  Tabs,
  Text,
  TextArea,
  useTheme,
  useToast,
} from "@odyssey/ui";
import { palette, radius, shadows, spacing, typography } from "@odyssey/ui/tokens";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { PageHeader } from "../src/components/PageHeader";
import { AppShell } from "../src/layout/AppShell";

/**
 * Living styleguide. Every primitive in @odyssey/ui shows up here in every
 * meaningful state so we can verify visual consistency at a glance.
 */
export default function UiLibraryRoute() {
  const theme = useTheme();
  return (
    <AppShell>
      <PageHeader
        title="UI Library"
        subtitle="Design tokens, primitives, and patterns. The single source of truth for the app's visual language."
      />

      <View style={{ gap: theme.spacing["2xl"] }}>
        <Section title="Color tokens" description="Semantic tokens reference primitives. Components only consume semantic.">
          <SwatchGrid />
        </Section>

        <Section title="Typography" description="Type scale and weights.">
          <TypographyShowcase />
        </Section>

        <Section title="Spacing" description="4pt-based spacing scale used for padding, gap, and margins.">
          <SpacingShowcase />
        </Section>

        <Section title="Surfaces, radius & shadow" description="Layering tokens for cards, modals, and overlays.">
          <SurfacesShowcase />
        </Section>

        <Section title="Buttons" description="Variants × sizes × states.">
          <ButtonsShowcase />
        </Section>

        <Section title="Inputs & forms">
          <FormShowcase />
        </Section>

        <Section title="Selection & toggle">
          <SelectionShowcase />
        </Section>

        <Section title="Status indicators" description="Badge tones + the specialized StatusPill used for orders.">
          <BadgesShowcase />
        </Section>

        <Section title="Feedback patterns" description="Loading, empty, success, warning, and error states.">
          <FeedbackShowcase />
        </Section>

        <Section title="Tabs">
          <TabsShowcase />
        </Section>

        <Section title="Tables">
          <TablesShowcase />
        </Section>

        <Section title="Overlays" description="Modal and toast.">
          <OverlayShowcase />
        </Section>
      </View>
    </AppShell>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <View style={{ marginTop: theme.spacing.xs }}>{children}</View>
    </Card>
  );
}

// --- Showcases ----------------------------------------------------------

function SwatchGrid() {
  const theme = useTheme();
  const semantic: { name: string; value: string }[] = [
    { name: "background", value: theme.colors.background },
    { name: "surface", value: theme.colors.surface },
    { name: "surfaceMuted", value: theme.colors.surfaceMuted },
    { name: "surfaceRaised", value: theme.colors.surfaceRaised },
    { name: "border", value: theme.colors.border },
    { name: "accent", value: theme.colors.accent },
    { name: "accentSubtle", value: theme.colors.accentSubtle },
    { name: "successFg", value: theme.colors.successFg },
    { name: "warningFg", value: theme.colors.warningFg },
    { name: "dangerFg", value: theme.colors.dangerFg },
    { name: "infoFg", value: theme.colors.infoFg },
    { name: "textPrimary", value: theme.colors.textPrimary },
    { name: "textSecondary", value: theme.colors.textSecondary },
    { name: "textMuted", value: theme.colors.textMuted },
  ];
  return (
    <View style={{ flexDirection: "row", gap: theme.spacing.lg, flexWrap: "wrap" }}>
      <View style={{ gap: theme.spacing.sm, flex: 1, minWidth: 280 }}>
        <Text variant="overline" color="muted">Semantic</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
          {semantic.map((s) => (
            <View key={s.name} style={{ width: 180, gap: 4 }}>
              <View
                style={{
                  height: 36,
                  borderRadius: theme.radius.sm,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: s.value,
                }}
              />
              <Text variant="caption" color="muted">{s.name}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={{ gap: theme.spacing.sm, flex: 1, minWidth: 280 }}>
        <Text variant="overline" color="muted">Indigo scale</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
          {Object.entries(palette.indigo).map(([k, v]) => (
            <View key={k} style={{ alignItems: "center", gap: 4, width: 56 }}>
              <View style={{ width: 48, height: 32, borderRadius: theme.radius.sm, backgroundColor: v }} />
              <Text variant="caption" color="muted">{k}</Text>
            </View>
          ))}
        </View>
        <Text variant="overline" color="muted" style={{ marginTop: theme.spacing.sm }}>Neutral scale</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
          {Object.entries(palette.neutral).map(([k, v]) => (
            <View key={k} style={{ alignItems: "center", gap: 4, width: 56 }}>
              <View
                style={{
                  width: 48,
                  height: 32,
                  borderRadius: theme.radius.sm,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: v,
                }}
              />
              <Text variant="caption" color="muted">{k}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function TypographyShowcase() {
  const theme = useTheme();
  const names: { name: keyof typeof typography; preview: string }[] = [
    { name: "display", preview: "Display" },
    { name: "h1", preview: "Heading 1" },
    { name: "h2", preview: "Heading 2" },
    { name: "h3", preview: "Heading 3" },
    { name: "body", preview: "Body — the default reading style." },
    { name: "bodyMd", preview: "Body medium — used for emphasis." },
    { name: "bodySm", preview: "Body small — used for descriptions." },
    { name: "label", preview: "Label" },
    { name: "caption", preview: "Caption" },
    { name: "overline", preview: "OVERLINE" },
    { name: "code", preview: "const tokens = useTheme();" },
  ];
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {names.map(({ name, preview }) => (
        <View key={name} style={{ flexDirection: "row", alignItems: "baseline", gap: theme.spacing.lg }}>
          <Text variant="overline" color="muted" style={{ width: 90 }}>{name}</Text>
          {name === "code" ? (
            <Text variant="code">{preview}</Text>
          ) : (
            <Text variant={name as never}>{preview}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

function SpacingShowcase() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {Object.entries(spacing).map(([key, val]) => (
        <View key={key} style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.base }}>
          <Text variant="overline" color="muted" style={{ width: 60 }}>{key}</Text>
          <View
            style={{
              height: 12,
              width: val,
              borderRadius: theme.radius.xs,
              backgroundColor: theme.colors.accent,
            }}
          />
          <Text variant="caption" color="muted">{val}px</Text>
        </View>
      ))}
    </View>
  );
}

function SurfacesShowcase() {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.base }}>
      {(Object.keys(shadows) as Array<keyof typeof shadows>).map((k) => (
        <View
          key={k}
          style={[
            {
              width: 140,
              height: 90,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              alignItems: "center",
              justifyContent: "center",
            },
            shadows[k] as object,
          ]}
        >
          <Text variant="bodySm">shadows.{k}</Text>
        </View>
      ))}
      <View style={{ width: "100%", marginTop: theme.spacing.sm }}>
        <Text variant="overline" color="muted" style={{ marginBottom: theme.spacing.xs }}>Radius</Text>
        <View style={{ flexDirection: "row", gap: theme.spacing.sm, flexWrap: "wrap" }}>
          {Object.entries(radius).map(([k, v]) => (
            <View key={k} style={{ alignItems: "center", gap: 4 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: v,
                  backgroundColor: theme.colors.accentSubtle,
                  borderWidth: 1,
                  borderColor: theme.colors.accentSubtleText,
                }}
              />
              <Text variant="caption" color="muted">{k}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function ButtonsShowcase() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.lg }}>
      <Row label="primary">
        <Button size="sm">Small</Button>
        <Button>Default</Button>
        <Button size="lg">Large</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
      </Row>
      <Row label="secondary">
        <Button variant="secondary">Secondary</Button>
        <Button variant="secondary" disabled>Disabled</Button>
        <Button variant="secondary" loading>Saving…</Button>
      </Row>
      <Row label="ghost / subtle">
        <Button variant="ghost">Ghost</Button>
        <Button variant="subtle">Subtle</Button>
        <Button variant="danger">Danger</Button>
      </Row>
      <Row label="icon">
        <IconButton ariaLabel="Refresh"><Text>↻</Text></IconButton>
        <IconButton ariaLabel="Settings" variant="secondary"><Text>✦</Text></IconButton>
      </Row>
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, flexWrap: "wrap" }}>
      <Text variant="overline" color="muted" style={{ width: 110 }}>{label}</Text>
      {children}
    </View>
  );
}

function FormShowcase() {
  const theme = useTheme();
  const [text, setText] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <View style={{ flexDirection: "row", gap: theme.spacing.lg, flexWrap: "wrap" }}>
      <View style={{ flex: 1, minWidth: 280, gap: theme.spacing.base }}>
        <Field label="Default">
          <Input value={text} onChangeText={setText} placeholder="Placeholder" />
        </Field>
        <Field label="With prefix">
          <Input value={text} onChangeText={setText} placeholder="0.00" leftSlot={<Text color="muted">$</Text>} />
        </Field>
        <Field label="Disabled">
          <Input value="Read-only" editable={false} />
        </Field>
      </View>
      <View style={{ flex: 1, minWidth: 280, gap: theme.spacing.base }}>
        <Field label="Invalid" error="That doesn't look right.">
          <Input value="oops@" />
        </Field>
        <Field label="Textarea" hint="Multiline input">
          <TextArea value={notes} onChangeText={setNotes} placeholder="Add notes…" rows={3} />
        </Field>
      </View>
    </View>
  );
}

function SelectionShowcase() {
  const theme = useTheme();
  const [val, setVal] = useState<number | null>(2);
  const [on, setOn] = useState(true);
  return (
    <View style={{ flexDirection: "row", gap: theme.spacing.lg, flexWrap: "wrap" }}>
      <View style={{ flex: 1, minWidth: 280 }}>
        <Field label="Select" hint="Click to open">
          <Select
            value={val}
            onChange={setVal}
            options={[
              { value: 1, label: "Lo-fi" },
              { value: 2, label: "Standard", description: "Best for most cases" },
              { value: 3, label: "High fidelity" },
            ]}
          />
        </Field>
      </View>
      <View style={{ flex: 1, minWidth: 280, gap: theme.spacing.sm }}>
        <Text variant="bodyMd">Switches</Text>
        <View style={{ flexDirection: "row", gap: theme.spacing.lg }}>
          <Switch value={on} onChange={setOn} ariaLabel="A" />
          <Switch value={!on} onChange={() => setOn((p) => !p)} ariaLabel="B" />
          <Switch value={true} onChange={() => {}} disabled ariaLabel="Disabled" />
        </View>
      </View>
    </View>
  );
}

function BadgesShowcase() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.base }}>
      <View style={{ flexDirection: "row", gap: theme.spacing.sm, flexWrap: "wrap" }}>
        <Badge tone="neutral">Neutral</Badge>
        <Badge tone="accent">Accent</Badge>
        <Badge tone="success">Success</Badge>
        <Badge tone="warning">Warning</Badge>
        <Badge tone="danger">Danger</Badge>
        <Badge tone="info">Info</Badge>
      </View>
      <View style={{ flexDirection: "row", gap: theme.spacing.sm, flexWrap: "wrap" }}>
        <Badge tone="accent" variant="solid">Solid</Badge>
        <Badge tone="warning" variant="outline">Outline</Badge>
        <Badge tone="success" leftDot>With dot</Badge>
      </View>
      <Divider />
      <Text variant="overline" color="muted">Order statuses</Text>
      <View style={{ flexDirection: "row", gap: theme.spacing.sm, flexWrap: "wrap" }}>
        {(["pending", "accepted", "preparing", "ready", "completed", "cancelled"] as const).map((s) => (
          <StatusPill key={s} status={s} />
        ))}
      </View>
    </View>
  );
}

function FeedbackShowcase() {
  const theme = useTheme();
  const toast = useToast();
  return (
    <View style={{ gap: theme.spacing.lg }}>
      <View style={{ flexDirection: "row", gap: theme.spacing.lg, flexWrap: "wrap" }}>
        <View style={{ flex: 1, minWidth: 240 }}>
          <Text variant="overline" color="muted" style={{ marginBottom: theme.spacing.xs }}>Loading</Text>
          <SkeletonStack lines={3} />
          <View style={{ marginTop: theme.spacing.sm }}>
            <Skeleton width={140} height={28} />
          </View>
        </View>
        <View style={{ flex: 1, minWidth: 240 }}>
          <Text variant="overline" color="muted" style={{ marginBottom: theme.spacing.xs }}>Empty</Text>
          <Card>
            <EmptyState
              title="Nothing here yet"
              description="When data arrives, it'll show up in this region."
              action={<Button size="sm">Take action</Button>}
            />
          </Card>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: theme.spacing.sm, flexWrap: "wrap" }}>
        <Button variant="secondary" onPress={() => toast.push({ tone: "success", title: "Order accepted", description: "#1042 moved to preparing." })}>
          Trigger success toast
        </Button>
        <Button variant="secondary" onPress={() => toast.push({ tone: "warning", title: "Heads up", description: "Two items are running low." })}>
          Warning toast
        </Button>
        <Button variant="secondary" onPress={() => toast.push({ tone: "danger", title: "Failed to save", description: "Network error — retry?" })}>
          Error toast
        </Button>
        <Button variant="secondary" onPress={() => toast.push({ tone: "info", title: "FYI", description: "Auto-accept turns on at 6pm." })}>
          Info toast
        </Button>
      </View>
    </View>
  );
}

function TabsShowcase() {
  const theme = useTheme();
  const [val, setVal] = useState("all");
  return (
    <View style={{ gap: theme.spacing.base }}>
      <Tabs
        value={val}
        onChange={setVal}
        items={[
          { value: "all", label: "All", hint: 12 },
          { value: "active", label: "Active", hint: 4 },
          { value: "done", label: "Completed", hint: 8 },
        ]}
      />
      <Tabs
        value={val}
        onChange={setVal}
        variant="underline"
        items={[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "done", label: "Completed" },
        ]}
      />
    </View>
  );
}

function TablesShowcase() {
  return (
    <Table
      rows={[
        { id: 1, item: "Margherita Pizza", price: "$18.00", status: "available" },
        { id: 2, item: "Burrata", price: "$16.00", status: "available" },
        { id: 3, item: "Calamari", price: "$15.00", status: "hidden" },
      ]}
      keyExtractor={(r) => String(r.id)}
      columns={[
        { key: "id", header: "ID", width: 60, render: (r) => <Text variant="bodySm" color="muted">#{r.id}</Text> },
        { key: "item", header: "Item", render: (r) => <Text variant="bodyMd">{r.item}</Text> },
        { key: "price", header: "Price", width: 100, align: "right", render: (r) => <Text>{r.price}</Text> },
        {
          key: "status",
          header: "Status",
          width: 120,
          render: (r) => (
            <Badge tone={r.status === "available" ? "success" : "warning"}>{r.status}</Badge>
          ),
        },
      ]}
    />
  );
}

function OverlayShowcase() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ flexDirection: "row", gap: theme.spacing.sm, alignItems: "center", flexWrap: "wrap" }}>
      <Button variant="secondary" onPress={() => setOpen(true)}>Open modal</Button>
      <Avatar name="Lena Ortiz" size={36} />
      <Avatar name="Marcus Hale" size={36} tone="accent" />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm action"
        description="Sample modal demonstrating header, body, and footer slots."
        footer={
          <>
            <Button variant="ghost" onPress={() => setOpen(false)}>Cancel</Button>
            <Button onPress={() => setOpen(false)}>Confirm</Button>
          </>
        }
      >
        <ScrollView style={{ maxHeight: 200 }}>
          <Text>
            Body content goes here. Headers, descriptions, and footers slot in
            automatically. Tap the backdrop or the close icon to dismiss.
          </Text>
        </ScrollView>
      </Modal>
    </View>
  );
}
