import { act, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

import useFitbit, { _resetCacheForTests } from '../../hooks/useFitbit';
import * as fitbit from '../../services/fitbit';
import { saveTokens } from '../../storage/secureStore';

jest.mock('../../services/fitbit', () => ({
  __esModule: true,
  getProfile: jest.fn(),
  getTodaySteps: jest.fn(),
  getStepHistory: jest.fn(),
  localISODate: () => '2026-04-24',
}));

function Probe({ onState }) {
  const fb = useFitbit();
  onState(fb);
  return <Text>{fb.connected ? 'on' : 'off'}</Text>;
}

async function flush() {
  // Two ticks: one for the token-read effect, one for the fetch promise.
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  SecureStore.__reset();
  AsyncStorage.clear();
  _resetCacheForTests();
  fitbit.getProfile.mockReset();
  fitbit.getTodaySteps.mockReset();
  fitbit.getStepHistory.mockReset();
});

describe('useFitbit', () => {
  it('reports disconnected when no tokens are stored', async () => {
    let last;
    render(<Probe onState={(s) => (last = s)} />);
    await flush();
    expect(last.connected).toBe(false);
    expect(last.loading).toBe(false);
    expect(fitbit.getProfile).not.toHaveBeenCalled();
  });

  it('fetches all three endpoints and exposes derived values when connected', async () => {
    await saveTokens({ access: 'A', refresh: 'R' });
    fitbit.getProfile.mockResolvedValue({ strideLengthCm: 71.6, displayName: 'T' });
    fitbit.getTodaySteps.mockResolvedValue({ steps: 7000 });
    fitbit.getStepHistory.mockResolvedValue([5000, 6000, 7000, 8000, 9000]);

    let last;
    render(<Probe onState={(s) => (last = s)} />);
    await flush();

    expect(last.connected).toBe(true);
    expect(last.todaySteps).toBe(7000);
    expect(last.dailyAverage).toBe(7000); // mean of the array
    expect(last.dailyAveragePct).toBe(100); // 7000 / 7000 * 100
    expect(last.strideStepsPerMile).toBe(Math.round(160934 / 71.6));
    expect(last.loading).toBe(false);
  });

  it('clamps dailyAveragePct to 100 when steps exceed the average', async () => {
    await saveTokens({ access: 'A', refresh: 'R' });
    fitbit.getProfile.mockResolvedValue({ strideLengthCm: 70 });
    fitbit.getTodaySteps.mockResolvedValue({ steps: 20000 });
    fitbit.getStepHistory.mockResolvedValue([5000, 5000, 5000]);

    let last;
    render(<Probe onState={(s) => (last = s)} />);
    await flush();
    expect(last.dailyAveragePct).toBe(100);
  });

  it('caches results across mounts (no second round-trip within TTL)', async () => {
    await saveTokens({ access: 'A', refresh: 'R' });
    fitbit.getProfile.mockResolvedValue({ strideLengthCm: 70 });
    fitbit.getTodaySteps.mockResolvedValue({ steps: 1000 });
    fitbit.getStepHistory.mockResolvedValue([1000, 1000]);

    const { unmount } = render(<Probe onState={() => {}} />);
    await flush();
    unmount();

    let last;
    render(<Probe onState={(s) => (last = s)} />);
    await flush();

    expect(last.todaySteps).toBe(1000);
    expect(fitbit.getTodaySteps).toHaveBeenCalledTimes(1);
  });

  it('disconnect clears cache and storage', async () => {
    await saveTokens({ access: 'A', refresh: 'R' });
    fitbit.getProfile.mockResolvedValue({ strideLengthCm: 70 });
    fitbit.getTodaySteps.mockResolvedValue({ steps: 1234 });
    fitbit.getStepHistory.mockResolvedValue([1000]);

    let last;
    render(<Probe onState={(s) => (last = s)} />);
    await flush();
    expect(last.connected).toBe(true);

    await act(async () => {
      await last.disconnect();
    });
    expect(last.connected).toBe(false);
    expect(last.todaySteps).toBeNull();
  });
});
