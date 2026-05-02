import { render, fireEvent } from '@testing-library/react-native';
import TodayScreen from '../../../app/(tabs)/today';
import { mockJourney } from '../../../constants/mockData';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

beforeEach(() => mockNavigate.mockClear());

describe('TodayScreen — active state (default)', () => {
  it('renders the hero card with current location and days remaining', () => {
    const { getByText } = render(<TodayScreen />);
    expect(getByText('You are currently in')).toBeTruthy();
    expect(getByText(mockJourney.goal.currentLocation)).toBeTruthy();
    expect(
      getByText(new RegExp(`${mockJourney.goal.daysRemaining} days to go`))
    ).toBeTruthy();
  });

  it("shows today's steps and the days-left tile", () => {
    const { getByText, getAllByText } = render(<TodayScreen />);
    expect(getByText(mockJourney.today.steps.toLocaleString('en-US'))).toBeTruthy();
    expect(getByText('Days left')).toBeTruthy();
    expect(getByText('to destination')).toBeTruthy();
    // daysRemaining renders twice — in the hero ("· 53 days to go")
    // and in the new tile.
    expect(
      getAllByText(String(mockJourney.goal.daysRemaining)).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('Open map link navigates to the Journey tab', () => {
    const { getByText } = render(<TodayScreen />);
    fireEvent.press(getByText('Open map →'));
    expect(mockNavigate).toHaveBeenCalledWith('Journey');
  });

  it('Story-waiting card navigates to StoryCard with the unread id', () => {
    const { getByText } = render(<TodayScreen />);
    const unread = mockJourney.storyCards.find((s) => !s.read);
    fireEvent.press(getByText(unread.title));
    expect(mockNavigate).toHaveBeenCalledWith('StoryCard', { id: unread.id });
  });

  it('shows the monthly insight comparison line', () => {
    const { getByText } = render(<TodayScreen />);
    expect(
      getByText(new RegExp(`${mockJourney.today.monthlyMiles} miles`))
    ).toBeTruthy();
  });
});

describe('TodayScreen — empty state (toggled)', () => {
  it('flips to empty state and renders the search pill + suggestions', () => {
    const { getByText, queryByText } = render(<TodayScreen />);
    fireEvent.press(getByText('Show empty state →'));
    expect(getByText('Good morning.')).toBeTruthy();
    expect(getByText('Where do you want to walk to?')).toBeTruthy();
    expect(getByText('Search any destination...')).toBeTruthy();
    expect(getByText('Walk home to Hanover, NH')).toBeTruthy();
    expect(queryByText('You are currently in')).toBeNull();
  });

  it('tapping a suggestion pushes the GoalSetup flow', () => {
    const { getByText } = render(<TodayScreen />);
    fireEvent.press(getByText('Show empty state →'));
    fireEvent.press(getByText('Walk home to Hanover, NH'));
    expect(mockNavigate).toHaveBeenCalledWith('GoalSetup');
  });

  it('tapping the search pill pushes GoalSetup', () => {
    const { getByText } = render(<TodayScreen />);
    fireEvent.press(getByText('Show empty state →'));
    fireEvent.press(getByText('Search any destination...'));
    expect(mockNavigate).toHaveBeenCalledWith('GoalSetup');
  });
});
