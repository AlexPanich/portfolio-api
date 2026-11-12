import type { StoredFile } from '../../generated/prisma/client.js';
import {
  DisabledObjectStorage,
  ObjectStorage,
  type SignedUrl,
} from '../../storage/object-storage.js';
import { FilesService } from './files.service.js';

const file: StoredFile = {
  id: 'f1',
  key: 'avatars/abc.jpg',
  contentType: 'image/jpeg',
  size: 1234,
  checksum: 'abc',
  createdAt: new Date(),
};

class FakeStorage extends ObjectStorage {
  readonly enabled = true;
  readonly signedUrl = vi.fn(async (key: string): Promise<SignedUrl> => ({
    url: `https://cdn.test/${key}?sig=1`,
    expiresAt: new Date('2030-01-01T00:00:00Z'),
  }));
  ensureBucket = vi.fn();
  exists = vi.fn();
  put = vi.fn();
}

describe('FilesService.toImage', () => {
  it('signs the object key and keeps the stored metadata', async () => {
    const storage = new FakeStorage();
    const image = await new FilesService(storage).toImage(file);

    expect(storage.signedUrl).toHaveBeenCalledWith('avatars/abc.jpg');
    expect(image).toEqual({
      url: 'https://cdn.test/avatars/abc.jpg?sig=1',
      expiresAt: new Date('2030-01-01T00:00:00Z'),
      contentType: 'image/jpeg',
      size: 1234,
    });
  });

  it('returns null when the file does not exist', async () => {
    await expect(
      new FilesService(new FakeStorage()).toImage(null),
    ).resolves.toBeNull();
  });

  it('degrades to null when storage is not configured', async () => {
    await expect(
      new FilesService(new DisabledObjectStorage()).toImage(file),
    ).resolves.toBeNull();
  });
});
