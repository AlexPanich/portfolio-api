import { Module } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository.js';
import { ProjectsResolver } from './projects.resolver.js';

@Module({
  providers: [ProjectsRepository, ProjectsResolver],
  exports: [ProjectsRepository],
})
export class ProjectsModule {}
