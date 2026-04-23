import { render, fireEvent } from '@testing-library/react-native';
import OnboardHomeScreen, { matchesSuggestion } from '../../../app/onboarding/onboard-home';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

beforeEach(() => mockNavigate.mockClear());

describe('matchesSuggestion', () => {
  it('matches when the city substring appears in the value', () => {
    expect(matchesSuggestion('Hanover, New Hampshire', 'Hanover, NH')).toBe(true);
    expect(matchesSuggestion('hanover nh', 'Hanover, NH')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(matchesSuggestion('BOSTON', 'Boston, MA')).toBe(true);
  });

  it('returns false when the city does not appear', () => {
    expect(matchesSuggestion('Portland, OR', 'Boston, MA')).toBe(false);
  });

  it('returns false for empty/null input', () => {
    expect(matchesSuggestion('', 'Boston, MA')).toBe(false);
    expect(matchesSuggestion(null, 'Boston, MA')).toBe(false);
    expect(matchesSuggestion(undefined, 'Boston, MA')).toBe(false);
  });
});

describe('OnboardHomeScreen', () => {
  it('seeds the hometown input with Hanover and shows Continue enabled', () => {
    const { getByDisplayValue, getByText } = render(<OnboardHomeScreen />);
    expect(getByDisplayValue('Hanover, New Hampshire')).toBeTruthy();
    fireEvent.press(getByText('Continue'));
    expect(mockNavigate).toHaveBeenCalledWith('OnboardPlaces');
  });

  it('selecting a suggestion populates the input', () => {
    const { getByText, getByDisplayValue } = render(<OnboardHomeScreen />);
    fireEvent.press(getByText('Boston, MA'));
    expect(getByDisplayValue('Boston, MA')).toBeTruthy();
  });

  it('disables Continue when the input is cleared', () => {
    const { getByDisplayValue, getByRole } = render(<OnboardHomeScreen />);
    expect(getByRole('button', { name: 'Continue' }).props.accessibilityState).toEqual({
      disabled: false,
    });
    fireEvent.changeText(getByDisplayValue('Hanover, New Hampshire'), '');
    expect(getByRole('button', { name: 'Continue' }).props.accessibilityState).toEqual({
      disabled: true,
    });
  });
});
