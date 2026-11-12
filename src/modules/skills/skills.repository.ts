import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type { Skill } from '../../generated/prisma/client.js';

export interface SkillLink {
  ownerId: string;
  skill: Skill;
}

/**
 * Data access for skills. Every method takes a list of parent ids and
 * issues a single query: these are the batch functions behind DataLoaders.
 * Join-table lookups use `relationLoadStrategy: 'join'` so the related
 * skill comes back in the same SQL statement instead of a second one.
 */
@Injectable()
export class SkillsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileIds(profileIds: readonly string[]): Promise<Skill[]> {
    return this.prisma.skill.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { position: 'asc' },
    });
  }

  async findByExperienceIds(
    experienceIds: readonly string[],
  ): Promise<SkillLink[]> {
    const rows = await this.prisma.experienceSkill.findMany({
      relationLoadStrategy: 'join',
      where: { experienceId: { in: [...experienceIds] } },
      orderBy: { position: 'asc' },
      select: { experienceId: true, skill: true },
    });
    return rows.map(({ experienceId, skill }) => ({
      ownerId: experienceId,
      skill,
    }));
  }

  async findByProjectIds(projectIds: readonly string[]): Promise<SkillLink[]> {
    const rows = await this.prisma.projectSkill.findMany({
      relationLoadStrategy: 'join',
      where: { projectId: { in: [...projectIds] } },
      orderBy: { position: 'asc' },
      select: { projectId: true, skill: true },
    });
    return rows.map(({ projectId, skill }) => ({ ownerId: projectId, skill }));
  }
}
