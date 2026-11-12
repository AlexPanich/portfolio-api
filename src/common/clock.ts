import { Injectable } from '@nestjs/common';

/**
 * Time source behind DI, so logic that depends on "now" (current job
 * duration, total experience) is deterministic in tests.
 */
@Injectable()
export class Clock {
  now(): Date {
    return new Date();
  }
}
