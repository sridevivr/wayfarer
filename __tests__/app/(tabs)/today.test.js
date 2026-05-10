import { fireEvent, render } from '@testing-library/react-native';

import TodayScreen from '../../../app/(tabs)/today';
import useActiveGoal from '../../../hooks/useActiveGoal';
import useFitbit from '../../../hooks/useFitbit';

jest.mock('../../../hooks/useActiveGoal');
jest.mock('../../../hooks/useFitbit');

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const ACTIVE_GOAL = {
  goal: {
    origin: { name: 'Boston, MA', address: 'Boston, MA, USA', lat: 42.36, lng: -71.06, placeId: 'b' },
    destination: { name: 'Acadia, ME', address: 'Bar Harbor, ME, USA', lat: 44.34, lng: -68.27, placeId: 'a' },
    route: { label: 'Fastest', distanceMeters: 100000, polyline: [] },
    status: 'active',
    createdAt: '2026-04-21T00:00:00.000Z',
  },
  isActive: true,
  loading: false,
  error: null,
  daysActive: 9,
  cumulativeSteps: 45000,
  totalSteps: 136702,
  remainingSteps: 91702,
  pctComplete: 33,
  daysRemaining: 16,
  refresh: jest.fn(),
};

beforeEach(() => {
  mockNavigate.mockClear();
  useActiveGoal.mockReset();
  useFitbit.mockReset();
  useFitbit.mockReturnValue({
    connected: true, loading: false, error: null,
    todaySteps: 7421, dailyAverage: 6000, dailyAveragePct: 124,
    strideStepsPerMile: 2200,
    refresh: jest.fn(), disconnect: jest.fn(),
  });
});

describe('TodayScreen — active goal', () => {
  beforeEach(() => useActiveGoal.mockReturnValue(ACTIVE_GOAL));

  it('hero shows real destination name and days remaining', () => {
    const { getByText } = render(<TodayScreen />);
    expect(getByText('On your way to Acadia')).toBeTruthy();
    expect(getByText('16 days to go')).toBeTruthy();
  });

  it('Today tile shows real Fitbit step count', () => {
    const { getByText } = render(<TodayScreen />);
    expect(getByText('7,421')).toBeTruthy();
  });

  it('Days Left tile shows real daysRemaining', () => {
    const { getByText } = render(<TodayScreen />);
    expect(getByText('16')).toBeTruthy();
    expect(getByText('to destination')).toBeTruthy();
  });

  it('Days Left tile shows — when daysRemaining is null', () => {
    useActiveGoal.mockReturnValue({ ...ACTIVE_GOAL, daysRemaining: null });
    const { getByText } = render(<TodayScreen />);
    expect(getByText('—')).toBeTruthy();
    expect(getByText('Calibrating pace…')).toBeTruthy();
  });

  it('route preview footer shows real origin and destination short names', () => {
    const { getByText } = render(<TodayScreen />);
    expect(getByText('Boston → Acadia')).toBeTruthy();
  });

  it('Open map link navigates to Journey', () => {
    const { getByText } = render(<TodayScreen />);
    fireEvent.press(getByText('Open map →'));
    expect(mockNavigate).toHaveBeenCalledWith('Journey');
  });

  it('does NOT show "Set a destination" CTA when there is an active goal', () => {
    const { queryByText } = render(<TodayScreen />);
    expect(queryByText('Set a destination →')).toBeNull();
  });
});

describe('TodayScreen — no active goal', () => {
  beforeEach(() => {
    useActiveGoal.mockReturnValue({
      goal: null, isActive: false, loading: false, error: null,
      daysActive: null, cumulativeSteps: null, totalSteps: null,
      remainingSteps: null, pctComplete: null, daysRemaining: null,
      refresh: jest.fn(),
    });
  });

  it('renders the empty greeting and "Set a destination" CTA', () => {
    const { getByText } = render(<TodayScreen />);
    expect(getByText('No active goal yet.')).toBeTruthy();
    expect(getByText('Set a destination →')).toBeTruthy();
  });

  it('CTA navigates into GoalSetup at the Origin screen', () => {
    const { getByTestId } = render(<TodayScreen />);
    fireEvent.press(getByTestId('empty-set-destination'));
    expect(mockNavigate).toHaveBeenCalledWith('GoalSetup', { screen: 'Origin' });
  });

  it('does NOT render hero or stat tiles', () => {
    const { queryByText } = render(<TodayScreen />);
    expect(queryByText('On your way to Acadia')).toBeNull();
    expect(queryByText('Days left')).toBeNull();
  });
});
