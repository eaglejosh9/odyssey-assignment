/**
 * Wrappers over Orval's generated stats client. See orders.ts for the pattern.
 */
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { ApiHttpError, OrvalResponse } from "../mutator";
import { getStatsHome } from "./stats/stats";
import type { HomeStats } from "./schemas/index";

export const statsKeys = {
  all: ["stats"] as const,
  home: () => [...statsKeys.all, "home"] as const,
};

type QueryOpts<T> = { query?: Partial<UseQueryOptions<T, ApiHttpError>> };

async function unwrap<T>(p: Promise<unknown>): Promise<T> {
  return ((await p) as OrvalResponse<T>).data;
}

export function useHomeStats(options?: QueryOpts<HomeStats>) {
  return useQuery<HomeStats, ApiHttpError>({
    queryKey: statsKeys.home(),
    queryFn: ({ signal }) => unwrap<HomeStats>(getStatsHome({ signal })),
    refetchInterval: 15_000,
    ...options?.query,
  });
}

export { getStatsHome };