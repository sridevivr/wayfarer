import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import GoalConfirmScreen from '../../../app/goal/goal-confirm';
import useFitbit from '../../../hooks/useFitbit';
import { getActiveGoal, setActiveGoal } from '../../../storage/goalStore';

jest.mock('../../../hooks/useFitbit');

const mockGoBack = jest.fn();
const mockParentGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    getParent: () => ({ goBack: mockParentGoBack }),
  }),
}));

const ROUTE = {
  label: 'Fastest',
  summary: 'I-95',
  distanceMeters: 100000, // ~62 mi
  durationSeconds: 6000,
  polyline: [],
};

async function seedDraft(extras = {}) {
  await setActiveGoal({
    origin: { name: 'Boston', address: 'Boston, MA, USA', lat: 42.36, lng: -71.06, placeId: 'b' },
    destination: { name: 'Acadia', address: 'Bar Harbor, ME, USA', lat: 44.34, lng: -68.27, placeId: 'a' },
    route: ROUTE,
    status: 'draft',
    createdAt: '2026-04-29T00:00:00.000Z',
    ...extras,
  });
}

beforeEach(() => {
  AsyncStorage.clear();
  mockGoBack.mockClear();
  mockParentGoBack.mockClear();
  useFitbit.mockReset();
  useFitbit.mockReturnValue({
    connected: true, loading: false, error: null,
    todaySteps: 7000, dailyAverage: 6000, dailyAveragePct: 116,
    strideStepsPerMile: 2200,
    refresh: jest.fn(), disconnect: jest.fn(),
  });
});

describe('GoalConfirmScreen', () => {
  it('renders the summary with computed distance, total steps, and projected days', async () => {
    await seedDraft();
    const { findByText, getByTestId } = render(<GoalConfirmScreen />);
    expect(await findByText('Boston')).toBeTruthy();
    expect(getByTestId('goal-confirm-summary')).toBeTruthy();
    expect(await findByText('Acadia')).toBeTruthy();
    expect(await findByText(/Fastest/)).toBeTruthy();
    // 100,000 m ≈ 62 mi.
    expect(await findByText('62')).toBeTruthy();
    // 62.137 * 2200 ≈ 136,702 steps.
    expect(await findByText('136,702')).toBeTruthy();
    // ceil(136702 / 6000) = 23 days.
    expect(await findByText('~23')).toBeTruthy();
  });

  it('shows — for projected days when dailyAverage is zero', async () => {
    useFitbit.mockReturnValue({
      connected: true, loading: false, error: null,
      todaySteps: 0, dailyAverage: 0, dailyAveragePct: 0,
      strideStepsPerMile: 2200,
      refresh: jest.fn(), disconnect: jest.fn(),
    });
    await seedDraft();
    const { findByText } = render(<GoalConfirmScreen />);
    await findByText('Boston');
    expect(await findByText('—')).toBeTruthy();
  });

  it('Start walking flips the goal to active and dismisses the modal', async () => {
    await seedDraft();
    const { findByText } = render(<GoalConfirmScreen />);
    const cta = await findByText('Start walking');
    await act(async () => {
      fireEvent.press(cta);
    });
    await waitFor(() => expect(mockParentGoBack).toHaveBeenCalled());
    const goal = await getActiveGoal();
    expect(goal.status).toBe('active');
    expect(goal.origin.name).toBe('Boston');
    expect(goal.destination.name).toBe('Acadia');
  });

  it('renders an error when no draft goal exists', async () => {
    // No seedDraft — storage is empty.
    const { findByText } = render(<GoalConfirmScreen />);
    expect(await findByText(/Something's missing/)).toBeTruthy();
    expect(await findByText(/restart goal setup/)).toBeTruthy();
  });
});
