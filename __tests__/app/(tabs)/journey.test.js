import { fireEvent, render } from '@testing-library/react-native';

import JourneyScreen from '../../../app/(tabs)/journey';
import { mockJourney } from '../../../constants/mockData';
import useActiveGoal from '../../../hooks/useActiveGoal';

jest.mock('../../../hooks/useActiveGoal');

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// Same react-native-maps stub as route-select.test.js — passthrough Views.
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const stub = (name) => {
    const C = ({ children, ...rest }) =>
      React.createElement(View, { testID: name, ...rest }, children);
    C.displayName = name;
    return C;
  };
  const MapView = stub('MapView');
  return {
    __esModule: true,
    default: MapView,
    MapView,
    Polyline: stub('Polyline'),
    Marker: stub('Marker'),
  };
});

const ACTIVE_GOAL = {
  goal: {
    origin: { name: 'Boston, MA', address: 'Boston, MA, USA', lat: 42.36, lng: -71.06, placeId: 'b' },
    destination: { name: 'Acadia, ME', address: 'Bar Harbor, ME, USA', lat: 44.34, lng: -68.27, placeId: 'a' },
    route: {
      label: 'Fastest',
      distanceMeters: 100000,
      polyline: [{ lat: 42.36, lng: -71.06 }, { lat: 44.34, lng: -68.27 }],
    },
    status: 'active',
    createdAt: '2026-04-21T00:00:00.000Z',
  },
  isActive: true,
  loading: false,
  error: null,
  pctComplete: 33,
  daysRemaining: 16,
  refresh: jest.fn(),
};

beforeEach(() => {
  mockNavigate.mockClear();
  useActiveGoal.mockReset();
});

describe('JourneyScreen — active goal', () => {
  beforeEach(() => useActiveGoal.mockReturnValue(ACTIVE_GOAL));

  it('renders the header, real destination text, and percent tag', () => {
    const { getByText } = render(<JourneyScreen />);
    expect(getByText('Your Journey')).toBeTruthy();
    expect(getByText('On your way to Acadia')).toBeTruthy();
    expect(getByText('33% complete')).toBeTruthy();
  });

  it('renders origin and destination short names in the progress row', () => {
    const { getByText } = render(<JourneyScreen />);
    expect(getByText('Boston')).toBeTruthy();
    expect(getByText('Acadia')).toBeTruthy();
  });

  it('renders MapView with a Polyline for the active route', () => {
    const { getByTestId, getAllByTestId } = render(<JourneyScreen />);
    expect(getByTestId('journey-map')).toBeTruthy();
    expect(getAllByTestId('Polyline')).toHaveLength(1);
  });

  it('Stats link pushes JourneyStats', () => {
    const { getByText } = render(<JourneyScreen />);
    fireEvent.press(getByText('Stats →'));
    expect(mockNavigate).toHaveBeenCalledWith('JourneyStats');
  });

  it('Story-waiting card pushes StoryCard with the unread id', () => {
    const { getByText } = render(<JourneyScreen />);
    const unread = mockJourney.storyCards.find((s) => !s.read);
    fireEvent.press(getByText(`◈ Story waiting — ${unread.title}`));
    expect(mockNavigate).toHaveBeenCalledWith('StoryCard', { id: unread.id });
  });

  it('renders all upcoming landmarks (still mock until M8)', () => {
    const { getByText } = render(<JourneyScreen />);
    mockJourney.upcoming.forEach((p) => {
      expect(getByText(p.name)).toBeTruthy();
    });
  });

  it('does NOT render the legacy "Currently in" / currentLocation copy', () => {
    const { queryByText } = render(<JourneyScreen />);
    expect(queryByText('Currently in')).toBeNull();
    expect(queryByText('Columbus, Ohio')).toBeNull();
  });
});

describe('JourneyScreen — no active goal', () => {
  beforeEach(() => {
    useActiveGoal.mockReturnValue({
      goal: null, isActive: false, loading: false, error: null,
      pctComplete: null, daysRemaining: null,
      refresh: jest.fn(),
    });
  });

  it('renders the empty state with the "Set a destination" CTA', () => {
    const { getByText } = render(<JourneyScreen />);
    expect(getByText('Nothing to map yet.')).toBeTruthy();
    expect(getByText('Set a destination →')).toBeTruthy();
  });

  it('CTA navigates into GoalSetup at the Origin screen', () => {
    const { getByTestId } = render(<JourneyScreen />);
    fireEvent.press(getByTestId('empty-set-destination'));
    expect(mockNavigate).toHaveBeenCalledWith('GoalSetup', { screen: 'Origin' });
  });

  it('does NOT render the map or progress bar', () => {
    const { queryByTestId } = render(<JourneyScreen />);
    expect(queryByTestId('journey-map')).toBeNull();
  });
});
