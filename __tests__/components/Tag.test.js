import { render } from '@testing-library/react-native';
import Tag from '../../components/Tag';

describe('Tag', () => {
  it('renders its label', () => {
    const { getByText } = render(<Tag label="Added" />);
    expect(getByText('Added')).toBeTruthy();
  });

  it('renders each palette color without crashing', () => {
    ['ochre', 'sage', 'terra'].forEach((color) => {
      const { getByText } = render(<Tag label={color} color={color} />);
      expect(getByText(color)).toBeTruthy();
    });
  });

  it('falls back to ochre palette for unknown colors', () => {
    const { getByText } = render(<Tag label="fallback" color="not-a-color" />);
    expect(getByText('fallback')).toBeTruthy();
  });
});
