import { useHomeStats, useListOrders } from "@odyssey/api-client/generated";
import { formatCents, formatCentsCompact, formatRelative } from "@odyssey/shared";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  Skeleton,
  StatusPill,
  Text,
  useTheme,
} from "@odyssey/ui";
import { View } from "react-native";
import { PageHeader } from "../src/components/PageHeader";
import { AppShell } from "../src/layout/AppShell";

export default function HomeRoute() {
  const theme = useTheme();
  const stats = useHomeStats();
  const recent = useListOrders({ limit: 6 });

  return (
    <AppShell>
      <PageHeader
        title="Service overview"
        subtitle="What's happening at Trattoria Polaris right now."
      />

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: theme.spacing.base,
          marginBottom: theme.spacing.xl,
        }}
      >
        <Kpi
          label="Orders today"
          value={stats.data?.totalOrdersToday}
          hint={stats.data ? `${stats.data.completedOrdersToday} completed` : undefined}
          loading={stats.isLoading}
        />
        <Kpi
          label="Revenue today"
          value={stats.data ? formatCentsCompact(stats.data.revenueTodayCents) : undefined}
          hint={
            stats.data
              ? `${formatCents(stats.data.averageOrderValueCents)} avg order`
              : undefined
          }
          loading={stats.isLoading}
        />
        <Kpi
          label="Pending"
          value={stats.data?.pendingOrders}
          tone={stats.data && stats.data.pendingOrders > 0 ? "warning" : "neutral"}
          hint="Awaiting acceptance"
          loading={stats.isLoading}
        />
        <Kpi
          label="In progress"
          value={stats.data?.inProgressOrders}
          tone="info"
          hint="Accepted, preparing, or ready"
          loading={stats.isLoading}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.base,
          flexWrap: "wrap",
        }}
      >
        <Card style={{ flex: 2, minWidth: 360 }}>
          <CardHeader
            title="Recent orders"
            description="The last six tickets across all statuses."
          />
          {recent.isLoading ? (
            <View style={{ gap: theme.spacing.sm }}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={36} />
              ))}
            </View>
          ) : !recent.data || recent.data.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Once orders start coming in, they'll appear here."
            />
          ) : (
            <View style={{ gap: theme.spacing.sm }}>
              {recent.data.map((order) => (
                <View
                  key={order.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: theme.spacing.sm,
                    borderBottomWidth: 1,
                    borderColor: theme.colors.divider,
                  }}
                >
                  <View style={{ gap: 2 }}>
                    <Text variant="bodyMd">
                      Order #{order.id} · {order.customer.name}
                    </Text>
                    <Text variant="caption" color="muted">
                      {formatRelative(order.placedAt)} · {order.items.length} items
                    </Text>
                  </View>
                  <View
                    style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.base }}
                  >
                    <Text variant="bodyMd">{formatCents(order.totalCents)}</Text>
                    <StatusPill status={order.status} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card style={{ flex: 1, minWidth: 280 }}>
          <CardHeader
            title="Popular items"
            description="Top sellers across the last 30 days."
          />
          {stats.isLoading ? (
            <View style={{ gap: theme.spacing.sm }}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={28} />
              ))}
            </View>
          ) : !stats.data || stats.data.popularItems.length === 0 ? (
            <EmptyState title="No data yet" description="We'll show your bestsellers as soon as orders accumulate." />
          ) : (
            <View style={{ gap: theme.spacing.sm }}>
              {stats.data.popularItems.map((item, idx) => (
                <View
                  key={item.menuItemId}
                  style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
                    <Text variant="caption" color="muted" style={{ width: 16 }}>
                      {idx + 1}.
                    </Text>
                    <Text variant="bodyMd">{item.name}</Text>
                  </View>
                  <Badge tone="neutral">{item.soldCount} sold</Badge>
                </View>
              ))}
            </View>
          )}
        </Card>
      </View>
    </AppShell>
  );
}

function Kpi({
  label,
  value,
  hint,
  tone = "neutral",
  loading,
}: {
  label: string;
  value?: number | string;
  hint?: string;
  tone?: "neutral" | "info" | "warning" | "success";
  loading?: boolean;
}) {
  const theme = useTheme();
  const accentMap = {
    neutral: theme.colors.textPrimary,
    info: theme.colors.infoFg,
    warning: theme.colors.warningFg,
    success: theme.colors.successFg,
  };
  return (
    <Card style={{ flex: 1, minWidth: 200 }}>
      <Text variant="overline" color="muted">{label}</Text>
      <View style={{ marginTop: theme.spacing.xs, gap: theme.spacing.xs }}>
        {loading ? (
          <Skeleton width={120} height={28} />
        ) : (
          <Text variant="display" style={{ fontSize: 30, lineHeight: 36, color: accentMap[tone] }}>
            {value ?? "—"}
          </Text>
        )}
        {hint ? <Text variant="caption" color="muted">{hint}</Text> : null}
      </View>
    </Card>
  );
}
