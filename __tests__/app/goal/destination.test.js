import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import DestinationScreen from '../../../app/goal/destination';
import { getActiveGoal, setActiveGoal } from '../../../storage/goalStore';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockParentGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    getParent: () => ({ goBack: mockParentGoBack }),
  }),
}));

jest.mock('../../../components/PlaceAutocomplete', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ onSelect, testID }) =>
      React.createElement(
        Pressable,
        {
          testID: testID ?? 'mock-autocomplete',
          onPress: () =>
            onSelect({
              name: 'Free Search Pick',
              address: 'Free Search Pick, NY, USA',
              lat: 40,
              lng: -74,
              placeId: 'free-id',
            }),
        },
        React.createElement(Text, null, 'mock-autocomplete')
      ),
  };
});

const massOrigin = {
  name: 'Boston',
  address: 'Boston, MA, USA',
  lat: 42.36,
  lng: -71.06,
  placeId: 'boston-id',
};

const texasOrigin = {
  name: 'Austin',
  address: 'Austin, TX, USA',
  lat: 30.27,
  lng: -97.74,
  placeId: 'austin-id',
};

beforeEach(() => {
  AsyncStorage.clear();
  mockNavigate.mockClear();
  mockGoBack.mockClear();
  mockParentGoBack.mockClear();
});

async function seedGoal(origin) {
  await setActiveGoal({
    origin,
    destination: null,
    route: null,
    status: 'draft',
    createdAt: '2026-04-29T00:00:00.000Z',
  });
}

describe('DestinationScreen', () => {
  it('renders the flow label and title', async () => {
    await seedGoal(massOrigin);
    const { findByText } = render(<DestinationScreen />);
    expect(await findByText('Goal setup · 2 of 3')).toBeTruthy();
    expect(await findByText('Where do you want to walk to?')).toBeTruthy();
  });

  it('shows region suggestions when origin matches a covered state', async () => {
    await seedGoal(massOrigin);
    const { findByText, findByTestId } = render(<DestinationScreen />);
    expect(await findByTestId('suggestions-wrap')).toBeTruthy();
    expect(await findByText('Acadia National Park')).toBeTruthy();
    expect(await findByText('Newport')).toBeTruthy();
    expect(await findByText('Cape Cod')).toBeTruthy();
  });

  it('hides region suggestions when origin is in an unmapped state', async () => {
    await seedGoal(texasOrigin);
    const { queryByTestId, findByText } = render(<DestinationScreen />);
    // Wait for the origin-driven copy to land so the effect has run.
    await findByText(/From Austin/);
    expect(queryByTestId('suggestions-wrap')).toBeNull();
  });

  it('selecting a suggestion persists destination and navigates to RouteSelect', async () => {
    await seedGoal(massOrigin);
    const { findByTestId } = render(<DestinationScreen />);
    const acadia = await findByTestId('suggestion-acadia-suggestion');
    await act(async () => {
      fireEvent.press(acadia);
    });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('RouteSelect'));
    const goal = await getActiveGoal();
    expect(goal.destination.name).toBe('Acadia National Park');
    expect(goal.origin.name).toBe('Boston');
    expect(goal.status).toBe('draft');
    expect(mockParentGoBack).not.toHaveBeenCalled();
  });

  it('selecting a free-search result persists destination and navigates to RouteSelect', async () => {
    await seedGoal(texasOrigin);
    const { findByTestId } = render(<DestinationScreen />);
    const auto = await findByTestId('destination-autocomplete');
    await act(async () => {
      fireEvent.press(auto);
    });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('RouteSelect'));
    const goal = await getActiveGoal();
    expect(goal.destination.name).toBe('Free Search Pick');
    expect(goal.origin.name).toBe('Austin');
  });
});
