import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import OriginScreen from '../../../app/goal/origin';
import {
  getActiveGoal,
  getLastOrigin,
  setLastOrigin,
} from '../../../storage/goalStore';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// Stub PlaceAutocomplete with a Pressable that calls onSelect with a
// canned PlaceObject when tapped. Tests don't need to exercise the real
// autocomplete network behaviour — that's covered by its own suite.
jest.mock('../../../components/PlaceAutocomplete', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ onSelect, initialQuery, testID }) =>
      React.createElement(
        Pressable,
        {
          testID: testID ?? 'mock-autocomplete',
          onPress: () =>
            onSelect({
              name: 'Selected City',
              address: 'Selected City, MA, USA',
              lat: 42,
              lng: -71,
              placeId: 'sel-id',
            }),
        },
        React.createElement(Text, null, `initialQuery=${initialQuery ?? ''}`)
      ),
  };
});

beforeEach(() => {
  AsyncStorage.clear();
  mockNavigate.mockClear();
});

describe('OriginScreen', () => {
  it('renders the flow label and title', () => {
    const { getByText } = render(<OriginScreen />);
    expect(getByText('Goal setup · 1 of 3')).toBeTruthy();
    expect(getByText('Where are you starting from?')).toBeTruthy();
  });

  it('Continue does nothing until a place is selected', async () => {
    const { getByText } = render(<OriginScreen />);
    await act(async () => {
      fireEvent.press(getByText('Continue'));
    });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(await getActiveGoal()).toBeNull();
  });

  it('pre-fills the autocomplete from lastOrigin', async () => {
    await setLastOrigin({
      name: 'Cambridge',
      address: 'Cambridge, MA, USA',
      lat: 42.37,
      lng: -71.11,
      placeId: 'cambridge-id',
    });
    const { findByText } = render(<OriginScreen />);
    expect(await findByText('initialQuery=Cambridge')).toBeTruthy();
  });

  it('on Continue: persists draft + lastOrigin, navigates to Destination', async () => {
    const { getByText, getByTestId } = render(<OriginScreen />);
    await act(async () => {
      fireEvent.press(getByTestId('origin-autocomplete'));
    });
    await act(async () => {
      fireEvent.press(getByText('Continue'));
    });

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('Destination'));
    const goal = await getActiveGoal();
    expect(goal).toMatchObject({
      origin: { name: 'Selected City', placeId: 'sel-id' },
      destination: null,
      route: null,
      status: 'draft',
    });
    expect(goal.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(await getLastOrigin()).toMatchObject({ name: 'Selected City' });
  });
});
