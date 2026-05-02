import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/colors';

// Standard Card: bgCard fill, subtle border, 12px radius.
// When `glow` is true, uses the brighter ochre border + shadow for
// "highlighted" cards (e.g. the stride number on onboarding).
export default function Card({ children, glow = false, style, testID }) {
  return (
    <View
      style={[styles.card, glow ? styles.glow : styles.plain, style]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  plain: {
    borderColor: colors.border.subtle,
  },
  glow: {
    borderColor: colors.border.bright,
    shadowColor: colors.ochre.base,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
});
