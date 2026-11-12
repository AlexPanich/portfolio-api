import { readFile } from 'node:fs/promises';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { EXAMPLE_QUERY } from '../src/graphql/example-query.js';
import { profile as cv } from '../src/seed/data/profile.data.js';
import type { ProfileSeedInput } from '../src/seed/seed.schema.js';
import { SeedService } from '../src/seed/seed.service.js';

/** A profile big enough that an N+1 bug would be impossible to miss. */
function bigProfile(size: number): ProfileSeedInput {
  const skills = Array.from({ length: size }, (_, i) => ({
    name: `Skill ${i}`,
    category: 'OTHER' as const,
  }));
  const stack = skills.slice(0, 3).map((s) => s.name);
  return {
    slug: 'big',
    name: 'Big Profile',
    headline: 'Load test',
    avatar: 'avatar.jpg',
    description: 'Many rows in every relation',
    links: [{ type: 'WEBSITE', label: 'Site', url: 'https://example.com' }],
    skills,
    experience: Array.from({ length: size }, (_, i) => ({
      company: `Company ${i}`,
      position: 'Engineer',
      startDate: `20${10 + (i % 15)}-01`,
      endDate: `20${10 + (i % 15)}-12`,
      technologies: stack,
    })),
    projects: Array.from({ length: size }, (_, i) => ({
      name: `Project ${i}`,
      description: 'Demo',
      technologies: stack,
    })),
  };
}

