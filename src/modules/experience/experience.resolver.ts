import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import type { Experience as ExperienceRecord } from '../../generated/prisma/client.js';
import type { GraphQLContext } from '../../graphql/graphql-context.js';
import { Skill } from '../skills/models/skill.model.js';
import { ExperienceService } from './experience.service.js';
import { Experience, Period } from './models/experience.model.js';

@Resolver(() => Experience)
export class ExperienceResolver {
  constructor(private readonly experience: ExperienceService) {}

  @ResolveField(() => Period)
  period(@Parent() experience: ExperienceRecord): Period {
    return this.experience.periodOf(experience);
  }

  @ResolveField(() => [Skill], { description: 'Stack used in this position.' })
  technologies(
    @Parent() experience: ExperienceRecord,
    @Context() { loaders }: GraphQLContext,
  ) {
    return loaders.skillsByExperienceId.load(experience.id);
  }
}
