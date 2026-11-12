import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { GraphQLModule } from './graphql/graphql.module.js';
import { HealthController } from './health/health.controller.js';
import { ExperienceModule } from './modules/experience/experience.module.js';
import { ProfileModule } from './modules/profile/profile.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { SkillsModule } from './modules/skills/skills.module.js';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    GraphQLModule,
    ProfileModule,
    SkillsModule,
    ExperienceModule,
    ProjectsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
