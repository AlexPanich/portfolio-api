import { periodDuration, toDuration, totalExperience } from './period.js';

const d = (ym: string) => new Date(`${ym}-01T00:00:00.000Z`);
const NOW = d('2026-11');

describe('periodDuration', () => {
  it('counts both boundary months (same month = 1 month)', () => {
    expect(
      periodDuration({ startDate: d('2024-03'), endDate: d('2024-03') }, NOW),
    ).toEqual({ years: 0, months: 1, totalMonths: 1 });
  });

  it('splits into years and months', () => {
    expect(
      periodDuration({ startDate: d('2020-06'), endDate: d('2023-01') }, NOW),
    ).toEqual({ years: 2, months: 8, totalMonths: 32 });
  });

  it('measures a current position up to now', () => {
    expect(
      periodDuration({ startDate: d('2025-12'), endDate: null }, NOW),
    ).toEqual({ years: 1, months: 0, totalMonths: 12 });
  });

  it('ignores the day of month and uses UTC', () => {
    const start = new Date('2024-01-31T23:30:00.000Z');
    const end = new Date('2024-02-01T00:00:00.000Z');
    expect(
      periodDuration({ startDate: start, endDate: end }, NOW).totalMonths,
    ).toBe(2);
  });

  it('rejects periods that end before they start', () => {
    expect(() =>
      periodDuration({ startDate: d('2024-05'), endDate: d('2024-04') }, NOW),
    ).toThrow(RangeError);
  });
});

describe('totalExperience', () => {
  it('is zero without positions', () => {
    expect(totalExperience([], NOW)).toEqual(toDuration(0));
  });

  it('sums disjoint positions, gaps excluded', () => {
    const total = totalExperience(
      [
        { startDate: d('2019-01'), endDate: d('2019-12') }, // 12
        { startDate: d('2021-01'), endDate: d('2021-06') }, // 6
      ],
      NOW,
    );
    expect(total.totalMonths).toBe(18);
  });

  it('counts overlapping positions once, regardless of input order', () => {
    const total = totalExperience(
      [
        { startDate: d('2022-06'), endDate: null }, // side project till now
        { startDate: d('2020-01'), endDate: d('2022-12') },
        { startDate: d('2021-03'), endDate: d('2021-08') }, // fully nested
      ],
      NOW,
    );
    // 2020-01 .. 2026-11 inclusive
    expect(total).toEqual({ years: 6, months: 11, totalMonths: 83 });
  });

  it('merges back-to-back positions without double-counting the seam', () => {
    const total = totalExperience(
      [
        { startDate: d('2020-01'), endDate: d('2020-06') },
        { startDate: d('2020-07'), endDate: d('2020-12') },
      ],
      NOW,
    );
    expect(total.totalMonths).toBe(12);
  });
});
