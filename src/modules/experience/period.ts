/**
 * Pure date arithmetic for employment periods.
 *
 * A CV operates with whole months ("Mar 2021 - Jun 2023"), so periods are
 * normalized to month indexes and both ends are inclusive: a job that
 * started and ended in the same month lasted one month.
 * Dates are read in UTC because PostgreSQL DATE columns arrive as UTC midnight.
 */

export interface DateRange {
  startDate: Date;
  /** `null` means "still working here". */
  endDate: Date | null;
}

export interface Duration {
  years: number;
  months: number;
  totalMonths: number;
}

const toMonthIndex = (date: Date): number =>
  date.getUTCFullYear() * 12 + date.getUTCMonth();

function toMonthSpan(range: DateRange, now: Date): [number, number] {
  const start = toMonthIndex(range.startDate);
  const end = toMonthIndex(range.endDate ?? now);
  if (end < start) {
    throw new RangeError(
      `Period ends (${(range.endDate ?? now).toISOString()}) before it starts (${range.startDate.toISOString()})`,
    );
  }
  return [start, end];
}

export function toDuration(totalMonths: number): Duration {
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    totalMonths,
  };
}

export function periodDuration(range: DateRange, now: Date): Duration {
  const [start, end] = toMonthSpan(range, now);
  return toDuration(end - start + 1);
}

/**
 * Total professional experience. Overlapping or adjacent jobs (e.g. a
 * part-time contract next to a full-time role) are merged first, so
 * parallel work is not counted twice.
 */
export function totalExperience(
  ranges: readonly DateRange[],
  now: Date,
): Duration {
  const spans = ranges
    .map((range) => toMonthSpan(range, now))
    .sort(([a], [b]) => a - b);

  let total = 0;
  let current: [number, number] | undefined;

  for (const [start, end] of spans) {
    if (current && start <= current[1] + 1) {
      current[1] = Math.max(current[1], end);
      continue;
    }
    if (current) total += current[1] - current[0] + 1;
    current = [start, end];
  }
  if (current) total += current[1] - current[0] + 1;

  return toDuration(total);
}
