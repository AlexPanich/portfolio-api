import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { PrismaService } from '../database/prisma.service.js';
import { ObjectStorage } from '../storage/object-storage.js';
import {
  profileSeedSchema,
  type ProfileSeed,
  type ProfileSeedInput,
} from './seed.schema.js';

/** Arbitrary constant: serializes concurrent seeders (e.g. 2 replicas booting). */
const SEED_LOCK_KEY = 72_616_001;

/** Copied next to the compiled seeder by `nest build` (see nest-cli.json). */
const ASSETS_DIR = join(import.meta.dirname, 'assets');

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

/** Object uploaded to storage; persisted as a StoredFile row. */
interface UploadedFile {
  key: string;
  contentType: string;
  size: number;
  checksum: string;
}

export interface SeedResult {
  slug: string;
  skills: number;
  experience: number;
  projects: number;
  avatar: boolean;
}

/**
 * Makes the database match the seed file exactly.
 *
 * The profile is deleted (relations cascade) and recreated inside one
 * transaction, so the operation is idempotent and safe to run on every
 * container start: edits AND removals in the seed file are applied, and
 * concurrent readers keep seeing the previous version until commit.
 *
 * Files are uploaded BEFORE the transaction (S3 is not transactional) under
 * content-addressed keys, so a failed or repeated seed never leaves a row
 * pointing to a missing object and never uploads the same bytes twice.
 */
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: ObjectStorage,
  ) {}

  async sync(input: ProfileSeedInput): Promise<SeedResult> {
    const parsed = profileSeedSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(`Invalid seed data:\n${z.prettifyError(parsed.error)}`);
    }
    const avatar = await this.uploadAvatar(parsed.data.avatar);
    const result = await this.write(parsed.data, avatar);
    this.logger.log(
      `Profile "${result.slug}" synced: ${result.skills} skills, ` +
        `${result.experience} positions, ${result.projects} projects, ` +
        `avatar: ${result.avatar ? 'yes' : 'no'}`,
    );
    return result;
  }

  private async uploadAvatar(
    fileName: string | undefined,
  ): Promise<UploadedFile | null> {
    if (!fileName) return null;
    if (!this.storage.enabled) {
      this.logger.warn(`S3 is not configured: avatar "${fileName}" skipped`);
      return null;
    }

    const body = await readFile(join(ASSETS_DIR, fileName));
    const extension = extname(fileName).toLowerCase();
    const checksum = createHash('sha256').update(body).digest('hex');
    const file: UploadedFile = {
      key: `avatars/${checksum}${extension}`,
      contentType: CONTENT_TYPES[extension],
      size: body.length,
      checksum,
    };

    await this.storage.ensureBucket();
    if (await this.storage.exists(file.key)) {
      this.logger.log(`Avatar already in storage: ${file.key}`);
    } else {
      await this.storage.put(file.key, body, file.contentType);
      this.logger.log(`Avatar uploaded: ${file.key}`);
    }
    return file;
  }

  private write(
    seed: ProfileSeed,
    avatar: UploadedFile | null,
  ): Promise<SeedResult> {
    return this.prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${SEED_LOCK_KEY})`;
        await tx.profile.deleteMany({ where: { slug: seed.slug } });

        const avatarFile = avatar
          ? await tx.storedFile.upsert({
              where: { key: avatar.key },
              create: avatar,
              update: {},
              select: { id: true },
            })
          : null;

        const profile = await tx.profile.create({
          data: {
            slug: seed.slug,
            name: seed.name,
            headline: seed.headline,
            description: seed.description,
            location: seed.location,
            avatarId: avatarFile?.id,
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
          avatar: avatarFile !== null,
        };
      },
      { timeout: 30_000 },
    );
  }
}
