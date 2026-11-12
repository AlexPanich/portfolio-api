import {
  Args,
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import type { GraphQLContext } from '../../graphql/graphql-context.js';
import { ExperienceService } from '../experience/experience.service.js';
import { Duration, Experience } from '../experience/models/experience.model.js';
import { Project } from '../projects/models/project.model.js';
import { SkillCategory } from '../../generated/prisma/enums.js';
import { Skill } from '../skills/models/skill.model.js';
import { Profile, ProfileLink } from './models/profile.model.js';
import { ProfileService } from './profile.service.js';

/**
 * Entry point of the API. Relations are field resolvers backed by
 * DataLoaders, so a client pays only for the fields it selects and each
 * relation costs one SQL query regardless of how many rows it returns.
 */
@Resolver(() => Profile)
export class ProfileResolver {
  constructor(
    private readonly profiles: ProfileService,
    private readonly experienceService: ExperienceService,
  ) {}

  @Query(() => Profile, {
    nullable: true,
    description:
      'Profile by slug; the default profile when no slug is given. Null if not found.',
  })
  profile(
    @Args('slug', { type: () => String, nullable: true }) slug?: string | null,
  ) {
    return this.profiles.findBySlug(slug);
  }

  @ResolveField(() => [ProfileLink])
  links(@Parent() profile: Profile, @Context() { loaders }: GraphQLContext) {
    return loaders.linksByProfileId.load(profile.id);
  }

  @ResolveField(() => [Skill], { description: 'Ordered by relevance.' })
  async skills(
    @Parent() profile: Profile,
    @Context() { loaders }: GraphQLContext,
    @Args('category', { type: () => SkillCategory, nullable: true })
    category?: SkillCategory | null,
  ) {
    const skills = await loaders.skillsByProfileId.load(profile.id);
    return category ? skills.filter((s) => s.category === category) : skills;
  }

  @ResolveField(() => [Experience], { description: 'Most recent first.' })
  experience(
    @Parent() profile: Profile,
    @Context() { loaders }: GraphQLContext,
  ) {
    return loaders.experienceByProfileId.load(profile.id);
  }

  @ResolveField(() => Duration, {
    description: 'Total working time; overlapping positions are counted once.',
  })
  async totalExperience(
    @Parent() profile: Profile,
    @Context() { loaders }: GraphQLContext,
  ) {
    // Same loader as `experience`: selecting both still costs one query.
    const experience = await loaders.experienceByProfileId.load(profile.id);
    return this.experienceService.totalOf(experience);
  }

  @ResolveField(() => [Project])
  projects(@Parent() profile: Profile, @Context() { loaders }: GraphQLContext) {
    return loaders.projectsByProfileId.load(profile.id);
  }
}
