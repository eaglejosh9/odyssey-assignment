import {
  useListOrders,
  type OrderStatus,
  type OrderWithItems,
} from "@odyssey/api-client/generated";
import { formatCents, formatRelative } from "@odyssey/shared";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  StatusPill,
  Table,
  Tabs,
  Text,
  useTheme,
} from "@odyssey/ui";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { PageHeader } from "../src/components/PageHeader";
import { NewOrderModal } from "../src/features/orders/NewOrderModal";
import { OrderDetailDrawer } from "../src/features/orders/OrderDetailDrawer";
import { AppShell } from "../src/layout/AppShell";

type Bucket = "active" | "pending" | "preparing" | "ready" | "completed" | "all";

const BUCKETS: { value: Bucket; label: string; statuses: OrderStatus[] | null }[] = [
  { value: "active", label: "Active", statuses: ["pending", "accepted", "preparing", "ready"] },
  { value: "pending", label: "Pending", statuses: ["pending"] },
  { value: "preparing", label: "Preparing", statuses: ["accepted", "preparing"] },
  { value: "ready", label: "Ready", statuses: ["ready"] },
  { value: "completed", label: "Completed", statuses: ["completed"] },
  { value: "all", label: "All", statuses: null },
];

export default function OrdersRoute() {
  const theme = useTheme();
  const [bucket, setBucket] = useState<Bucket>("active");
  const [selected, setSelected] = useState<OrderWithItems | null>(null);
  const [composing, setComposing] = useState(false);

  // Pull all orders once and slice client-side for tab counts. For larger
  // volumes we'd refetch per filter; at this scale a single fetch is faster.
  const list = useListOrders({ limit: 200 });
  const filtered = useMemo(() => {
    if (!list.data) return [];
    const b = BUCKETS.find((x) => x.value === bucket)!;
    if (!b.statuses) return list.data;
    const set = new Set(b.statuses);
    return list.data.filter((o) => set.has(o.status));
  }, [bucket, list.data]);

  const counts = useMemo(() => {
    if (!list.data) return {} as Record<Bucket, number>;
    const out: Record<string, number> = {};
    for (const b of BUCKETS) {
      out[b.value] = b.statuses === null
        ? list.data.length
        : list.data.filter((o) => b.statuses!.includes(o.status)).length;
    }
    return out as Record<Bucket, number>;
  }, [list.data]);

  return (
    <AppShell>
      <PageHeader
        title="Orders"
        subtitle="Inbound tickets, in-progress prep, and completed orders."
        right={
          <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
            <Badge tone="accent" variant="soft">
              {filtered.length} {filtered.length === 1 ? "order" : "orders"}
            </Badge>
            <Button onPress={() => setComposing(true)} leftSlot={<Text color="onAccent">＋</Text>}>
              New order
            </Button>
          </View>
        }
      />

      <Tabs
        value={bucket}
        onChange={setBucket}
        items={BUCKETS.map((b) => ({
          value: b.value,
          label: b.label,
          hint: counts[b.value] ?? 0,
        }))}
        style={{ marginBottom: theme.spacing.base }}
      />

      <Card padded={false}>
        <Table
          rows={filtered}
          loading={list.isLoading}
          keyExtractor={(o) => String(o.id)}
          onRowPress={(o) => setSelected(o)}
          emptyState={
            <EmptyState
              title="No orders in this bucket"
              description="Try a different filter, or wait — new orders will appear here in real time."
            />
          }
          columns={[
            {
              key: "id",
              header: "Order",
              width: 90,
              render: (o) => <Text variant="bodyMd">#{o.id}</Text>,
            },
            {
              key: "customer",
              header: "Customer",
              render: (o) => (
                <View>
                  <Text variant="bodyMd">{o.customer.name}</Text>
                  {o.customer.phone ? (
                    <Text variant="caption" color="muted">{o.customer.phone}</Text>
                  ) : null}
                </View>
              ),
            },
            {
              key: "items",
              header: "Items",
              width: 100,
              render: (o) => (
                <Text variant="bodySm" color="secondary">
                  {o.items.reduce((sum, i) => sum + i.quantity, 0)}
                </Text>
              ),
            },
            {
              key: "placed",
              header: "Placed",
              width: 120,
              render: (o) => (
                <Text variant="bodySm" color="secondary">{formatRelative(o.placedAt)}</Text>
              ),
            },
            {
              key: "total",
              header: "Total",
              width: 110,
              align: "right",
              render: (o) => <Text variant="bodyMd">{formatCents(o.totalCents)}</Text>,
            },
            {
              key: "status",
              header: "Status",
              width: 130,
              render: (o) => <StatusPill status={o.status} />,
            },
          ]}
        />
      </Card>

      <OrderDetailDrawer
        order={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />

      <NewOrderModal open={composing} onClose={() => setComposing(false)} />
    </AppShell>
  );
}
