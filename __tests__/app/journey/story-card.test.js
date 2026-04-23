import { render, fireEvent } from '@testing-library/react-native';
import StoryCardScreen from '../../../app/journey/story-card';
import { mockJourney } from '../../../constants/mockData';

const mockNavigate = jest.fn();
let mockParams = {};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({ params: mockParams }),
}));

beforeEach(() => {
  mockNavigate.mockClear();
  mockParams = {};
});

describe('StoryCardScreen', () => {
  it('renders the unread story when no id is passed', () => {
    const unread = mockJourney.storyCards.find((s) => !s.read);
    const { getByText } = render(<StoryCardScreen />);
    expect(getByText(unread.title)).toBeTruthy();
    expect(getByText(unread.locationName)).toBeTruthy();
  });

  it('renders the story matched by id param', () => {
    const target = mockJourney.storyCards.find((s) => s.read);
    mockParams = { id: target.id };
    const { getByText } = render(<StoryCardScreen />);
    expect(getByText(target.title)).toBeTruthy();
  });

  it('shows the days / miles / to-go stat tiles', () => {
    const { getByText } = render(<StoryCardScreen />);
    expect(getByText('Days')).toBeTruthy();
    expect(getByText('Miles')).toBeTruthy();
    expect(getByText('To go')).toBeTruthy();
    expect(getByText(String(mockJourney.goal.daysActive))).toBeTruthy();
  });

  it('Keep walking CTA pops back to the Journey tab', () => {
    const { getByText } = render(<StoryCardScreen />);
    fireEvent.press(getByText('Keep walking →'));
    expect(mockNavigate).toHaveBeenCalledWith('Main', { screen: 'Journey' });
  });
});
