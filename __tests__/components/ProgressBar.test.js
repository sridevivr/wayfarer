import { render } from '@testing-library/react-native';
import ProgressBar from '../../components/ProgressBar';

describe('ProgressBar', () => {
  it('renders without crashing at 0%', () => {
    const { toJSON } = render(<ProgressBar pct={0} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders at 100%', () => {
    const { toJSON } = render(<ProgressBar pct={100} />);
    expect(toJSON()).toBeTruthy();
  });

  it('clamps values above 100 and below 0 (no crash, just renders)', () => {
    const { toJSON: hi } = render(<ProgressBar pct={250} />);
    const { toJSON: lo } = render(<ProgressBar pct={-50} />);
    expect(hi()).toBeTruthy();
    expect(lo()).toBeTruthy();
  });

  it('respects custom height', () => {
    const { toJSON } = render(<ProgressBar pct={50} height={12} />);
    const root = toJSON();
    const style = Array.isArray(root.props.style) ? Object.assign({}, ...root.props.style.filter(Boolean)) : root.props.style;
    expect(style.height).toBe(12);
  });
});
