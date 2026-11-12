import { createGroupedLoader } from './grouped-loader.js';

interface Row {
  parentId: string;
  value: string;
}

const rows: Row[] = [
  { parentId: 'b', value: 'b1' },
  { parentId: 'a', value: 'a1' },
  { parentId: 'b', value: 'b2' },
  { parentId: 'zzz', value: 'not requested' },
];

describe('createGroupedLoader', () => {
  it('batches all loads of one tick into a single fetch', async () => {
    const fetch = vi.fn(async (_keys: readonly string[]) => rows);
    const loader = createGroupedLoader({
      fetch,
      keyOf: (r: Row) => r.parentId,
    });

    const [a, b] = await Promise.all([loader.load('a'), loader.load('b')]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(['a', 'b']);
    expect(a.map((r) => r.value)).toEqual(['a1']);
    expect(b.map((r) => r.value)).toEqual(['b1', 'b2']); // fetch order kept
  });

  it('resolves parents without rows to an empty array', async () => {
    const loader = createGroupedLoader({
      fetch: async () => [] as Row[],
      keyOf: (r: Row) => r.parentId,
    });
    await expect(loader.load('missing')).resolves.toEqual([]);
  });

  it('applies the projection', async () => {
    const loader = createGroupedLoader({
      fetch: async () => rows,
      keyOf: (r: Row) => r.parentId,
      select: (r) => r.value.toUpperCase(),
    });
    await expect(loader.load('b')).resolves.toEqual(['B1', 'B2']);
  });

  it('caches per key within its lifetime', async () => {
    const fetch = vi.fn(async () => rows);
    const loader = createGroupedLoader({
      fetch,
      keyOf: (r: Row) => r.parentId,
    });

    await loader.load('a');
    await loader.load('a');

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('propagates fetch errors to every waiting load', async () => {
    const loader = createGroupedLoader({
      fetch: async (): Promise<Row[]> => {
        throw new Error('db down');
      },
      keyOf: (r: Row) => r.parentId,
    });
    await expect(
      Promise.all([loader.load('a'), loader.load('b')]),
    ).rejects.toThrow('db down');
  });
});
