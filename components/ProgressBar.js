import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../constants/colors';

// Horizontal track + sage→ochre gradient fill. SVG (rather than two Views)
// because gradient backgrounds aren't first-class on RN styles. The track
// uses a soft white overlay so it works on any card background.
export default function ProgressBar({ pct = 0, height = 4, style }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View style={[styles.track, { height, borderRadius: height }, style]}>
      <Svg width="100%" height={height} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="pbGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.sage.base} />
            <Stop offset="1" stopColor={colors.ochre.base} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={`${clamped}%`}
          height={height}
          rx={height / 2}
          ry={height / 2}
          fill="url(#pbGrad)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
});
