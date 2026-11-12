import { Injectable } from '@nestjs/common';
import { createEntityLoader } from '../common/dataloader/entity-loader.js';
import { createGroupedLoader } from '../common/dataloader/grouped-loader.js';
import { ExperienceRepository } from '../modules/experience/experience.repository.js';
import { FilesRepository } from '../modules/files/files.repository.js';
import { ProfileRepository } from '../modules/profile/profile.repository.js';
import { ProjectsRepository } from '../modules/projects/projects.repository.js';
import { SkillsRepository } from '../modules/skills/skills.repository.js';

/**
 * Builds a fresh set of DataLoaders for every GraphQL request.
 *
 * Loaders are created per request (not as singletons) because their cache
 * must not leak data between requests. Doing it in the context factory,
 * rather than with REQUEST-scoped providers, keeps every service a
 * singleton: request scope in Nest propagates up the whole dependency chain.
 */
@Injectable()
export class LoadersFactory {
  constructor(
    private readonly profiles: ProfileRepository,
    private readonly skills: SkillsRepository,
    private readonly experience: ExperienceRepository,
    private readonly projects: ProjectsRepository,
    private readonly files: FilesRepository,
  ) {}

  create() {
    return {
      linksByProfileId: createGroupedLoader({
        fetch: (ids: readonly string[]) =>
          this.profiles.findLinksByProfileIds(ids),
        keyOf: (link) => link.profileId,
      }),
      skillsByProfileId: createGroupedLoader({
        fetch: (ids: readonly string[]) => this.skills.findByProfileIds(ids),
        keyOf: (skill) => skill.profileId,
      }),
      experienceByProfileId: createGroupedLoader({
        fetch: (ids: readonly string[]) =>
          this.experience.findByProfileIds(ids),
        keyOf: (experience) => experience.profileId,
      }),
      projectsByProfileId: createGroupedLoader({
        fetch: (ids: readonly string[]) => this.projects.findByProfileIds(ids),
        keyOf: (project) => project.profileId,
      }),
      skillsByExperienceId: createGroupedLoader({
        fetch: (ids: readonly string[]) => this.skills.findByExperienceIds(ids),
        keyOf: (link) => link.ownerId,
        select: (link) => link.skill,
      }),
      skillsByProjectId: createGroupedLoader({
        fetch: (ids: readonly string[]) => this.skills.findByProjectIds(ids),
        keyOf: (link) => link.ownerId,
        select: (link) => link.skill,
      }),
      fileById: createEntityLoader({
        fetch: (ids: readonly string[]) => this.files.findByIds(ids),
        keyOf: (file) => file.id,
      }),
    };
  }
}

export type Loaders = ReturnType<LoadersFactory['create']>;
