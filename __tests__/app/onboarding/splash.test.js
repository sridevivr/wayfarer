import { render, fireEvent } from '@testing-library/react-native';
import SplashScreen from '../../../app/onboarding/splash';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

beforeEach(() => mockNavigate.mockClear());

describe('SplashScreen', () => {
  it('renders the hero title and tagline', () => {
    const { getByText } = render(<SplashScreen />);
    expect(getByText('Wayfarer')).toBeTruthy();
    expect(getByText(/Turn your daily steps/)).toBeTruthy();
  });

  it('primary CTA navigates to FitbitConnect', () => {
    const { getByText } = render(<SplashScreen />);
    fireEvent.press(getByText('Begin your journey'));
    expect(mockNavigate).toHaveBeenCalledWith('FitbitConnect');
  });

  it('secondary CTA skips to Main', () => {
    const { getByText } = render(<SplashScreen />);
    fireEvent.press(getByText('I already have an account'));
    expect(mockNavigate).toHaveBeenCalledWith('Main');
  });
});
