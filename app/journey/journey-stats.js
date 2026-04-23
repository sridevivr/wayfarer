import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import { colors } from '../../constants/colors';
import { fonts, type } from '../../constants/fonts';
import { mockJourney } from '../../constants/mockData';

// Journey Stats. Top "hero" card shows the route + a thin progress bar
// with 0 / current / total mile markers. Then a 6-row stats list with
// hairline dividers, then the unlocked stories section.
const ROUTE_TYPE_LABELS = {
  scenic: 'Most Picturesque',
  direct: 'Most Direct',
  noHighways: 'No Highways',
};

export default function JourneyStatsScreen() {
  const { goal, pctComplete, cumulativeSteps, remainingSteps, today, storyCards } = mockJourney;

  const stats = [
    { l: 'Total steps taken', v: cumulativeSteps.toLocaleString('en-US') },
    { l: 'Steps remaining', v: remainingSteps.toLocaleString('en-US') },
    { l: 'Days active', v: `${goal.daysActive} of ${goal.daysProjected}` },
    { l: 'Daily average (30 days)', v: `${today.dailyAverage.toLocaleString('en-US')} steps` },
    { l: 'Projected completion', v: goal.projectedEndDate },
    { l: 'Personal stride length', v: `${mockJourney.strideStepsPerMile.toLocaleString('en-US')} steps/mi` },
  ];
  const unlocked = storyCards;

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Card glow style={styles.hero}>
        <Text style={[type.bodySmall, styles.heroLine]}>
          {shortName(goal.origin)} → {shortName(goal.destination)} · {ROUTE_TYPE_LABELS[goal.routeType] ?? goal.routeType}
        </Text>
        <ProgressBar pct={pctComplete} height={6} />
        <View style={styles.heroFooter}>
          <Text style={styles.heroEnd}>0 mi</Text>
          <Text style={styles.heroMid}>
            {pctComplete}% — {goal.cumulativeMiles.toLocaleString('en-US')} mi
          </Text>
          <Text style={styles.heroEnd}>{goal.totalMiles.toLocaleString('en-US')} mi</Text>
        </View>
      </Card>

      {stats.map((s, i) => (
        <View key={s.l}>
          <View style={styles.statRow}>
            <Text style={[type.body, { fontSize: 12 }]}>{s.l}</Text>
            <Text style={styles.statValue}>{s.v}</Text>
          </View>
          {i < stats.length - 1 ? <View style={styles.divider} /> : null}
        </View>
      ))}

      <Text style={[type.label, styles.section]}>Stories unlocked</Text>
      {unlocked.map((s) => (
        <Card key={s.id} style={styles.unlockedCard}>
          <Text style={styles.unlockedGlyph}>◈</Text>
          <Text style={styles.unlockedTitle}>{s.title}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

function shortName(full) {
  return full.split(',')[0];
}

const styles = StyleSheet.create({
  bg: { backgroundColor: colors.bg.primary },
  scroll: { padding: 16, paddingBottom: 32 },

  hero: { padding: 18, marginBottom: 14 },
  heroLine: { marginBottom: 10 },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  heroEnd: {
    fontFamily: fonts.sans.regular,
    fontSize: 10,
    color: colors.text.dim,
  },
  heroMid: {
    fontFamily: fonts.serif.medium,
    fontSize: 11,
    color: colors.ochre.soft,
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  statValue: {
    fontFamily: fonts.serif.medium,
    fontSize: 12,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
  },

  section: { marginTop: 16, marginBottom: 10 },
  unlockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  unlockedGlyph: {
    color: colors.ochre.base,
    fontSize: 16,
  },
  unlockedTitle: {
    fontFamily: fonts.serif.medium,
    fontSize: 12,
    color: colors.text.primary,
  },
});
