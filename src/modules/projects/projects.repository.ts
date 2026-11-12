import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type { Project } from '../../generated/prisma/client.js';

@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Batch function: one query for any number of profiles. */
  findByProfileIds(profileIds: readonly string[]): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { position: 'asc' },
    });
  }
}
