import { render, fireEvent } from '@testing-library/react-native';
import PlaceholderScreen from '../../components/PlaceholderScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

beforeEach(() => mockNavigate.mockClear());

describe('PlaceholderScreen', () => {
  it('renders flow, title, and description', () => {
    const { getByText } = render(
      <PlaceholderScreen
        flow="Today tab"
        title="Today"
        description="Two states live here."
      />
    );
    expect(getByText('Today tab')).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
    expect(getByText('Two states live here.')).toBeTruthy();
  });

  it('renders each link and navigates on press with target + params', () => {
    const { getByText } = render(
      <PlaceholderScreen
        title="Today"
        links={[
          { label: 'Set a goal →', target: 'GoalSetup' },
          { label: 'Open story', target: 'StoryCard', params: { id: '42' } },
        ]}
      />
    );
    fireEvent.press(getByText('Set a goal →'));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, 'GoalSetup', undefined);

    fireEvent.press(getByText('Open story'));
    expect(mockNavigate).toHaveBeenNthCalledWith(2, 'StoryCard', { id: '42' });
  });

  it('renders cleanly with no links', () => {
    const { queryByText } = render(<PlaceholderScreen title="Empty" />);
    expect(queryByText('Empty')).toBeTruthy();
  });
});
