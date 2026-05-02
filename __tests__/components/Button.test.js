import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../components/Button';

describe('Button', () => {
  it('renders the label', () => {
    const { getByText } = render(<Button label="Begin your journey" />);
    expect(getByText('Begin your journey')).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Continue" onPress={onPress} />);
    fireEvent.press(getByText('Continue'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Continue" onPress={onPress} disabled />);
    fireEvent.press(getByText('Continue'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('reflects disabled state on the accessibility role', () => {
    const { getByRole } = render(<Button label="Continue" disabled />);
    expect(getByRole('button').props.accessibilityState).toEqual({ disabled: true });
  });

  it('renders secondary and ghost variants without crashing', () => {
    const { getByText, rerender } = render(<Button label="X" variant="secondary" />);
    expect(getByText('X')).toBeTruthy();
    rerender(<Button label="X" variant="ghost" />);
    expect(getByText('X')).toBeTruthy();
  });
});
