import { render, fireEvent } from '@testing-library/react-native';
import StrideConfirmScreen from '../../../app/onboarding/stride-confirm';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

beforeEach(() => mockNavigate.mockClear());

describe('StrideConfirmScreen', () => {
  it('renders the mocked stride value', () => {
    const { getByText } = render(<StrideConfirmScreen />);
    expect(getByText('Step 2 of 5')).toBeTruthy();
    expect(getByText('Your stride length')).toBeTruthy();
    expect(getByText('2,246')).toBeTruthy();
    expect(getByText('steps per mile')).toBeTruthy();
  });

  it('both CTAs advance to OnboardHome', () => {
    const { getByText } = render(<StrideConfirmScreen />);
    fireEvent.press(getByText('Looks right'));
    expect(mockNavigate).toHaveBeenLastCalledWith('OnboardHome');
    fireEvent.press(getByText('Adjust'));
    expect(mockNavigate).toHaveBeenLastCalledWith('OnboardHome');
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });
});
