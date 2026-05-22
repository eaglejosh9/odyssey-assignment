import {
  useCustomerOrders,
  useListCustomers,
  type CustomerWithStats,
} from "@odyssey/api-client/generated";
import { formatCents, formatRelative } from "@odyssey/shared";
import {
  Avatar,
  Card,
  Drawer,
  EmptyState,
  Skeleton,
  StatusPill,
  Table,
  Text,
  useTheme,
} from "@odyssey/ui";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { PageHeader } from "../src/components/PageHeader";
import { AppShell } from "../src/layout/AppShell";

export default function CrmRoute() {
  const theme = useTheme();
  const customers = useListCustomers();
  const [selected, setSelected] = useState<CustomerWithStats | null>(null);

  const sorted = useMemo(() => {
    if (!customers.data) return [];
    return [...customers.data].sort(
      (a, b) => b.lifetimeSpendCents - a.lifetimeSpendCents
    );
  }, [customers.data]);

  return (
    <AppShell>
      <PageHeader
        title="CRM"
        subtitle="Your guest book, ranked by lifetime spend."
      />

      <Card padded={false}>
        <Table
          rows={sorted}
          loading={customers.isLoading}
          keyExtractor={(c) => String(c.id)}
          onRowPress={(c) => setSelected(c)}
          emptyState={
            <EmptyState
              title="No customers yet"
              description="Customers appear here as soon as they place an order."
            />
          }
          columns={[
            {
              key: "name",
              header: "Customer",
              render: (c) => {
                const contact = c.email ?? c.phone;
                return (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
                    <Avatar name={c.name} />
                    <View>
                      <Text variant="bodyMd">{c.name}</Text>
                      {contact ? <Text variant="caption" color="muted">{contact}</Text> : null}
                    </View>
                  </View>
                );
              },
            },
            {
              key: "orders",
              header: "Orders",
              width: 90,
              align: "right",
              render: (c) => <Text variant="bodyMd">{c.orderCount}</Text>,
            },
            {
              key: "spend",
              header: "Lifetime spend",
              width: 150,
              align: "right",
              render: (c) => <Text variant="bodyMd">{formatCents(c.lifetimeSpendCents)}</Text>,
            },
            {
              key: "last",
              header: "Last order",
              width: 140,
              render: (c) => (
                <Text variant="bodySm" color="muted">
                  {c.lastOrderAt ? formatRelative(c.lastOrderAt) : "—"}
                </Text>
              ),
            },
          ]}
        />
      </Card>

      <CustomerDetailDrawer
        customer={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </AppShell>
  );
}

function CustomerDetailDrawer({
  customer,
  open,
  onClose,
}: {
  customer: CustomerWithStats | null;
  open: boolean;
  onClose: () => void;
}) {
  const theme = useTheme();
  const ordersQuery = useCustomerOrders(customer?.id ?? -1);

  if (!customer) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={customer.name}
      description={
        customer.email
          ? `${customer.email}${customer.phone ? " · " + customer.phone : ""}`
          : customer.phone ?? undefined
      }
    >
      <View style={{ gap: theme.spacing.lg }}>
        <View style={{ flexDirection: "row", gap: theme.spacing.base }}>
          <Stat label="Orders" value={String(customer.orderCount)} />
          <Stat label="Lifetime spend" value={formatCents(customer.lifetimeSpendCents)} />
          <Stat
            label="Last order"
            value={customer.lastOrderAt ? formatRelative(customer.lastOrderAt) : "—"}
          />
        </View>

        <View>
          <Text variant="overline" color="muted" style={{ marginBottom: theme.spacing.sm }}>
            Recent orders
          </Text>
          {ordersQuery.isLoading ? (
            <View style={{ gap: theme.spacing.sm }}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={36} />
              ))}
            </View>
          ) : !ordersQuery.data || ordersQuery.data.length === 0 ? (
            <Card>
              <EmptyState title="No orders" description="This customer hasn't placed any orders yet." />
            </Card>
          ) : (
            <View style={{ gap: theme.spacing.sm }}>
              {ordersQuery.data.slice(0, 10).map((order) => (
                <View
                  key={order.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: theme.spacing.sm,
                    borderBottomWidth: 1,
                    borderColor: theme.colors.divider,
                  }}
                >
                  <View>
                    <Text variant="bodyMd">Order #{order.id}</Text>
                    <Text variant="caption" color="muted">
                      {formatRelative(order.placedAt)} · {order.items.length} items
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: theme.spacing.sm, alignItems: "center" }}>
                    <Text variant="bodyMd">{formatCents(order.totalCents)}</Text>
                    <StatusPill status={order.status} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Drawer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <Card padded style={{ flex: 1 }}>
      <Text variant="overline" color="muted">{label}</Text>
      <Text variant="h2" style={{ marginTop: theme.spacing.xs }}>{value}</Text>
    </Card>
  );
}
