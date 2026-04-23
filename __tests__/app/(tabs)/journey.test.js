import { render, fireEvent } from '@testing-library/react-native';
import JourneyScreen from '../../../app/(tabs)/journey';
import { mockJourney } from '../../../constants/mockData';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

beforeEach(() => mockNavigate.mockClear());

describe('JourneyScreen', () => {
  it('renders header, current location and percent tag', () => {
    const { getByText } = render(<JourneyScreen />);
    expect(getByText('Your Journey')).toBeTruthy();
    expect(getByText('Currently in')).toBeTruthy();
    expect(getByText(mockJourney.goal.currentLocation)).toBeTruthy();
    expect(getByText(`${mockJourney.pctComplete}% complete`)).toBeTruthy();
  });

  it('Stats link pushes JourneyStats', () => {
    const { getByText } = render(<JourneyScreen />);
    fireEvent.press(getByText('Stats →'));
    expect(mockNavigate).toHaveBeenCalledWith('JourneyStats');
  });

  it('Story-waiting card pushes StoryCard with the unread id', () => {
    const { getByText } = render(<JourneyScreen />);
    const unread = mockJourney.storyCards.find((s) => !s.read);
    fireEvent.press(getByText(`◈ Story waiting — ${unread.title}`));
    expect(mockNavigate).toHaveBeenCalledWith('StoryCard', { id: unread.id });
  });

  it('renders all upcoming landmarks', () => {
    const { getByText } = render(<JourneyScreen />);
    mockJourney.upcoming.forEach((p) => {
      expect(getByText(p.name)).toBeTruthy();
    });
  });
});
