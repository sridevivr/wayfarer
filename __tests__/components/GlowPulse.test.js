import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import GlowPulse from '../../components/GlowPulse';

describe('GlowPulse', () => {
  it('renders its children', () => {
    const { getByText } = render(
      <GlowPulse>
        <Text>pulse me</Text>
      </GlowPulse>
    );
    expect(getByText('pulse me')).toBeTruthy();
  });

  it('mounts and unmounts cleanly (starts/stops the animation loop)', () => {
    const { unmount, getByText } = render(
      <GlowPulse>
        <Text>x</Text>
      </GlowPulse>
    );
    expect(getByText('x')).toBeTruthy();
    expect(() => unmount()).not.toThrow();
  });
});
