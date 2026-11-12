import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type { Experience } from '../../generated/prisma/client.js';

@Injectable()
export class ExperienceRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Batch function: one query for any number of profiles, newest first. */
  findByProfileIds(profileIds: readonly string[]): Promise<Experience[]> {
    return this.prisma.experience.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ startDate: 'desc' }, { id: 'asc' }],
    });
  }
}
