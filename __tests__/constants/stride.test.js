import { CM_PER_MILE, cmToStepsPerMile, STRIDE_FALLBACK } from '../../constants/stride';

describe('cmToStepsPerMile', () => {
  it('converts a typical adult stride to ~2,200 steps/mile', () => {
    // 73 cm walking stride is roughly average for a 5\'8" person.
    expect(cmToStepsPerMile(73)).toBe(Math.round(160934 / 73));
  });

  it('round-trips against CM_PER_MILE', () => {
    expect(cmToStepsPerMile(CM_PER_MILE / 2000)).toBe(2000);
  });

  it('falls back to 2200 for missing or invalid input', () => {
    expect(cmToStepsPerMile(0)).toBe(STRIDE_FALLBACK);
    expect(cmToStepsPerMile(null)).toBe(STRIDE_FALLBACK);
    expect(cmToStepsPerMile(undefined)).toBe(STRIDE_FALLBACK);
    expect(cmToStepsPerMile(-50)).toBe(STRIDE_FALLBACK);
  });

  it('STRIDE_FALLBACK matches the PRD default', () => {
    expect(STRIDE_FALLBACK).toBe(2200);
  });
});
