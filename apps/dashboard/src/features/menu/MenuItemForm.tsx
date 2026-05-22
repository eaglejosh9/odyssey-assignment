import {
  useCreateMenuItem,
  useListMenuCategories,
  useUpdateMenuItem,
  type MenuItem,
} from "@odyssey/api-client/generated";
import { ApiHttpError } from "@odyssey/api-client";
import { Button, Field, Input, Modal, Select, Switch, TextArea, Text, useToast, useTheme } from "@odyssey/ui";
import { useEffect, useState } from "react";
import { View } from "react-native";

type FormState = {
  name: string;
  description: string;
  priceDollars: string;
  categoryId: number | null;
  available: boolean;
};

const EMPTY: FormState = {
  name: "",
  description: "",
  priceDollars: "",
  categoryId: null,
  available: true,
};

function fromItem(item: MenuItem): FormState {
  return {
    name: item.name,
    description: item.description ?? "",
    priceDollars: (item.priceCents / 100).toFixed(2),
    categoryId: item.categoryId,
    available: item.available,
  };
}

export function MenuItemFormModal({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item?: MenuItem;
}) {
  const theme = useTheme();
  const toast = useToast();
  const create = useCreateMenuItem();
  const update = useUpdateMenuItem();
  const categories = useListMenuCategories();
  const [form, setForm] = useState<FormState>(item ? fromItem(item) : EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    setForm(item ? fromItem(item) : EMPTY);
    setErrors({});
  }, [item, open]);

  const pending = create.isPending || update.isPending;

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Name is required.";
    const priceNum = Number(form.priceDollars);
    if (!form.priceDollars || Number.isNaN(priceNum) || priceNum < 0) {
      next.priceDollars = "Enter a valid non-negative price.";
    }
    if (form.categoryId === null) next.categoryId = "Choose a category.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit() {
    if (!validate()) return;
    const priceCents = Math.round(Number(form.priceDollars) * 100);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      priceCents,
      categoryId: form.categoryId!,
      available: form.available,
    };

    if (item) {
      update.mutate(
        { id: item.id, data: payload },
        {
          onSuccess: () => {
            toast.push({ tone: "success", title: "Menu item updated" });
            onClose();
          },
          onError: (err) =>
            toast.push({
              tone: "danger",
              title: "Update failed",
              description: err instanceof ApiHttpError ? err.message : "Unknown error",
            }),
        }
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast.push({ tone: "success", title: "Menu item added" });
          onClose();
        },
        onError: (err) =>
          toast.push({
            tone: "danger",
            title: "Couldn't add item",
            description: err instanceof ApiHttpError ? err.message : "Unknown error",
          }),
      });
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? `Edit ${item.name}` : "Add menu item"}
      description={item ? "Changes apply to future orders. Existing orders keep their original snapshot." : undefined}
      footer={
        <>
          <Button variant="ghost" onPress={onClose}>Cancel</Button>
          <Button onPress={submit} loading={pending}>
            {item ? "Save changes" : "Add item"}
          </Button>
        </>
      }
    >
      <View style={{ gap: theme.spacing.base }}>
        <Field label="Name" required error={errors.name}>
          <Input value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="e.g. Margherita Pizza" />
        </Field>

        <View style={{ flexDirection: "row", gap: theme.spacing.base }}>
          <View style={{ flex: 1 }}>
            <Field label="Price" required error={errors.priceDollars} hint="In dollars (e.g. 18.50)">
              <Input
                value={form.priceDollars}
                onChangeText={(v) => setForm((p) => ({ ...p, priceDollars: v }))}
                placeholder="0.00"
                keyboardType="decimal-pad"
                leftSlot={<Text color="muted">$</Text>}
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Category" required error={errors.categoryId}>
              <Select
                value={form.categoryId}
                onChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}
                options={(categories.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
                placeholder={categories.isLoading ? "Loading…" : "Select category"}
              />
            </Field>
          </View>
        </View>

        <Field label="Description" hint="Optional. Shown to customers when ordering.">
          <TextArea
            value={form.description}
            onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
            rows={3}
            placeholder="A short, tempting description."
          />
        </Field>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: theme.spacing.xs,
          }}
        >
          <View style={{ gap: 2 }}>
            <Text variant="bodyMd">Available now</Text>
            <Text variant="caption" color="muted">
              Unavailable items can't be added to new orders.
            </Text>
          </View>
          <Switch
            value={form.available}
            onChange={(v) => setForm((p) => ({ ...p, available: v }))}
            ariaLabel="Toggle availability"
          />
        </View>
      </View>
    </Modal>
  );
}
