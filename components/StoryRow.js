import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { fonts, type } from '../constants/fonts';

// Card row with a square icon box on the left and a title + subtitle on the
// right. Used in two places: "Suggested for you" / "Curated routes" on
// TodayEmpty, and "Ahead on your route" on Journey.
//
// `accent` picks the icon-box tint: 'ochre' (default) or 'sage'.
export default function StoryRow({ icon = '★', title, subtitle, onPress, accent = 'ochre', style }) {
  const tint = accent === 'sage' ? SAGE : OCHRE;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <View style={[styles.iconBox, { backgroundColor: tint.bg, borderColor: tint.border }]}>
        <Text style={[styles.icon, { color: tint.fg }]}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

const OCHRE = { bg: 'rgba(201,137,42,0.08)', border: 'rgba(201,137,42,0.18)', fg: colors.ochre.soft };
const SAGE = { bg: 'rgba(92,122,78,0.12)', border: 'rgba(92,122,78,0.22)', fg: colors.sage.soft };

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bg.card,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  pressed: {
    backgroundColor: colors.bg.cardHover,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
    fontFamily: fonts.serif.semibold,
  },
  title: {
    fontFamily: fonts.serif.medium,
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 18,
  },
  subtitle: {
    ...type.bodySmall,
    marginTop: 2,
  },
});