describe('GraphQL API (e2e)', () => {
  let app: INestApplication<App>;
  let seeder: SeedService;
  let sqlCount = 0;

  const gql = async (query: string, variables?: Record<string, unknown>) => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query, variables })
      .expect(200);
    return res.body as { data?: any; errors?: { message: string }[] };
  };

  /** Runs a query and reports how many SQL statements it caused. */
  const countSql = async (
    query: string,
    variables?: Record<string, unknown>,
  ) => {
    sqlCount = 0;
    const body = await gql(query, variables);
    expect(body.errors).toBeUndefined();
    return { body, queries: sqlCount };
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [SeedService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    app.get(PrismaService).$on('query', () => sqlCount++);
    seeder = app.get(SeedService);
    await seeder.sync(cv);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('answers the query from the assignment', async () => {
    const { data } = await gql(`
      query {
        profile {
          name
          description
          skills { name }
          experience { company position }
          projects { name }
        }
      }
    `);

    expect(data.profile).toMatchObject({
      name: cv.name,
      description: cv.description,
      skills: cv.skills.map(({ name }) => ({ name })),
      projects: cv.projects.map(({ name }) => ({ name })),
    });
    expect(data.profile.experience).toHaveLength(cv.experience.length);
  });

  it('returns experience newest first, with computed periods', async () => {
    const { data } = await gql(
      `{ profile { experience { company period { startDate isCurrent duration { totalMonths } } } } }`,
    );
    const starts: string[] = data.profile.experience.map(
      (e: any) => e.period.startDate,
    );
    // ISO dates compare correctly as strings.
    expect(starts).toEqual(starts.toSorted((a, b) => b.localeCompare(a)));
    for (const e of data.profile.experience) {
      expect(e.period.duration.totalMonths).toBeGreaterThan(0);
    }
  });

  it('filters skills by category', async () => {
    const { data } = await gql(
      `query($c: SkillCategory) { profile { skills(category: $c) { name category } } }`,
      { c: 'DATABASE' },
    );
    const expected = cv.skills.filter((s) => s.category === 'DATABASE');
    expect(data.profile.skills).toEqual(expected);
  });

  it('returns null for an unknown slug', async () => {
    const { data, errors } = await gql(`{ profile(slug: "nobody") { name } }`);
    expect(errors).toBeUndefined();
    expect(data.profile).toBeNull();
  });

  describe('query efficiency', () => {
    // 1 profile + avatar + links + skills + experience + projects
    // + experience.technologies + projects.technologies
    const EXPECTED_QUERIES = 8;

    beforeAll(() => seeder.sync(bigProfile(30)));

    it('resolves the whole graph with one SQL statement per relation', async () => {
      const { queries } = await countSql(EXAMPLE_QUERY);
      expect(queries).toBe(EXPECTED_QUERIES);
    });

    it('keeps the same number of statements when relations hold 30x more rows', async () => {
      const { body, queries } = await countSql(
        EXAMPLE_QUERY.replace('profile {', 'profile(slug: "big") {'),
      );
      expect(body.data.profile.experience).toHaveLength(30);
      expect(body.data.profile.projects[29].technologies).toHaveLength(3);
      expect(queries).toBe(EXPECTED_QUERIES);
    });

    it('does not touch tables whose fields were not selected', async () => {
      const { queries } = await countSql(`{ profile { name } }`);
      expect(queries).toBe(1);
    });

    it('shares one load between fields backed by the same relation', async () => {
      const { queries } = await countSql(
        `{ profile { experience { company } totalExperience { totalMonths } } }`,
      );
      expect(queries).toBe(2);
    });
  });

  describe('seeding', () => {
    it('is idempotent and mirrors the seed file exactly', async () => {
      const shrunk = { ...bigProfile(30), projects: [] };
      await seeder.sync(shrunk);
      await seeder.sync(shrunk);

      const prisma = app.get(PrismaService);
      const big = await prisma.profile.findUniqueOrThrow({
        where: { slug: 'big' },
        include: {
          _count: {
            select: { projects: true, experience: true, skills: true },
          },
        },
      });
      expect(big._count).toEqual({ projects: 0, experience: 30, skills: 30 });
      expect(await prisma.profile.count({ where: { slug: 'big' } })).toBe(1);
    });

    it('rejects invalid data without touching the database', async () => {
      const before = await app.get(PrismaService).profile.count();
      await expect(
        seeder.sync({
          ...cv,
          slug: 'broken',
          experience: [{ ...cv.experience[0], technologies: ['COBOL'] }],
        }),
      ).rejects.toThrow(/Unknown technology "COBOL"/);
      expect(await app.get(PrismaService).profile.count()).toBe(before);
    });
  });

  it('serves a health check that verifies the database', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200, { status: 'ok' });
  });

  describe('avatar (S3)', () => {
    const query = `{ profile { avatar { url expiresAt contentType size } } }`;

    it('is served through a presigned URL to a private bucket', async () => {
      const { data } = await gql(query);
      const { avatar } = data.profile;
      const original = await readFile(
        new URL('../src/seed/assets/avatar.jpg', import.meta.url),
      );

      expect(avatar).toMatchObject({
        contentType: 'image/jpeg',
        size: original.length,
      });
      expect(new Date(avatar.expiresAt).getTime()).toBeGreaterThan(Date.now());

      const res = await fetch(avatar.url);
      expect(res.status).toBe(200);
      expect(Buffer.from(await res.arrayBuffer()).equals(original)).toBe(true);

      // Without a valid signature the object is not readable.
      const unsigned = avatar.url.split('?')[0];
      expect((await fetch(unsigned)).status).toBe(403);
    });

    it('reuses one stored object for identical content across profiles', async () => {
      const prisma = app.get(PrismaService);
      const files = await prisma.storedFile.findMany({
        where: { avatarOf: { some: {} } },
        select: { key: true, _count: { select: { avatarOf: true } } },
      });
      expect(files).toHaveLength(1);
      expect(files[0].key).toMatch(/^avatars\/[0-9a-f]{64}\.jpg$/);
      expect(files[0]._count.avatarOf).toBeGreaterThanOrEqual(1);
    });
  });

  it('serves Apollo Sandbox to browsers', async () => {
    const res = await request(app.getHttpServer())
      .get('/graphql')
      .set('accept', 'text/html')
      .expect(200);
    expect(res.text).toContain('embeddable-sandbox');
  });
});
