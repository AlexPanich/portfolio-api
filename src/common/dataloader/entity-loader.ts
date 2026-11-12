import DataLoader from 'dataloader';

export interface EntityLoaderOptions<K, V> {
  /** Loads every requested entity in ONE query; order does not matter. */
  fetch: (keys: readonly K[]) => Promise<readonly V[]>;
  keyOf: (entity: V) => K;
}

/**
 * DataLoader for to-one relations (lookup by primary key).
 * Missing entities resolve to `null` instead of failing the whole batch.
 */
export function createEntityLoader<K, V>(
  options: EntityLoaderOptions<K, V>,
): DataLoader<K, V | null> {
  return new DataLoader<K, V | null>(async (keys) => {
    const byKey = new Map<K, V>();
    for (const entity of await options.fetch(keys)) {
      byKey.set(options.keyOf(entity), entity);
    }
    return keys.map((key) => byKey.get(key) ?? null);
  });
}
