import { Injectable } from '@nestjs/common';
import type { StoredFile } from '../../generated/prisma/client.js';
import { ObjectStorage } from '../../storage/object-storage.js';
import type { Image } from './models/image.model.js';

@Injectable()
export class FilesService {
  constructor(private readonly storage: ObjectStorage) {}

  /**
   * Turns stored metadata into a client-facing image. Returns `null` when
   * the file is missing or storage is disabled, so a storage outage or an
   * unconfigured environment degrades one field instead of the whole query.
   */
  async toImage(file: StoredFile | null): Promise<Image | null> {
    if (!file) return null;
    const signed = await this.storage.signedUrl(file.key);
    if (!signed) return null;
    return {
      url: signed.url,
      expiresAt: signed.expiresAt,
      contentType: file.contentType,
      size: file.size,
    };
  }
}
