import { Module } from '@nestjs/common';
import { Clock } from '../../common/clock.js';
import { ExperienceRepository } from './experience.repository.js';
import { ExperienceResolver } from './experience.resolver.js';
import { ExperienceService } from './experience.service.js';

@Module({
  providers: [
    Clock,
    ExperienceRepository,
    ExperienceService,
    ExperienceResolver,
  ],
  exports: [ExperienceRepository, ExperienceService],
})
export class ExperienceModule {}
