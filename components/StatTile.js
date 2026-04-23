import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { fonts } from '../constants/fonts';

// Three-up stat tile used in the StoryCard footer (days / miles / to go).
// Big serif number + small uppercase label below, on a faintly-lit card.
export default function StatTile({ value, label, style }) {
  return (
    <View style={[styles.tile, style]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
  },
  value: {
    fontFamily: fonts.serif.semibold,
    fontSize: 18,
    color: colors.ochre.soft,
  },
  label: {
    marginTop: 2,
    fontFamily: fonts.sans.semibold,
    fontSize: 9,
    color: colors.text.dim,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
