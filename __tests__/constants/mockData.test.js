import {
  formatSteps,
  formatStepsApprox,
  milesToSteps,
  mockJourney,
  mockStrideStepsPerMile,
} from '../../constants/mockData';

describe('mockData helpers', () => {
  it('milesToSteps multiplies by stride and rounds', () => {
    expect(milesToSteps(1)).toBe(2246);
    expect(milesToSteps(10)).toBe(22460);
    expect(milesToSteps(0.5)).toBe(Math.round(0.5 * 2246));
  });

  it('milesToSteps accepts a custom stride', () => {
    expect(milesToSteps(2, 1000)).toBe(2000);
  });

  it('formatSteps groups thousands with commas', () => {
    expect(formatSteps(2364126)).toBe('2,364,126');
    expect(formatSteps(0)).toBe('0');
  });

  it('formatStepsApprox rounds to k for thousands and M for millions', () => {
    expect(formatStepsApprox(85000)).toBe('~85k steps');
    expect(formatStepsApprox(251000)).toBe('~251k steps');
    expect(formatStepsApprox(6_900_000)).toBe('~6.9M steps');
    expect(formatStepsApprox(2_000_000)).toBe('~2M steps');
    expect(formatStepsApprox(420)).toBe('420 steps');
  });
});

describe('mockJourney pre-computed totals', () => {
  it('pctComplete equals round(cumulative / total * 100)', () => {
    const expected = Math.round((mockJourney.goal.cumulativeMiles / mockJourney.goal.totalMiles) * 100);
    expect(mockJourney.pctComplete).toBe(expected);
  });

  it('cumulative + remaining steps sum to total steps', () => {
    expect(mockJourney.cumulativeSteps + mockJourney.remainingSteps).toBe(mockJourney.totalSteps);
  });

  it('totalSteps matches stride × totalMiles', () => {
    expect(mockJourney.totalSteps).toBe(milesToSteps(mockJourney.goal.totalMiles));
    expect(mockStrideStepsPerMile).toBe(2246);
  });
});
