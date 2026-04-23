import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/colors';

// 5-segment progress indicator used on onboarding screens 2-5 (step 1-4
// in the design: "Step N of 5"). Segments 0..step-1 fill with ochre, the
// rest are dim border color.
export default function OnboardingBar({ step, total = 5 }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            i < step ? styles.filled : styles.empty,
            i === total - 1 && styles.last,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginRight: 6,
  },
  last: {
    marginRight: 0,
  },
  filled: {
    backgroundColor: colors.ochre.base,
  },
  empty: {
    backgroundColor: colors.border.subtle,
  },
});
