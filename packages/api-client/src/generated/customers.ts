/**
 * Wrappers over Orval's generated customers client. See orders.ts for the pattern.
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
  getCustomers,
  getCustomersId,
  getCustomersIdOrders,
  postCustomers,
} from "./customers/customers";
import type {
  Customer,
  CustomerInput,
  CustomerWithStats,
  OrderWithItems,
} from "./schemas/index";

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  detail: (id: number) => [...customerKeys.all, "detail", id] as const,
  orders: (id: number) => [...customerKeys.all, "orders", id] as const,
};

type QueryOpts<T> = { query?: Partial<UseQueryOptions<T, ApiHttpError>> };
type MutationOpts<TData, TVars> = {
  mutation?: Partial<UseMutationOptions<TData, ApiHttpError, TVars>>;
};

async function unwrap<T>(p: Promise<unknown>): Promise<T> {
  return ((await p) as OrvalResponse<T>).data;
}

export function useListCustomers(options?: QueryOpts<CustomerWithStats[]>) {
  return useQuery<CustomerWithStats[], ApiHttpError>({
    queryKey: customerKeys.lists(),
    queryFn: ({ signal }) => unwrap<CustomerWithStats[]>(getCustomers({ signal })),
    ...options?.query,
  });
}

export function useGetCustomer(id: number, options?: QueryOpts<CustomerWithStats>) {
  return useQuery<CustomerWithStats, ApiHttpError>({
    queryKey: customerKeys.detail(id),
    queryFn: ({ signal }) => unwrap<CustomerWithStats>(getCustomersId(id, { signal })),
    enabled: Number.isFinite(id) && id > 0,
    ...options?.query,
  });
}

export function useCustomerOrders(id: number, options?: QueryOpts<OrderWithItems[]>) {
  return useQuery<OrderWithItems[], ApiHttpError>({
    queryKey: customerKeys.orders(id),
    queryFn: ({ signal }) =>
      unwrap<OrderWithItems[]>(getCustomersIdOrders(id, { signal })),
    enabled: Number.isFinite(id) && id > 0,
    ...options?.query,
  });
}

export function useCreateCustomer(options?: MutationOpts<Customer, CustomerInput>) {
  const qc = useQueryClient();
  return useMutation<Customer, ApiHttpError, CustomerInput>({
    mutationFn: (data) => unwrap<Customer>(postCustomers(data)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: customerKeys.lists() });
    },
    ...options?.mutation,
  });
}

export { getCustomers, getCustomersId, getCustomersIdOrders, postCustomers };