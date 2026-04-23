import { render, fireEvent } from '@testing-library/react-native';
import OnboardPlacesScreen from '../../../app/onboarding/onboard-places';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

beforeEach(() => mockNavigate.mockClear());

describe('OnboardPlacesScreen', () => {
  it('renders all three slots with the expected seed values', () => {
    const { getByDisplayValue, getByText } = render(<OnboardPlacesScreen />);
    expect(getByText('Destination 1')).toBeTruthy();
    expect(getByText('Destination 2')).toBeTruthy();
    expect(getByText('Destination 3')).toBeTruthy();
    expect(getByDisplayValue('San Francisco, CA')).toBeTruthy();
    expect(getByDisplayValue('Yellowstone National Park')).toBeTruthy();
  });

  it("Let's go CTA navigates to Main when at least one slot is filled", () => {
    const { getByText } = render(<OnboardPlacesScreen />);
    fireEvent.press(getByText("Let's go →"));
    expect(mockNavigate).toHaveBeenCalledWith('Main');
  });

  it('disables primary CTA when every slot is empty, Skip still works', () => {
    const { getAllByPlaceholderText, getByText, getByRole } = render(<OnboardPlacesScreen />);
    const inputs = getAllByPlaceholderText('Search a city or landmark...');
    inputs.forEach((input) => fireEvent.changeText(input, ''));

    expect(getByRole('button', { name: "Let's go →" }).props.accessibilityState).toEqual({
      disabled: true,
    });

    fireEvent.press(getByText('Skip for now'));
    expect(mockNavigate).toHaveBeenCalledWith('Main');
  });
});
