import {
  useCreateCustomer,
  useCreateOrder,
  useGetSettings,
  useListCustomers,
  useListMenuCategories,
  useListMenuItems,
  type MenuItem,
} from "@odyssey/api-client/generated";
import { ApiHttpError } from "@odyssey/api-client";
import { formatCents } from "@odyssey/shared";
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  Field,
  IconButton,
  Input,
  Modal,
  Select,
  Skeleton,
  Tabs,
  Text,
  TextArea,
  useTheme,
  useToast,
} from "@odyssey/ui";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

const TAX_RATE_HINT_BPS = 875; // visual preview only; backend recomputes

type Cart = Record<number, number>; // menuItemId -> qty

export function NewOrderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const theme = useTheme();
  const toast = useToast();
  const settings = useGetSettings();
  const customers = useListCustomers();
  const items = useListMenuItems();
  const categories = useListMenuCategories();
  const createOrder = useCreateOrder();
  const createCustomer = useCreateCustomer();

  const [mode, setMode] = useState<"existing" | "walkin">("existing");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInEmail, setWalkInEmail] = useState("");
  const [cart, setCart] = useState<Cart>({});
  const [notes, setNotes] = useState("");

  // Reset state every time the modal opens.
  function resetAll() {
    setMode("existing");
    setCustomerId(null);
    setWalkInName("");
    setWalkInPhone("");
    setWalkInEmail("");
    setCart({});
    setNotes("");
  }

  const availableItems = useMemo(
    () => (items.data ?? []).filter((i) => i.available),
    [items.data]
  );

  const grouped = useMemo(() => {
    if (!categories.data) return [];
    return categories.data.map((c) => ({
      category: c,
      items: availableItems.filter((i) => i.categoryId === c.id),
    }));
  }, [categories.data, availableItems]);

  const lines = Object.entries(cart)
    .map(([id, qty]) => {
      const item = availableItems.find((i) => i.id === Number(id));
      return item ? { item, qty } : null;
    })
    .filter((x): x is { item: MenuItem; qty: number } => x !== null && x.qty > 0);

  const subtotalCents = lines.reduce((acc, l) => acc + l.item.priceCents * l.qty, 0);
  const taxRateBps = settings.data?.taxRateBps ?? TAX_RATE_HINT_BPS;
  const taxCents = Math.round((subtotalCents * taxRateBps) / 10_000);
  const totalCents = subtotalCents + taxCents;

  const acceptingOrders = settings.data?.acceptingOrders ?? true;

  function adjust(itemId: number, delta: number) {
    setCart((prev) => {
      const next = { ...prev };
      const v = (next[itemId] ?? 0) + delta;
      if (v <= 0) delete next[itemId];
      else next[itemId] = Math.min(v, 99);
      return next;
    });
  }

  function close() {
    resetAll();
    onClose();
  }

  async function submit() {
    if (!acceptingOrders) {
      toast.push({
        tone: "warning",
        title: "Not accepting orders",
        description: "Toggle 'Accepting orders' on in Settings to resume.",
      });
      return;
    }
    if (lines.length === 0) {
      toast.push({ tone: "warning", title: "Add at least one item" });
      return;
    }

    let resolvedCustomerId = customerId;

    if (mode === "walkin") {
      const trimmed = walkInName.trim();
      if (!trimmed) {
        toast.push({ tone: "warning", title: "Customer name required" });
        return;
      }
      const emailTrim = walkInEmail.trim();
      if (emailTrim && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
        toast.push({ tone: "warning", title: "Email looks invalid" });
        return;
      }
      try {
        const created = await createCustomer.mutateAsync({
          name: trimmed,
          email: emailTrim || null,
          phone: walkInPhone.trim() || null,
        });
        resolvedCustomerId = created.id;
      } catch (err) {
        toast.push({
          tone: "danger",
          title: "Couldn't create customer",
          description: err instanceof ApiHttpError ? err.message : "Unknown error",
        });
        return;
      }
    }

    if (!resolvedCustomerId) {
      toast.push({ tone: "warning", title: "Pick a customer" });
      return;
    }

    createOrder.mutate(
      {
        customerId: resolvedCustomerId,
        items: lines.map((l) => ({ menuItemId: l.item.id, quantity: l.qty })),
        notes: notes.trim() || null,
      },
      {
        onSuccess: (order) => {
          toast.push({
            tone: "success",
            title: `Order #${order.id} created`,
            description: `${lines.length} items · ${formatCents(order.totalCents)}`,
          });
          close();
        },
        onError: (err) => {
          toast.push({
            tone: "danger",
            title: "Couldn't create order",
            description: err instanceof ApiHttpError ? err.message : "Unknown error",
          });
        },
      }
    );
  }

  const pending = createOrder.isPending || createCustomer.isPending;

  return (
    <Modal
      open={open}
      onClose={close}
      title="New order"
      description="Compose a ticket. Totals and tax are calculated on the server when you submit."
      width={760}
      footer={
        <>
          <Text variant="caption" color="muted" style={{ flex: 1, alignSelf: "center" }}>
            {lines.length === 0
              ? "No items yet"
              : `${lines.length} ${lines.length === 1 ? "item" : "items"} · ${formatCents(totalCents)}`}
          </Text>
          <Button variant="ghost" onPress={close}>Cancel</Button>
          <Button
            onPress={submit}
            loading={pending}
            disabled={lines.length === 0 || !acceptingOrders}
          >
            Place order
          </Button>
        </>
      }
    >
      <View style={{ flexDirection: "row", gap: theme.spacing.lg, flexWrap: "wrap" }}>
        {/* Left: customer + menu */}
        <View style={{ flex: 2, minWidth: 320, gap: theme.spacing.lg }}>
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="overline" color="muted">Customer</Text>
            <Tabs
              value={mode}
              onChange={(m) => setMode(m as "existing" | "walkin")}
              items={[
                { value: "existing", label: "Existing" },
                { value: "walkin", label: "New / walk-in" },
              ]}
            />
            {mode === "existing" ? (
              <Field>
                <Select
                  value={customerId}
                  onChange={setCustomerId}
                  options={(customers.data ?? []).map((c) => ({
                    value: c.id,
                    label: c.name,
                    description: c.phone ?? c.email ?? undefined,
                  }))}
                  placeholder={customers.isLoading ? "Loading…" : "Pick a customer"}
                />
              </Field>
            ) : (
              <View style={{ gap: theme.spacing.sm }}>
                <Field label="Name" required>
                  <Input
                    value={walkInName}
                    onChangeText={setWalkInName}
                    placeholder="e.g. Lena Ortiz"
                  />
                </Field>
                <View style={{ flexDirection: "row", gap: theme.spacing.sm, flexWrap: "wrap" }}>
                  <View style={{ flex: 1, minWidth: 160 }}>
                    <Field label="Email" hint="Optional">
                      <Input
                        value={walkInEmail}
                        onChangeText={setWalkInEmail}
                        placeholder="guest@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </Field>
                  </View>
                  <View style={{ flex: 1, minWidth: 160 }}>
                    <Field label="Phone" hint="Optional">
                      <Input
                        value={walkInPhone}
                        onChangeText={setWalkInPhone}
                        placeholder="(555) 555-0100"
                        keyboardType="phone-pad"
                      />
                    </Field>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="overline" color="muted">Menu</Text>
            {items.isLoading || categories.isLoading ? (
              <View style={{ gap: theme.spacing.sm }}>
                {[0, 1, 2].map((i) => <Skeleton key={i} height={40} />)}
              </View>
            ) : grouped.every((g) => g.items.length === 0) ? (
              <Card>
                <EmptyState
                  title="No available items"
                  description="Add menu items in the Menu tab, or toggle some to available."
                />
              </Card>
            ) : (
              <ScrollView style={{ maxHeight: 320 }} nestedScrollEnabled>
                <View style={{ gap: theme.spacing.base }}>
                  {grouped.map(({ category, items: groupItems }) =>
                    groupItems.length === 0 ? null : (
                      <View key={category.id} style={{ gap: theme.spacing.xs }}>
                        <Text variant="label" color="secondary">{category.name}</Text>
                        <View style={{ gap: 2 }}>
                          {groupItems.map((item) => (
                            <MenuPickRow
                              key={item.id}
                              item={item}
                              qty={cart[item.id] ?? 0}
                              onAdjust={(delta) => adjust(item.id, delta)}
                            />
                          ))}
                        </View>
                      </View>
                    )
                  )}
                </View>
              </ScrollView>
            )}
          </View>

          <Field label="Notes" hint="Special requests, allergies, etc.">
            <TextArea value={notes} onChangeText={setNotes} rows={2} />
          </Field>
        </View>

        {/* Right: summary */}
        <View style={{ flex: 1, minWidth: 240 }}>
          <Card>
            <Text variant="overline" color="muted">Summary</Text>
            <View style={{ marginTop: theme.spacing.sm, gap: theme.spacing.xs }}>
              {lines.length === 0 ? (
                <Text variant="caption" color="muted">
                  Pick items from the menu to build the order.
                </Text>
              ) : (
                <>
                  {lines.map(({ item, qty }) => (
                    <View
                      key={item.id}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: theme.spacing.sm,
                      }}
                    >
                      <View style={{ flexDirection: "row", flex: 1, alignItems: "center", gap: theme.spacing.xs }}>
                        <Text variant="caption" color="muted">×{qty}</Text>
                        <Text variant="bodySm" numberOfLines={1}>{item.name}</Text>
                      </View>
                      <Text variant="bodySm">{formatCents(item.priceCents * qty)}</Text>
                    </View>
                  ))}
                  <Divider style={{ marginVertical: theme.spacing.xs }} />
                  <SummaryLine label="Subtotal" value={formatCents(subtotalCents)} />
                  <SummaryLine label={`Tax (${(taxRateBps / 100).toFixed(2)}%)`} value={formatCents(taxCents)} />
                  <SummaryLine label="Total" value={formatCents(totalCents)} strong />
                </>
              )}
            </View>
            {!acceptingOrders ? (
              <View style={{ marginTop: theme.spacing.base }}>
                <Badge tone="warning">Service paused</Badge>
              </View>
            ) : null}
          </Card>
        </View>
      </View>
    </Modal>
  );
}

