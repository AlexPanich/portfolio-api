import { Module } from '@nestjs/common';
import { FilesModule } from '../modules/files/files.module.js';
import { ExperienceModule } from '../modules/experience/experience.module.js';
import { ProfileModule } from '../modules/profile/profile.module.js';
import { ProjectsModule } from '../modules/projects/projects.module.js';
import { SkillsModule } from '../modules/skills/skills.module.js';
import { LoadersFactory } from './loaders.factory.js';

@Module({
  imports: [
    ProfileModule,
    SkillsModule,
    ExperienceModule,
    ProjectsModule,
    FilesModule,
  ],
  providers: [LoadersFactory],
  exports: [LoadersFactory],
})
export class LoadersModule {}
