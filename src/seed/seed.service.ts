import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { PrismaService } from '../database/prisma.service.js';
import {
  profileSeedSchema,
  type ProfileSeed,
  type ProfileSeedInput,
} from './seed.schema.js';

/** Arbitrary constant: serializes concurrent seeders (e.g. 2 replicas booting). */
const SEED_LOCK_KEY = 72_616_001;

export interface SeedResult {
  slug: string;
  skills: number;
  experience: number;
  projects: number;
}

/**
 * Makes the database match the seed file exactly.
 *
 * The profile is deleted (relations cascade) and recreated inside one
 * transaction, so the operation is idempotent and safe to run on every
 * container start: edits AND removals in the seed file are applied, and
 * concurrent readers keep seeing the previous version until commit.
 */
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sync(input: ProfileSeedInput): Promise<SeedResult> {
    const parsed = profileSeedSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(`Invalid seed data:\n${z.prettifyError(parsed.error)}`);
    }
    const result = await this.write(parsed.data);
    this.logger.log(
      `Profile "${result.slug}" synced: ${result.skills} skills, ` +
        `${result.experience} positions, ${result.projects} projects`,
    );
    return result;
  }

  private write(seed: ProfileSeed): Promise<SeedResult> {
    return this.prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${SEED_LOCK_KEY})`;
        await tx.profile.deleteMany({ where: { slug: seed.slug } });

        const profile = await tx.profile.create({
          data: {
            slug: seed.slug,
            name: seed.name,
            headline: seed.headline,
            description: seed.description,
            location: seed.location,
            links: {
              create: seed.links.map((link, position) => ({
                ...link,
                position,
              })),
            },
            skills: {
              create: seed.skills.map((skill, position) => ({
                ...skill,
                position,
              })),
            },
          },
          select: { id: true, skills: { select: { id: true, name: true } } },
        });

        const skillId = new Map(profile.skills.map((s) => [s.name, s.id]));
        // Validated by the schema: every technology refers to a known skill.
        const linkSkills = (names: string[]) =>
          names.map((name, position) => ({
            skillId: skillId.get(name)!,
            position,
          }));

        for (const { technologies, ...experience } of seed.experience) {
          await tx.experience.create({
            data: {
              ...experience,
              profileId: profile.id,
              technologies: { create: linkSkills(technologies) },
            },
          });
        }

        for (const [
          position,
          { technologies, ...project },
        ] of seed.projects.entries()) {
          await tx.project.create({
            data: {
              ...project,
              position,
              profileId: profile.id,
              technologies: { create: linkSkills(technologies) },
            },
          });
        }

        return {
          slug: seed.slug,
          skills: seed.skills.length,
          experience: seed.experience.length,
          projects: seed.projects.length,
        };
      },
      { timeout: 30_000 },
    );
  }
}
