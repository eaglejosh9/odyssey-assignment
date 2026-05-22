/**
 * Wrappers over Orval's generated settings client. See orders.ts for the pattern.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { ApiHttpError, OrvalResponse } from "../mutator";
import { getSettings, patchSettings } from "./settings/settings";
import type { BusinessSettings, BusinessSettingsUpdate } from "./schemas/index";

export const settingsKeys = {
  all: ["settings"] as const,
};

type QueryOpts<T> = { query?: Partial<UseQueryOptions<T, ApiHttpError>> };
type MutationOpts<TData, TVars> = {
  mutation?: Partial<UseMutationOptions<TData, ApiHttpError, TVars>>;
};

async function unwrap<T>(p: Promise<unknown>): Promise<T> {
  return ((await p) as OrvalResponse<T>).data;
}

export function useGetSettings(options?: QueryOpts<BusinessSettings>) {
  return useQuery<BusinessSettings, ApiHttpError>({
    queryKey: settingsKeys.all,
    queryFn: ({ signal }) => unwrap<BusinessSettings>(getSettings({ signal })),
    ...options?.query,
  });
}

export function useUpdateSettings(
  options?: MutationOpts<BusinessSettings, BusinessSettingsUpdate>
) {
  const qc = useQueryClient();
  return useMutation<BusinessSettings, ApiHttpError, BusinessSettingsUpdate>({
    mutationFn: (data) => unwrap<BusinessSettings>(patchSettings(data)),
    onSuccess: (next) => {
      qc.setQueryData(settingsKeys.all, next);
    },
    ...options?.mutation,
  });
}

export { getSettings, patchSettings };