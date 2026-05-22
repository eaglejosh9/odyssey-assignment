/**
 * Wrappers over Orval's generated menu client. See orders.ts for the pattern.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { ApiHttpError, OrvalResponse } from "../mutator";
import {
  deleteMenuItemsId,
  getMenuCategories,
  getMenuItems,
  patchMenuItemsId,
  postMenuCategories,
  postMenuItems,
} from "./menu/menu";
import type {
  MenuCategory,
  MenuCategoryInput,
  MenuItem,
  MenuItemInput,
  MenuItemUpdate,
} from "./schemas/index";

export const menuKeys = {
  all: ["menu"] as const,
  categories: () => [...menuKeys.all, "categories"] as const,
  items: () => [...menuKeys.all, "items"] as const,
};

type QueryOpts<T> = { query?: Partial<UseQueryOptions<T, ApiHttpError>> };
type MutationOpts<TData, TVars> = {
  mutation?: Partial<UseMutationOptions<TData, ApiHttpError, TVars>>;
};

async function unwrap<T>(p: Promise<unknown>): Promise<T> {
  return ((await p) as OrvalResponse<T>).data;
}

export function useListMenuCategories(options?: QueryOpts<MenuCategory[]>) {
  return useQuery<MenuCategory[], ApiHttpError>({
    queryKey: menuKeys.categories(),
    queryFn: ({ signal }) => unwrap<MenuCategory[]>(getMenuCategories({ signal })),
    ...options?.query,
  });
}

export function useListMenuItems(options?: QueryOpts<MenuItem[]>) {
  return useQuery<MenuItem[], ApiHttpError>({
    queryKey: menuKeys.items(),
    queryFn: ({ signal }) => unwrap<MenuItem[]>(getMenuItems({ signal })),
    ...options?.query,
  });
}

export function useCreateMenuCategory(
  options?: MutationOpts<MenuCategory, MenuCategoryInput>
) {
  const qc = useQueryClient();
  return useMutation<MenuCategory, ApiHttpError, MenuCategoryInput>({
    mutationFn: (data) => unwrap<MenuCategory>(postMenuCategories(data)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: menuKeys.categories() });
    },
    ...options?.mutation,
  });
}

export function useCreateMenuItem(options?: MutationOpts<MenuItem, MenuItemInput>) {
  const qc = useQueryClient();
  return useMutation<MenuItem, ApiHttpError, MenuItemInput>({
    mutationFn: (data) => unwrap<MenuItem>(postMenuItems(data)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: menuKeys.items() });
    },
    ...options?.mutation,
  });
}

export function useUpdateMenuItem(
  options?: MutationOpts<MenuItem, { id: number; data: MenuItemUpdate }>
) {
  const qc = useQueryClient();
  return useMutation<MenuItem, ApiHttpError, { id: number; data: MenuItemUpdate }>({
    mutationFn: ({ id, data }) => unwrap<MenuItem>(patchMenuItemsId(id, data)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: menuKeys.items() });
    },
    ...options?.mutation,
  });
}

export function useDeleteMenuItem(options?: MutationOpts<void, number>) {
  const qc = useQueryClient();
  return useMutation<void, ApiHttpError, number>({
    mutationFn: async (id) => {
      await deleteMenuItemsId(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: menuKeys.items() });
    },
    ...options?.mutation,
  });
}

export {
  getMenuCategories,
  getMenuItems,
  postMenuCategories,
  postMenuItems,
  patchMenuItemsId,
  deleteMenuItemsId,
};