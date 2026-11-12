import { Injectable } from '@nestjs/common';
import { Clock } from '../../common/clock.js';
import type { Experience } from '../../generated/prisma/client.js';
import type { Duration, Period } from './models/experience.model.js';
import { periodDuration, totalExperience } from './period.js';

type Dated = Pick<Experience, 'startDate' | 'endDate'>;

/** Business rules around employment history. */
@Injectable()
export class ExperienceService {
  constructor(private readonly clock: Clock) {}

  periodOf(experience: Dated): Period {
    return {
      startDate: experience.startDate,
      endDate: experience.endDate,
      isCurrent: experience.endDate === null,
      duration: periodDuration(experience, this.clock.now()),
    };
  }

  totalOf(experience: readonly Dated[]): Duration {
    return totalExperience(experience, this.clock.now());
  }
}
