import { useUpdateOrderStatus, type OrderWithItems } from "@odyssey/api-client/generated";
import { ApiHttpError } from "@odyssey/api-client";
import { formatCents, formatRelative, formatTimeOfDay } from "@odyssey/shared";
import {
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  StatusPill,
  Text,
  useTheme,
  useToast,
} from "@odyssey/ui";
import { View } from "react-native";
import { actionLabel, actionTone, nextActions } from "./transitions";

export function OrderDetailDrawer({
  order,
  open,
  onClose,
}: {
  order: OrderWithItems | null;
  open: boolean;
  onClose: () => void;
}) {
  const theme = useTheme();
  const toast = useToast();
  const updateStatus = useUpdateOrderStatus();

  if (!order) return null;
  const actions = nextActions(order.status);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Order #${order.id}`}
      description={`Placed ${formatRelative(order.placedAt)} at ${formatTimeOfDay(order.placedAt)}`}
      footer={
        actions.length > 0 ? (
          <>
            {actions.map((action) => (
              <Button
                key={action}
                variant={actionTone(action) === "danger" ? "secondary" : actionTone(action)}
                onPress={() => {
                  updateStatus.mutate(
                    { id: order.id, data: { status: action } },
                    {
                      onSuccess: () => {
                        toast.push({
                          tone: action === "cancelled" ? "warning" : "success",
                          title: `Order #${order.id} ${action}`,
                        });
                      },
                      onError: (err) => {
                        toast.push({
                          tone: "danger",
                          title: "Couldn't update order",
                          description:
                            err instanceof ApiHttpError ? err.message : "Unknown error",
                        });
                      },
                    }
                  );
                }}
                loading={updateStatus.isPending && updateStatus.variables?.data.status === action}
              >
                {actionLabel(action)}
              </Button>
            ))}
          </>
        ) : (
          <Text variant="caption" color="muted">No further actions for this order.</Text>
        )
      }
    >
      <View style={{ gap: theme.spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
          <StatusPill status={order.status} size="md" />
          {order.notes ? <Badge tone="neutral">Has note</Badge> : null}
        </View>

        <Card padded>
          <Text variant="overline" color="muted">Customer</Text>
          <View style={{ marginTop: theme.spacing.xs, gap: 2 }}>
            <Text variant="bodyMd">{order.customer.name}</Text>
            {order.customer.email ? (
              <Text variant="caption" color="muted">{order.customer.email}</Text>
            ) : null}
            {order.customer.phone ? (
              <Text variant="caption" color="muted">{order.customer.phone}</Text>
            ) : null}
          </View>
        </Card>

        <Card padded>
          <Text variant="overline" color="muted">Items</Text>
          <View style={{ marginTop: theme.spacing.sm, gap: theme.spacing.sm }}>
            {order.items.map((item) => (
              <View
                key={item.id}
                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
                  <Text variant="bodyMd" color="muted" style={{ width: 28 }}>
                    ×{item.quantity}
                  </Text>
                  <Text variant="bodyMd">{item.nameSnapshot}</Text>
                </View>
                <Text variant="bodyMd">{formatCents(item.priceSnapshotCents * item.quantity)}</Text>
              </View>
            ))}
          </View>

          <Divider style={{ marginVertical: theme.spacing.base }} />

          <SummaryRow label="Subtotal" value={formatCents(order.subtotalCents)} />
          <SummaryRow label="Tax" value={formatCents(order.taxCents)} />
          <SummaryRow label="Total" value={formatCents(order.totalCents)} strong />
        </Card>

        {order.notes ? (
          <Card padded>
            <Text variant="overline" color="muted">Notes</Text>
            <Text variant="bodyMd" style={{ marginTop: theme.spacing.xs }}>
              {order.notes}
            </Text>
          </Card>
        ) : null}
      </View>
    </Drawer>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
      }}
    >
      <Text variant={strong ? "bodyMd" : "body"} color={strong ? "primary" : "secondary"}>
        {label}
      </Text>
      <Text variant={strong ? "bodyMd" : "body"} weight={strong ? "700" : "500"} style={{ color: theme.colors.textPrimary }}>
        {value}
      </Text>
    </View>
  );
}
