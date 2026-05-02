import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { colors } from '../constants/colors';

// Stylised pre-map placeholder used on Today (height 100) and Journey
// (height 210). Renders a faint grid, a dashed full route, the walked
// portion as a gradient line, start/destination markers, and a glowing
// current-position marker. M6 swaps this for react-native-maps.
//
// `pct` controls how much of the route has been walked (0..100). Same
// 8-point polyline as the visual design's MapC component.
const POLY = [
  [0.04, 0.72],
  [0.15, 0.52],
  [0.28, 0.62],
  [0.42, 0.37],
  [0.55, 0.47],
  [0.68, 0.27],
  [0.8, 0.34],
  [0.96, 0.2],
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function walkedPoints(pct) {
  const t = Math.max(0, Math.min(1, pct / 100));
  const segs = POLY.length - 1;
  const idx = Math.floor(segs * t);
  const fr = (segs * t) % 1;
  const out = POLY.slice(0, idx + 1);
  if (fr > 0 && idx + 1 < POLY.length) {
    const [ax, ay] = POLY[idx];
    const [bx, by] = POLY[idx + 1];
    out.push([lerp(ax, bx, fr), lerp(ay, by, fr)]);
  }
  return out;
}

export default function MapPlaceholder({ height = 200, pct = 34, glow = true, style }) {
  const [w, setW] = useState(0);
  const onLayout = (e) => setW(e.nativeEvent.layout.width);

  const pts = POLY.map(([x, y]) => [x * w, y * height]);
  const wp = walkedPoints(pct).map(([x, y]) => [x * w, y * height]);
  const fullPath = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const walkedPath = wp.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const [mx, my] = wp[wp.length - 1] ?? [0, 0];
  const [sx, sy] = pts[0];
  const [ex, ey] = pts[pts.length - 1];

  const gridX = [];
  for (let x = 22; x < w; x += 22) gridX.push(x);
  const gridY = [];
  for (let y = 22; y < height; y += 22) gridY.push(y);

  return (
    <View style={[styles.wrap, { height }, style]} onLayout={onLayout}>
      {w > 0 ? (
        <Svg width={w} height={height}>
          <Defs>
            <SvgLinearGradient id="mapWalked" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#7A6030" />
              <Stop offset="1" stopColor={colors.ochre.base} />
            </SvgLinearGradient>
          </Defs>

          {gridX.map((x) => (
            <Line key={`x${x}`} x1={x} y1={0} x2={x} y2={height} stroke="rgba(90,110,70,0.15)" strokeWidth={0.8} />
          ))}
          {gridY.map((y) => (
            <Line key={`y${y}`} x1={0} y1={y} x2={w} y2={y} stroke="rgba(90,110,70,0.15)" strokeWidth={0.8} />
          ))}

          <Path
            d={fullPath}
            stroke="rgba(92,122,78,0.25)"
            strokeWidth={2}
            strokeDasharray="5,5"
            fill="none"
          />

          {glow ? (
            <Path
              d={walkedPath}
              stroke="rgba(201,137,42,0.2)"
              strokeWidth={10}
              strokeLinecap="round"
              fill="none"
            />
          ) : null}

          <Path
            d={walkedPath}
            stroke="url(#mapWalked)"
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
          />

          <Circle cx={sx} cy={sy} r={4} fill={colors.text.dim} />
          <Circle cx={ex} cy={ey} r={5} stroke={colors.ochre.soft} strokeWidth={1.5} fill={colors.bg.card} />

          {glow ? <Circle cx={mx} cy={my} r={12} fill="rgba(201,137,42,0.2)" /> : null}
          <Circle cx={mx} cy={my} r={6} fill={colors.ochre.base} />
        </Svg>
      ) : null}
    </View>
  );
}

MapPlaceholder.walkedPoints = walkedPoints;

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    backgroundColor: 'rgba(15,25,12,0.5)',
    borderRadius: 10,
    overflow: 'hidden',
  },
});
