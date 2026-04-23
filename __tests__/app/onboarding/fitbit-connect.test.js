import { render, fireEvent } from '@testing-library/react-native';
import FitbitConnectScreen from '../../../app/onboarding/fitbit-connect';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

beforeEach(() => mockNavigate.mockClear());

describe('FitbitConnectScreen', () => {
  it('renders step label and the three access items', () => {
    const { getByText } = render(<FitbitConnectScreen />);
    expect(getByText('Step 1 of 5')).toBeTruthy();
    expect(getByText('Connect your Fitbit')).toBeTruthy();
    expect(getByText('Daily step count')).toBeTruthy();
    expect(getByText('Stride length')).toBeTruthy();
    expect(getByText('30-day step history')).toBeTruthy();
  });

  it('Connect CTA advances to StrideConfirm', () => {
    const { getByText } = render(<FitbitConnectScreen />);
    fireEvent.press(getByText('Connect Fitbit'));
    expect(mockNavigate).toHaveBeenCalledWith('StrideConfirm');
  });
});
