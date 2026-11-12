import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type { StoredFile } from '../../generated/prisma/client.js';

@Injectable()
export class FilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Batch function: one query for any number of ids. */
  findByIds(ids: readonly string[]): Promise<StoredFile[]> {
    return this.prisma.storedFile.findMany({
      where: { id: { in: [...ids] } },
    });
  }
}
