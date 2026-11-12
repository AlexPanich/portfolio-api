import { Module } from '@nestjs/common';
import { SkillsRepository } from './skills.repository.js';

@Module({
  providers: [SkillsRepository],
  exports: [SkillsRepository],
})
export class SkillsModule {}
