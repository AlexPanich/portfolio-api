import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import type { GraphQLContext } from '../../graphql/graphql-context.js';
import { Skill } from '../skills/models/skill.model.js';
import { Project } from './models/project.model.js';

@Resolver(() => Project)
export class ProjectsResolver {
  @ResolveField(() => [Skill], { description: 'Tech stack of the project.' })
  technologies(
    @Parent() project: Project,
    @Context() { loaders }: GraphQLContext,
  ) {
    return loaders.skillsByProjectId.load(project.id);
  }
}
