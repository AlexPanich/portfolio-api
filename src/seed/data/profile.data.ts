import type { ProfileSeedInput } from '../seed.schema.js';

/**
 * The CV itself. This file is the source of truth: the database is
 * rebuilt from it on every start. Order of arrays = display order.
 *
 * TODO: placeholder content, to be replaced with real CV data.
 */
export const profile = {
  slug: 'me',
  name: 'Your Name',
  headline: 'Backend Engineer · TypeScript / Node.js',
  description:
    'Backend engineer focused on clean architecture, GraphQL APIs and reliable data layers.',
  location: 'Remote',
  links: [
    { type: 'GITHUB', label: 'GitHub', url: 'https://github.com/your-handle' },
    {
      type: 'LINKEDIN',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/your-handle',
    },
  ],
  skills: [
    { name: 'TypeScript', category: 'LANGUAGE' },
    { name: 'Node.js', category: 'BACKEND' },
    { name: 'NestJS', category: 'BACKEND' },
    { name: 'GraphQL', category: 'API' },
    { name: 'PostgreSQL', category: 'DATABASE' },
    { name: 'Prisma', category: 'DATABASE' },
    { name: 'Docker', category: 'DEVOPS' },
    { name: 'Git', category: 'TOOLING' },
  ],
  experience: [
    {
      company: 'Company B',
      position: 'Senior Backend Engineer',
      startDate: '2023-02',
      achievements: ['Placeholder achievement.'],
      technologies: ['TypeScript', 'NestJS', 'GraphQL', 'PostgreSQL'],
    },
    {
      company: 'Company A',
      position: 'Backend Engineer',
      startDate: '2020-06',
      endDate: '2023-01',
      achievements: ['Placeholder achievement.'],
      technologies: ['TypeScript', 'Node.js', 'Docker'],
    },
  ],
  projects: [
    {
      name: 'Portfolio API',
      description:
        'This digital business card: NestJS + GraphQL + Prisma + PostgreSQL, shipped in Docker.',
      repositoryUrl: 'https://github.com/your-handle/portfolio-api',
      technologies: [
        'TypeScript',
        'NestJS',
        'GraphQL',
        'Prisma',
        'PostgreSQL',
        'Docker',
      ],
    },
  ],
} satisfies ProfileSeedInput;