function MenuPickRow({
  item,
  qty,
  onAdjust,
}: {
  item: MenuItem;
  qty: number;
  onAdjust: (delta: number) => void;
}) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onPress={() => onAdjust(1)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.radius.md,
        backgroundColor: hovered || qty > 0 ? theme.colors.surfaceMuted : "transparent",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text variant="bodyMd">{item.name}</Text>
        {item.description ? (
          <Text variant="caption" color="muted" numberOfLines={1}>{item.description}</Text>
        ) : null}
      </View>
      <Text variant="bodyMd" color="secondary" style={{ minWidth: 60, textAlign: "right" }}>
        {formatCents(item.priceCents)}
      </Text>
      {qty === 0 ? (
        <Button size="sm" variant="secondary" onPress={() => onAdjust(1)}>
          Add
        </Button>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}>
          <IconButton
            ariaLabel="Decrease"
            size="sm"
            variant="secondary"
            onPress={() => onAdjust(-1)}
          >
            <Text>−</Text>
          </IconButton>
          <Text variant="bodyMd" style={{ minWidth: 18, textAlign: "center" }}>{qty}</Text>
          <IconButton
            ariaLabel="Increase"
            size="sm"
            variant="secondary"
            onPress={() => onAdjust(1)}
          >
            <Text>＋</Text>
          </IconButton>
        </View>
      )}
    </Pressable>
  );
}

function SummaryLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text variant={strong ? "bodyMd" : "bodySm"} color={strong ? "primary" : "secondary"}>
        {label}
      </Text>
      <Text variant={strong ? "bodyMd" : "bodySm"} weight={strong ? "700" : "500"}>
        {value}
      </Text>
    </View>
  );
}