import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import useActiveGoal, { _resetCacheForTests } from '../../hooks/useActiveGoal';
import { getStepHistory } from '../../services/fitbit';
import useFitbit from '../../hooks/useFitbit';
import { setActiveGoal } from '../../storage/goalStore';

jest.mock('../../hooks/useFitbit');
jest.mock('../../services/fitbit', () => ({
  ...jest.requireActual('../../services/fitbit'),
  getStepHistory: jest.fn(),
}));

// Treat useFocusEffect as useEffect so the hook's focus path runs on
// mount in isolation tests (no NavigationContainer in the tree).
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useFocusEffect: (cb) => React.useEffect(cb, [cb]),
  };
});

const ROUTE = { label: 'Fastest', distanceMeters: 100000, durationSeconds: 6000, polyline: [] };
const ORIGIN = { name: 'Boston', address: 'Boston, MA, USA', lat: 42.36, lng: -71.06, placeId: 'b' };
const DESTINATION = {
  name: 'Acadia', address: 'Bar Harbor, ME, USA', lat: 44.34, lng: -68.27, placeId: 'a',
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const FIXED_NOW = new Date('2026-04-30T12:00:00Z').getTime();

beforeEach(() => {
  AsyncStorage.clear();
  _resetCacheForTests();
  getStepHistory.mockReset();
  useFitbit.mockReset();
  jest.spyOn(Date, 'now').mockReturnValue(FIXED_NOW);
  useFitbit.mockReturnValue({
    connected: true,
    loading: false,
    error: null,
    todaySteps: 7000,
    dailyAverage: 6000,
    dailyAveragePct: 116,
    strideStepsPerMile: 2200,
    refresh: jest.fn(),
    disconnect: jest.fn(),
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

async function seedActive(overrides = {}) {
  await setActiveGoal({
    origin: ORIGIN,
    destination: DESTINATION,
    route: ROUTE,
    status: 'active',
    createdAt: new Date(FIXED_NOW - 9 * MS_PER_DAY).toISOString(),
    ...overrides,
  });
}

describe('useActiveGoal', () => {
  it('returns isActive=false when no goal exists in storage', async () => {
    const { result } = renderHook(() => useActiveGoal());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isActive).toBe(false);
    expect(result.current.goal).toBeNull();
    expect(result.current.daysRemaining).toBeNull();
    expect(getStepHistory).not.toHaveBeenCalled();
  });

  it('returns isActive=false for a draft goal (status !== active)', async () => {
    await setActiveGoal({
      origin: ORIGIN,
      destination: DESTINATION,
      route: ROUTE,
      status: 'draft',
      createdAt: new Date(FIXED_NOW - MS_PER_DAY).toISOString(),
    });
    const { result } = renderHook(() => useActiveGoal());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isActive).toBe(false);
    expect(result.current.goal.status).toBe('draft');
    expect(getStepHistory).not.toHaveBeenCalled();
  });

  it('computes cumulative steps, pctComplete, and daysRemaining for an active goal', async () => {
    await seedActive();
    // 100,000 m / 1609.34 ≈ 62.1372 mi. 62.1372 * 2200 stride ≈ 136,701.76,
    // rounds to 136,702 steps. 9 days of 5000 = 45,000 cumulative.
    // Remaining = 91,702. dailyAverage 6000 → ceil(91702 / 6000) = 16.
    getStepHistory.mockResolvedValueOnce([5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000]);
    const { result } = renderHook(() => useActiveGoal());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isActive).toBe(true);
    expect(result.current.daysActive).toBe(9);
    expect(result.current.cumulativeSteps).toBe(45000);
    expect(result.current.totalSteps).toBe(136702);
    expect(result.current.remainingSteps).toBe(91702);
    expect(result.current.pctComplete).toBe(33);
    expect(result.current.daysRemaining).toBe(16);
    expect(getStepHistory).toHaveBeenCalledWith(expect.any(String), 9);
  });

  it('returns daysRemaining=null when dailyAverage is zero', async () => {
    useFitbit.mockReturnValue({
      connected: true, loading: false, error: null,
      todaySteps: 0, dailyAverage: 0, dailyAveragePct: 0,
      strideStepsPerMile: 2200,
      refresh: jest.fn(), disconnect: jest.fn(),
    });
    await seedActive();
    getStepHistory.mockResolvedValueOnce([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const { result } = renderHook(() => useActiveGoal());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.daysRemaining).toBeNull();
    expect(result.current.pctComplete).toBe(0);
  });

  it('caps pctComplete at 100 when cumulative exceeds total', async () => {
    await seedActive();
    getStepHistory.mockResolvedValueOnce([200000]); // way past total
    const { result } = renderHook(() => useActiveGoal());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.pctComplete).toBe(100);
    expect(result.current.remainingSteps).toBe(0);
  });

  it('refresh() invalidates the cache and re-fetches', async () => {
    await seedActive();
    getStepHistory
      .mockResolvedValueOnce([1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000])
      .mockResolvedValueOnce([2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000]);
    const { result } = renderHook(() => useActiveGoal());
    await waitFor(() => expect(result.current.cumulativeSteps).toBe(9000));

    await act(async () => {
      await result.current.refresh();
    });
    await waitFor(() => expect(result.current.cumulativeSteps).toBe(18000));
    expect(getStepHistory).toHaveBeenCalledTimes(2);
  });

  it('hits the module-level cache on a subsequent mount within TTL', async () => {
    await seedActive();
    getStepHistory.mockResolvedValueOnce([3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000]);
    const first = renderHook(() => useActiveGoal());
    await waitFor(() => expect(first.result.current.cumulativeSteps).toBe(27000));

    const second = renderHook(() => useActiveGoal());
    await waitFor(() => expect(second.result.current.cumulativeSteps).toBe(27000));
    expect(getStepHistory).toHaveBeenCalledTimes(1);
  });

  it('surfaces a step-history fetch error', async () => {
    await seedActive();
    getStepHistory.mockRejectedValueOnce(new Error('Network down'));
    const { result } = renderHook(() => useActiveGoal());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeDefined();
    expect(result.current.error.message).toBe('Network down');
  });
});
