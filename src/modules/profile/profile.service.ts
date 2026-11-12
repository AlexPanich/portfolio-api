import { Injectable } from '@nestjs/common';
import { AppConfig } from '../../config/app-config.service.js';
import type { Profile } from '../../generated/prisma/client.js';
import { ProfileRepository } from './profile.repository.js';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profiles: ProfileRepository,
    private readonly config: AppConfig,
  ) {}

  /** Without a slug, the profile configured as default is returned. */
  findBySlug(slug?: string | null): Promise<Profile | null> {
    return this.profiles.findBySlug(slug ?? this.config.defaultProfileSlug);
  }
}
