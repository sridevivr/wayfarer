import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import Card from '../../components/Card';

describe('Card', () => {
  it('renders its children', () => {
    const { getByText } = render(
      <Card>
        <Text>inside</Text>
      </Card>
    );
    expect(getByText('inside')).toBeTruthy();
  });

  it('accepts a glow prop without crashing', () => {
    const { getByText } = render(
      <Card glow>
        <Text>glowing</Text>
      </Card>
    );
    expect(getByText('glowing')).toBeTruthy();
  });
});
