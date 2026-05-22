import {
  useDeleteMenuItem,
  useListMenuCategories,
  useListMenuItems,
  useUpdateMenuItem,
  type MenuItem,
} from "@odyssey/api-client/generated";
import { ApiHttpError } from "@odyssey/api-client";
import { formatCents } from "@odyssey/shared";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Skeleton,
  Switch,
  Text,
  useTheme,
  useToast,
} from "@odyssey/ui";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { PageHeader } from "../src/components/PageHeader";
import { MenuItemFormModal } from "../src/features/menu/MenuItemForm";
import { AppShell } from "../src/layout/AppShell";

export default function MenuRoute() {
  const theme = useTheme();
  const items = useListMenuItems();
  const categories = useListMenuCategories();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);

  const grouped = useMemo(() => {
    if (!items.data || !categories.data) return [];
    const q = query.trim().toLowerCase();
    const groups = categories.data.map((c) => ({
      category: c,
      items: items.data
        .filter((i) => i.categoryId === c.id)
        .filter((i) => !q || i.name.toLowerCase().includes(q) || (i.description ?? "").toLowerCase().includes(q)),
    }));
    return groups;
  }, [items.data, categories.data, query]);

  const counts = useMemo(() => {
    if (!items.data) return { total: 0, available: 0 };
    return {
      total: items.data.length,
      available: items.data.filter((i) => i.available).length,
    };
  }, [items.data]);

  return (
    <AppShell>
      <PageHeader
        title="Menu"
        subtitle="Manage what's available to order. Disabled items disappear from new orders immediately."
        right={
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <Badge tone="neutral">
              {counts.available}/{counts.total} available
            </Badge>
            <Button onPress={() => setCreating(true)} leftSlot={<Text color="onAccent">＋</Text>}>
              Add item
            </Button>
          </View>
        }
      />

      <View style={{ marginBottom: theme.spacing.lg, maxWidth: 360 }}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search menu items…"
        />
      </View>

      {items.isLoading || categories.isLoading ? (
        <View style={{ gap: theme.spacing.lg }}>
          {[0, 1].map((i) => (
            <Card key={i}>
              <Skeleton width={120} height={20} />
              <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.base }}>
                {[0, 1, 2].map((j) => (
                  <Skeleton key={j} height={48} />
                ))}
              </View>
            </Card>
          ))}
        </View>
      ) : grouped.length === 0 || grouped.every((g) => g.items.length === 0) ? (
        <Card>
          <EmptyState
            title="No menu items"
            description="Add your first item to start taking orders."
            action={<Button onPress={() => setCreating(true)}>Add item</Button>}
          />
        </Card>
      ) : (
        <View style={{ gap: theme.spacing.lg }}>
          {grouped.map(({ category, items: groupItems }) =>
            groupItems.length === 0 ? null : (
              <Card key={category.id}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: theme.spacing.base,
                  }}
                >
                  <Text variant="h3">{category.name}</Text>
                  <Badge tone="neutral">{groupItems.length}</Badge>
                </View>
                <View style={{ gap: theme.spacing.sm }}>
                  {groupItems.map((item) => (
                    <MenuItemRow key={item.id} item={item} onEdit={() => setEditing(item)} />
                  ))}
                </View>
              </Card>
            )
          )}
        </View>
      )}

      <MenuItemFormModal open={creating} onClose={() => setCreating(false)} />
      <MenuItemFormModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        item={editing ?? undefined}
      />
    </AppShell>
  );
}

function MenuItemRow({ item, onEdit }: { item: MenuItem; onEdit: () => void }) {
  const theme = useTheme();
  const toast = useToast();
  const update = useUpdateMenuItem();
  const remove = useDeleteMenuItem();
  const [hovered, setHovered] = useState(false);

  function toggleAvailability() {
    update.mutate(
      { id: item.id, data: { available: !item.available } },
      {
        onSuccess: () => {
          toast.push({
            tone: !item.available ? "success" : "warning",
            title: `${item.name} ${!item.available ? "available" : "hidden"}`,
          });
        },
        onError: (err) =>
          toast.push({
            tone: "danger",
            title: "Couldn't update item",
            description: err instanceof ApiHttpError ? err.message : "Unknown error",
          }),
      }
    );
  }

  return (
    <Pressable
      onPress={onEdit}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.base,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.radius.md,
        backgroundColor: hovered ? theme.colors.surfaceMuted : "transparent",
      }}
    >
      <View style={{ flex: 1, gap: 2, opacity: item.available ? 1 : 0.55 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
          <Text variant="bodyMd">{item.name}</Text>
          {!item.available ? <Badge tone="warning">Hidden</Badge> : null}
        </View>
        {item.description ? (
          <Text variant="caption" color="muted" numberOfLines={1}>{item.description}</Text>
        ) : null}
      </View>
      <Text variant="bodyMd" style={{ minWidth: 80, textAlign: "right" }}>
        {formatCents(item.priceCents)}
      </Text>
      <View style={{ marginLeft: theme.spacing.sm }}>
        <Switch
          value={item.available}
          onChange={toggleAvailability}
          ariaLabel={`Toggle availability for ${item.name}`}
        />
      </View>
    </Pressable>
  );
}
