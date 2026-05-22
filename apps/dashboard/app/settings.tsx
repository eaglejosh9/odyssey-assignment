import {
  useGetSettings,
  useUpdateSettings,
  type BusinessSettings,
  type OpeningHours,
  type OpeningHoursDay,
} from "@odyssey/api-client/generated";
import { ApiHttpError } from "@odyssey/api-client";
import {
  Button,
  Card,
  CardHeader,
  Divider,
  Field,
  Input,
  Skeleton,
  Switch,
  Text,
  useTheme,
  useToast,
} from "@odyssey/ui";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { PageHeader } from "../src/components/PageHeader";
import { AppShell } from "../src/layout/AppShell";

const DAYS: { key: keyof OpeningHours; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

type Draft = {
  prepTimeMinutes: string;
  autoAccept: boolean;
  acceptingOrders: boolean;
  taxRatePercent: string;
  openingHours: OpeningHours;
};

function fromSettings(s: BusinessSettings): Draft {
  return {
    prepTimeMinutes: String(s.prepTimeMinutes),
    autoAccept: s.autoAccept,
    acceptingOrders: s.acceptingOrders,
    taxRatePercent: (s.taxRateBps / 100).toFixed(2),
    openingHours: s.openingHours,
  };
}

export default function SettingsRoute() {
  const theme = useTheme();
  const toast = useToast();
  const settings = useGetSettings();
  const update = useUpdateSettings();
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    if (settings.data && !draft) {
      setDraft(fromSettings(settings.data));
    }
  }, [settings.data, draft]);

  const dirty = useMemo(() => {
    if (!settings.data || !draft) return false;
    const original = fromSettings(settings.data);
    return JSON.stringify(original) !== JSON.stringify(draft);
  }, [settings.data, draft]);

  function save() {
    if (!draft) return;
    const prep = Number(draft.prepTimeMinutes);
    const taxPct = Number(draft.taxRatePercent);
    if (Number.isNaN(prep) || prep < 0) {
      toast.push({ tone: "danger", title: "Prep time must be a number ≥ 0" });
      return;
    }
    if (Number.isNaN(taxPct) || taxPct < 0) {
      toast.push({ tone: "danger", title: "Tax rate must be a percentage ≥ 0" });
      return;
    }
    update.mutate(
      {
        prepTimeMinutes: prep,
        autoAccept: draft.autoAccept,
        acceptingOrders: draft.acceptingOrders,
        taxRateBps: Math.round(taxPct * 100),
        openingHours: draft.openingHours,
      },
      {
        onSuccess: () => toast.push({ tone: "success", title: "Settings saved" }),
        onError: (err) =>
          toast.push({
            tone: "danger",
            title: "Couldn't save settings",
            description: err instanceof ApiHttpError ? err.message : "Unknown error",
          }),
      }
    );
  }

  function discard() {
    if (settings.data) setDraft(fromSettings(settings.data));
  }

  return (
    <AppShell>
      <PageHeader
        title="Settings"
        subtitle="Service hours, ordering rules, and back-of-house preferences."
        right={
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <Button variant="ghost" onPress={discard} disabled={!dirty}>Discard</Button>
            <Button onPress={save} loading={update.isPending} disabled={!dirty}>
              Save changes
            </Button>
          </View>
        }
      />

      {settings.isLoading || !draft ? (
        <View style={{ gap: theme.spacing.lg }}>
          {[0, 1].map((i) => (
            <Card key={i}>
              <Skeleton width={200} height={20} />
              <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.base }}>
                {[0, 1, 2].map((j) => <Skeleton key={j} height={36} />)}
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <View style={{ gap: theme.spacing.lg }}>
          <Card>
            <CardHeader
              title="Service availability"
              description="Pause ordering during a rush, or auto-accept tickets as they arrive."
            />
            <SettingRow
              title="Accepting orders"
              description="Turn off to immediately stop accepting new orders site-wide."
              control={
                <Switch
                  value={draft.acceptingOrders}
                  onChange={(v) => setDraft((p) => ({ ...p!, acceptingOrders: v }))}
                  ariaLabel="Accepting orders"
                />
              }
            />
            <Divider />
            <SettingRow
              title="Auto-accept new orders"
              description="Skip the pending review step and move new orders straight to accepted."
              control={
                <Switch
                  value={draft.autoAccept}
                  onChange={(v) => setDraft((p) => ({ ...p!, autoAccept: v }))}
                  ariaLabel="Auto-accept"
                />
              }
            />
          </Card>

          <Card>
            <CardHeader title="Operations" description="The numbers that drive the host stand and POS." />
            <View style={{ flexDirection: "row", gap: theme.spacing.base, flexWrap: "wrap" }}>
              <View style={{ flex: 1, minWidth: 240 }}>
                <Field label="Average prep time" hint="In minutes. Shown to customers as an ETA.">
                  <Input
                    value={draft.prepTimeMinutes}
                    onChangeText={(v) => setDraft((p) => ({ ...p!, prepTimeMinutes: v }))}
                    keyboardType="number-pad"
                    rightSlot={<Text color="muted">min</Text>}
                  />
                </Field>
              </View>
              <View style={{ flex: 1, minWidth: 240 }}>
                <Field label="Sales tax rate" hint="Applied server-side at order create time.">
                  <Input
                    value={draft.taxRatePercent}
                    onChangeText={(v) => setDraft((p) => ({ ...p!, taxRatePercent: v }))}
                    keyboardType="decimal-pad"
                    rightSlot={<Text color="muted">%</Text>}
                  />
                </Field>
              </View>
            </View>
          </Card>

          <Card>
            <CardHeader title="Opening hours" description="Times the restaurant is staffed for service." />
            <View style={{ gap: theme.spacing.sm }}>
              {DAYS.map(({ key, label }) => (
                <OpeningRow
                  key={key}
                  label={label}
                  value={draft.openingHours[key]}
                  onChange={(next) =>
                    setDraft((p) => ({
                      ...p!,
                      openingHours: { ...p!.openingHours, [key]: next },
                    }))
                  }
                />
              ))}
            </View>
          </Card>
        </View>
      )}
    </AppShell>
  );
}

function SettingRow({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.base,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyMd">{title}</Text>
        <Text variant="caption" color="muted">{description}</Text>
      </View>
      {control}
    </View>
  );
}

function OpeningRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: OpeningHoursDay;
  onChange: (next: OpeningHoursDay) => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.base,
      }}
    >
      <Text variant="bodyMd" style={{ width: 100 }}>{label}</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
          flex: 1,
          opacity: value.closed ? 0.5 : 1,
        }}
      >
        <Input
          value={value.open}
          onChangeText={(v) => onChange({ ...value, open: v })}
          fullWidth={false}
          style={{ width: 110 }}
          editable={!value.closed}
        />
        <Text color="muted">–</Text>
        <Input
          value={value.close}
          onChangeText={(v) => onChange({ ...value, close: v })}
          fullWidth={false}
          style={{ width: 110 }}
          editable={!value.closed}
        />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
        <Text variant="caption" color="muted">
          {value.closed ? "Closed" : "Open"}
        </Text>
        <Switch
          value={!value.closed}
          onChange={(v) => onChange({ ...value, closed: !v })}
          ariaLabel={`Toggle ${label} open`}
        />
      </View>
    </View>
  );
}
