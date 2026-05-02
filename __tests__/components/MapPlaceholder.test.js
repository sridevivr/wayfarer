import { render } from '@testing-library/react-native';
import MapPlaceholder from '../../components/MapPlaceholder';

describe('MapPlaceholder.walkedPoints', () => {
  const { walkedPoints } = MapPlaceholder;

  it('returns just the first point at 0%', () => {
    expect(walkedPoints(0)).toEqual([[0.04, 0.72]]);
  });

  it('returns the full 8-point polyline at 100%', () => {
    const pts = walkedPoints(100);
    expect(pts).toHaveLength(8);
    expect(pts[pts.length - 1]).toEqual([0.96, 0.2]);
  });

  it('interpolates the last point partway through a segment', () => {
    const pts = walkedPoints(50);
    expect(pts.length).toBeGreaterThan(1);
    const [lastX, lastY] = pts[pts.length - 1];
    expect(lastX).toBeGreaterThan(0);
    expect(lastY).toBeGreaterThan(0);
  });

  it('clamps negative and overshoot values', () => {
    expect(walkedPoints(-10)).toEqual([[0.04, 0.72]]);
    expect(walkedPoints(500)).toHaveLength(8);
  });
});

describe('MapPlaceholder component', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<MapPlaceholder pct={34} height={210} />);
    expect(toJSON()).toBeTruthy();
  });
});
