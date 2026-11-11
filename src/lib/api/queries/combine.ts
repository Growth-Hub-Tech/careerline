import type { UseQueryResult } from '@tanstack/react-query';

type DataOf<T extends readonly UseQueryResult[]> = {
  readonly [K in keyof T]: T[K] extends UseQueryResult<infer D> ? D : never;
};

interface CombinedResult<T> {
  readonly data: T | undefined;
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly error: unknown;
  readonly refetch: () => void;
}

// For useQueries({ queries, combine: combineResults }): one result for a page that needs several
// replies, while each reply keeps its own cache entry that other pages share. Its data arrives
// once every reply has; trying again asks only for those that failed.
export const combineResults = <T extends readonly UseQueryResult[]>(
  results: T,
): CombinedResult<DataOf<T>> => {
  const failed = results.find((result) => result.isError && result.data === undefined);
  const ready = results.every((result) => result.data !== undefined);

  return {
    data: ready ? (results.map((result) => result.data) as unknown as DataOf<T>) : undefined,
    isPending: !ready && !failed,
    isError: Boolean(failed),
    error: failed?.error ?? null,
    refetch: () => {
      results.forEach((result) => {
        if (result.isError) void result.refetch();
      });
    },
  };
};
