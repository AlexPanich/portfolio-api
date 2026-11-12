import { z } from 'zod';
import { LinkType, SkillCategory } from '../generated/prisma/enums.js';

/** "2023-04" -> first day of that month (UTC). */
const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expected YYYY-MM')
  .transform((value) => new Date(`${value}-01T00:00:00.000Z`));

const nonEmpty = z.string().trim().min(1);

const uniqueBy =
  <T>(key: (item: T) => string, what: string) =>
  (items: T[], ctx: z.RefinementCtx) => {
    const seen = new Set<string>();
    for (const item of items) {
      const value = key(item).toLowerCase();
      if (seen.has(value)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate ${what}: "${key(item)}"`,
        });
      }
      seen.add(value);
    }
  };

const technologies = z.array(nonEmpty).default([]);

const experienceSchema = z
  .object({
    company: nonEmpty,
    companyUrl: z.url().optional(),
    position: nonEmpty,
    location: nonEmpty.optional(),
    description: nonEmpty.optional(),
    startDate: yearMonth,
    endDate: yearMonth.nullable().default(null),
    achievements: z.array(nonEmpty).default([]),
    technologies,
  })
  .refine((e) => e.endDate === null || e.endDate >= e.startDate, {
    message: 'endDate must not be earlier than startDate',
    path: ['endDate'],
  });

const projectSchema = z.object({
  name: nonEmpty,
  description: nonEmpty,
  url: z.url().optional(),
  repositoryUrl: z.url().optional(),
  technologies,
});

/**
 * Shape of the hand-written CV data. Validation runs before anything is
 * written, so a typo (unknown technology, swapped dates, duplicate skill)
 * fails the seed with a readable message instead of producing bad data.
 */
export const profileSeedSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/, 'kebab-case only'),
    name: nonEmpty,
    headline: nonEmpty,
    description: nonEmpty,
    location: nonEmpty.optional(),
    /** Image file name inside `src/seed/assets/`; uploaded to S3 on seed. */
    avatar: z
      .string()
      .regex(
        /^[\w.-]+\.(jpe?g|png|webp)$/i,
        'Expected a .jpg, .png or .webp file name',
      )
      .optional(),
    links: z
      .array(
        z.object({
          type: z.enum(LinkType),
          label: nonEmpty,
          url: z.url(),
        }),
      )
      .superRefine(uniqueBy((l) => l.url, 'link')),
    skills: z
      .array(z.object({ name: nonEmpty, category: z.enum(SkillCategory) }))
      .superRefine(uniqueBy((s) => s.name, 'skill')),
    experience: z.array(experienceSchema),
    projects: z
      .array(projectSchema)
      .superRefine(uniqueBy((p) => p.name, 'project')),
  })
  .superRefine((profile, ctx) => {
    const known = new Set(profile.skills.map((s) => s.name));
    const check = (names: string[], path: (string | number)[]) =>
      names.forEach((name, i) => {
        if (!known.has(name)) {
          ctx.addIssue({
            code: 'custom',
            message: `Unknown technology "${name}": add it to "skills" first`,
            path: [...path, i],
          });
        }
      });

    profile.experience.forEach((e, i) =>
      check(e.technologies, ['experience', i, 'technologies']),
    );
    profile.projects.forEach((p, i) =>
      check(p.technologies, ['projects', i, 'technologies']),
    );
  });

/** What authors write (dates as "YYYY-MM"). */
export type ProfileSeedInput = z.input<typeof profileSeedSchema>;
/** What the seeder consumes (validated, dates parsed). */
export type ProfileSeed = z.output<typeof profileSeedSchema>;
