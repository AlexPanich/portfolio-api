import { profile } from './data/profile.data.js';
import { profileSeedSchema, type ProfileSeedInput } from './seed.schema.js';

const valid: ProfileSeedInput = {
  slug: 'test',
  name: 'Test',
  headline: 'Engineer',
  description: 'Bio',
  links: [{ type: 'GITHUB', label: 'GitHub', url: 'https://github.com/test' }],
  skills: [
    { name: 'TypeScript', category: 'LANGUAGE' },
    { name: 'PostgreSQL', category: 'DATABASE' },
  ],
  experience: [
    {
      company: 'Acme',
      position: 'Dev',
      startDate: '2022-01',
      endDate: '2023-06',
      technologies: ['TypeScript'],
    },
  ],
  projects: [{ name: 'P', description: 'D', technologies: ['PostgreSQL'] }],
};

const issues = (input: unknown) => {
  const result = profileSeedSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.message);
};

describe('profileSeedSchema', () => {
  it('accepts the real CV data shipped with the app', () => {
    expect(issues(profile)).toEqual([]);
  });

  it('parses YYYY-MM into UTC dates and defaults optional collections', () => {
    const seed = profileSeedSchema.parse(valid);
    expect(seed.experience[0].startDate.toISOString()).toBe(
      '2022-01-01T00:00:00.000Z',
    );
    expect(seed.experience[0].achievements).toEqual([]);
  });

  it('treats a missing endDate as a current position', () => {
    const { endDate: _, ...current } = valid.experience[0];
    const seed = profileSeedSchema.parse({ ...valid, experience: [current] });
    expect(seed.experience[0].endDate).toBeNull();
  });

  it('rejects a technology that is not declared as a skill', () => {
    const input = {
      ...valid,
      projects: [{ name: 'P', description: 'D', technologies: ['Rust'] }],
    };
    expect(issues(input)).toEqual([
      'Unknown technology "Rust": add it to "skills" first',
    ]);
  });

  it('rejects positions that end before they start', () => {
    const input = {
      ...valid,
      experience: [
        { ...valid.experience[0], startDate: '2024-01', endDate: '2023-01' },
      ],
    };
    expect(issues(input)).toContain(
      'endDate must not be earlier than startDate',
    );
  });

  it('rejects duplicate skills (case-insensitive)', () => {
    const input = {
      ...valid,
      skills: [...valid.skills, { name: 'typescript', category: 'LANGUAGE' }],
    };
    expect(issues(input)).toContain('Duplicate skill: "typescript"');
  });

  it('rejects malformed months', () => {
    const input = {
      ...valid,
      experience: [{ ...valid.experience[0], startDate: '2024-13' }],
    };
    expect(issues(input)).toContain('Expected YYYY-MM');
  });
});
