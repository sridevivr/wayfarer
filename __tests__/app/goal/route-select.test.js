import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import RouteSelectScreen from '../../../app/goal/route-select';
import { getDirections } from '../../../services/directions';
import { getActiveGoal, setActiveGoal } from '../../../storage/goalStore';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('../../../services/directions', () => ({
  __esModule: true,
  getDirections: jest.fn(),
}));

// react-native-maps reaches into native code on import. Stub MapView +
// Polyline with passthrough Views so the render tree stays inspectable.
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

const ROUTES = [
  {
    label: 'Fastest',
    summary: 'I-95',
    distanceMeters: 100000,
    durationSeconds: 6000,
    polyline: [{ lat: 42.36, lng: -71.06 }, { lat: 44.34, lng: -68.27 }],
  },
  {
    label: 'Medium',
    summary: 'US-1',
    distanceMeters: 110000,
    durationSeconds: 7000,
    polyline: [{ lat: 42.36, lng: -71.06 }, { lat: 43.5, lng: -69.5 }, { lat: 44.34, lng: -68.27 }],
  },
  {
    label: 'Longest',
    summary: 'Scenic',
    distanceMeters: 130000,
    durationSeconds: 8000,
    polyline: [{ lat: 42.36, lng: -71.06 }, { lat: 44.34, lng: -68.27 }],
  },
];

async function seedGoal() {
  await setActiveGoal({
    origin: { name: 'Boston', address: 'Boston, MA, USA', lat: 42.36, lng: -71.06, placeId: 'b' },
    destination: {
      name: 'Acadia',
      address: 'Bar Harbor, ME, USA',
      lat: 44.34,
      lng: -68.27,
      placeId: 'a',
    },
    route: null,
    status: 'draft',
    createdAt: '2026-04-29T00:00:00.000Z',
  });
}

beforeEach(() => {
  AsyncStorage.clear();
  mockNavigate.mockClear();
  getDirections.mockReset();
});

describe('RouteSelectScreen', () => {
  it('shows the loading state while fetching', async () => {
    await seedGoal();
    let resolveFn;
    const pending = new Promise((r) => {
      resolveFn = r;
    });
    getDirections.mockReturnValueOnce(pending);
    const { findByTestId, queryByTestId } = render(<RouteSelectScreen />);
    // Loading is the initial state; assert via findByTestId so we
    // wait through the synchronous + microtask render path.
    expect(await findByTestId('route-select-loading')).toBeTruthy();
    await act(async () => {
      resolveFn(ROUTES);
    });
    await waitFor(() => expect(queryByTestId('route-select-loading')).toBeNull());
  });

  it('renders 3 routes with labels and the map after fetch resolves', async () => {
    await seedGoal();
    getDirections.mockResolvedValueOnce(ROUTES);
    const { findByTestId, findByText, getAllByTestId } = render(<RouteSelectScreen />);
    expect(await findByTestId('route-map')).toBeTruthy();
    expect(await findByText('Fastest')).toBeTruthy();
    expect(await findByText('Medium')).toBeTruthy();
    expect(await findByText('Longest')).toBeTruthy();
    // One Polyline per route.
    expect(getAllByTestId('Polyline')).toHaveLength(3);
  });

  it('Continue persists the chosen route and navigates to GoalConfirm', async () => {
    await seedGoal();
    getDirections.mockResolvedValueOnce(ROUTES);
    const { findByTestId, getByText } = render(<RouteSelectScreen />);
    // Select the second (Medium) route.
    fireEvent.press(await findByTestId('route-row-1'));
    await act(async () => {
      fireEvent.press(getByText('Continue'));
    });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('GoalConfirm'));
    const goal = await getActiveGoal();
    expect(goal.route.label).toBe('Medium');
    expect(goal.route.distanceMeters).toBe(110000);
    // Other fields survived the merge.
    expect(goal.origin.name).toBe('Boston');
    expect(goal.destination.name).toBe('Acadia');
    expect(goal.status).toBe('draft');
  });

  it('Continue defaults to the first route when the user does not tap one', async () => {
    await seedGoal();
    getDirections.mockResolvedValueOnce(ROUTES);
    const { findByText, getByText } = render(<RouteSelectScreen />);
    await findByText('Fastest');
    await act(async () => {
      fireEvent.press(getByText('Continue'));
    });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('GoalConfirm'));
    expect((await getActiveGoal()).route.label).toBe('Fastest');
  });

  it('renders an error + Retry, and Retry triggers a re-fetch that succeeds', async () => {
    await seedGoal();
    getDirections
      .mockRejectedValueOnce(new Error('Network down'))
      .mockResolvedValueOnce(ROUTES);
    const { findByTestId, findByText, queryByTestId, getByText } = render(<RouteSelectScreen />);
    expect(await findByTestId('route-select-error')).toBeTruthy();
    expect(await findByText(/Network down/)).toBeTruthy();
    await act(async () => {
      fireEvent.press(getByText('Retry'));
    });
    await waitFor(() => expect(queryByTestId('route-select-error')).toBeNull());
    expect(await findByText('Fastest')).toBeTruthy();
    expect(getDirections).toHaveBeenCalledTimes(2);
  });

  it('renders an empty state when getDirections returns no routes', async () => {
    await seedGoal();
    getDirections.mockResolvedValueOnce([]);
    const { findByText } = render(<RouteSelectScreen />);
    expect(await findByText(/No routes found/)).toBeTruthy();
  });

  it('shows an error if no draft goal exists', async () => {
    // No seedGoal → getActiveGoal returns null
    const { findByTestId } = render(<RouteSelectScreen />);
    expect(await findByTestId('route-select-error')).toBeTruthy();
    expect(getDirections).not.toHaveBeenCalled();
  });
});
