import { render } from '@testing-library/react-native';
import JourneyStatsScreen from '../../../app/journey/journey-stats';
import { mockJourney } from '../../../constants/mockData';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

describe('JourneyStatsScreen', () => {
  it('renders the route hero with type label and percent string', () => {
    const { getByText } = render(<JourneyStatsScreen />);
    expect(getByText(/Somerville → San Francisco/)).toBeTruthy();
    expect(getByText(/Most Picturesque/)).toBeTruthy();
    expect(
      getByText(`${mockJourney.pctComplete}% — ${mockJourney.goal.cumulativeMiles.toLocaleString('en-US')} mi`)
    ).toBeTruthy();
  });

  it('renders all six stat rows', () => {
    const { getByText } = render(<JourneyStatsScreen />);
    expect(getByText('Total steps taken')).toBeTruthy();
    expect(getByText('Steps remaining')).toBeTruthy();
    expect(getByText('Days active')).toBeTruthy();
    expect(getByText('Daily average (30 days)')).toBeTruthy();
    expect(getByText('Projected completion')).toBeTruthy();
    expect(getByText('Personal stride length')).toBeTruthy();
    expect(getByText(mockJourney.cumulativeSteps.toLocaleString('en-US'))).toBeTruthy();
    expect(getByText(mockJourney.remainingSteps.toLocaleString('en-US'))).toBeTruthy();
  });

  it('lists every story card under "Stories unlocked"', () => {
    const { getByText } = render(<JourneyStatsScreen />);
    expect(getByText('Stories unlocked')).toBeTruthy();
    mockJourney.storyCards.forEach((s) => {
      expect(getByText(s.title)).toBeTruthy();
    });
  });
});
