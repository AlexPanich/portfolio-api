import { Module } from '@nestjs/common';
import { ExperienceModule } from '../experience/experience.module.js';
import { ProfileRepository } from './profile.repository.js';
import { ProfileResolver } from './profile.resolver.js';
import { ProfileService } from './profile.service.js';

@Module({
  imports: [ExperienceModule],
  providers: [ProfileRepository, ProfileService, ProfileResolver],
  exports: [ProfileRepository],
})
export class ProfileModule {}
