import { useCreateMenuCategory } from "@odyssey/api-client/generated";
import { ApiHttpError } from "@odyssey/api-client";
import { Button, Field, Input, Modal, useToast } from "@odyssey/ui";
import { useEffect, useState } from "react";

export function CategoryFormModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const create = useCreateMenuCategory();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setName("");
      setError(undefined);
    }
  }, [open]);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required.");
      return;
    }
    setError(undefined);
    create.mutate(
      { name: trimmed },
      {
        onSuccess: (cat) => {
          toast.push({ tone: "success", title: `Category "${cat.name}" added` });
          onClose();
        },
        onError: (err) => {
          toast.push({
            tone: "danger",
            title: "Couldn't add category",
            description: err instanceof ApiHttpError ? err.message : "Unknown error",
          });
        },
      }
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New category"
      description="Categories group items on the menu — for example Starters, Mains, or Drinks."
      width={440}
      footer={
        <>
          <Button variant="ghost" onPress={onClose}>Cancel</Button>
          <Button onPress={submit} loading={create.isPending}>Add category</Button>
        </>
      }
    >
      <Field label="Name" required error={error}>
        <Input
          value={name}
          onChangeText={(v) => {
            setName(v);
            if (error) setError(undefined);
          }}
          placeholder="e.g. Cocktails"
          autoFocus
          onSubmitEditing={submit}
        />
      </Field>
    </Modal>
  );
}