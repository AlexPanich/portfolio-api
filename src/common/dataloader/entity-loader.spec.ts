import { createEntityLoader } from './entity-loader.js';

interface Entity {
  id: string;
  name: string;
}

describe('createEntityLoader', () => {
  it('batches lookups and maps results back to keys in request order', async () => {
    const fetch = vi.fn(async (_ids: readonly string[]) => [
      { id: 'b', name: 'B' },
      { id: 'a', name: 'A' },
    ]);
    const loader = createEntityLoader({ fetch, keyOf: (e: Entity) => e.id });

    const [a, b] = await Promise.all([loader.load('a'), loader.load('b')]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(a?.name).toBe('A');
    expect(b?.name).toBe('B');
  });

  it('resolves missing entities to null instead of failing the batch', async () => {
    const loader = createEntityLoader({
      fetch: async () => [{ id: 'a', name: 'A' }],
      keyOf: (e: Entity) => e.id,
    });

    await expect(
      Promise.all([loader.load('a'), loader.load('gone')]),
    ).resolves.toEqual([{ id: 'a', name: 'A' }, null]);
  });
});
