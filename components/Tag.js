import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { type } from '../constants/fonts';

// Small uppercase chip used across onboarding (e.g. "Added", "Selected",
// "From Fitbit profile"). `color` maps to one of the accent families.
const PALETTE = {
  ochre: { bg: 'rgba(201,137,42,0.14)', fg: colors.ochre.soft, border: 'rgba(201,137,42,0.35)' },
  terra: { bg: 'rgba(181,83,60,0.16)', fg: colors.terra.soft, border: 'rgba(181,83,60,0.4)' },
  sage: { bg: 'rgba(92,122,78,0.16)', fg: colors.sage.soft, border: 'rgba(92,122,78,0.4)' },
};

export default function Tag({ label, color = 'ochre', style }) {
  const palette = PALETTE[color] ?? PALETTE.ochre;
  return (
    <View style={[styles.tag, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>
      <Text style={[type.tag, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 99,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
});
