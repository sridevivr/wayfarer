import { render } from '@testing-library/react-native';
import StatTile from '../../components/StatTile';

describe('StatTile', () => {
  it('renders the value and label', () => {
    const { getByText } = render(<StatTile value="34" label="Days" />);
    expect(getByText('34')).toBeTruthy();
    expect(getByText('Days')).toBeTruthy();
  });
});
