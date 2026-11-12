import DataLoader from 'dataloader';

export interface GroupedLoaderOptions<K, Row, V> {
  /** Loads every row for all requested keys in ONE query. */
  fetch: (keys: readonly K[]) => Promise<readonly Row[]>;
  /** Which parent key a row belongs to. */
  keyOf: (row: Row) => K;
  /** Optional projection, e.g. join-table row -> related entity. */
  select?: (row: Row) => V;
}

/**
 * DataLoader for one-to-many / many-to-many relations.
 *
 * All `load(parentId)` calls made while resolving one level of a GraphQL
 * query are collected into a single `fetch` call, which turns N+1 queries
 * into exactly one per relation. Row order returned by `fetch` is preserved
 * inside each group, so ordering stays the repository's responsibility.
 * Parents without rows resolve to an empty array, never to an error.
 */
export function createGroupedLoader<K, Row, V = Row>(
  options: GroupedLoaderOptions<K, Row, V>,
): DataLoader<K, V[]> {
  const select = options.select ?? ((row: Row) => row as unknown as V);

  return new DataLoader<K, V[]>(async (keys) => {
    const groups = new Map<K, V[]>(keys.map((key) => [key, []]));

    for (const row of await options.fetch(keys)) {
      groups.get(options.keyOf(row))?.push(select(row));
    }

    return keys.map((key) => groups.get(key) ?? []);
  });
}
