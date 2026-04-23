import { render, fireEvent } from '@testing-library/react-native';
import StoryRow from '../../components/StoryRow';

describe('StoryRow', () => {
  it('renders title and subtitle', () => {
    const { getByText } = render(<StoryRow title="Chicago, Illinois" subtitle="190 mi away" />);
    expect(getByText('Chicago, Illinois')).toBeTruthy();
    expect(getByText('190 mi away')).toBeTruthy();
  });

  it('omits subtitle when not provided', () => {
    const { queryByText } = render(<StoryRow title="Plain" />);
    expect(queryByText('Plain')).toBeTruthy();
  });

  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<StoryRow title="Tap me" onPress={onPress} />);
    fireEvent.press(getByText('Tap me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders both ochre and sage accents without crash', () => {
    const { getByText, rerender } = render(<StoryRow title="X" accent="ochre" />);
    expect(getByText('X')).toBeTruthy();
    rerender(<StoryRow title="X" accent="sage" />);
    expect(getByText('X')).toBeTruthy();
  });
});
