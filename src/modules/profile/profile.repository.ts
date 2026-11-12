import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type { Profile, ProfileLink } from '../../generated/prisma/client.js';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBySlug(slug: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { slug } });
  }

  /** Batch function: one query for any number of profiles. */
  findLinksByProfileIds(profileIds: readonly string[]): Promise<ProfileLink[]> {
    return this.prisma.profileLink.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { position: 'asc' },
    });
  }
}
