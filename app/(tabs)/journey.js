import { useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '../../components/Card';
import MapPlaceholder from '../../components/MapPlaceholder';
import ProgressBar from '../../components/ProgressBar';
import StoryRow from '../../components/StoryRow';
import Tag from '../../components/Tag';
import { colors } from '../../constants/colors';
import { fonts, type } from '../../constants/fonts';
import { formatStepsApprox, milesToSteps, mockJourney } from '../../constants/mockData';

// Journey tab. Full map preview + start/end progress bar + the unread
// story card + an "ahead on your route" list. Header has a "Stats →"
// link that pushes JourneyStats.
export default function JourneyScreen() {
  const navigation = useNavigation();
  const { goal, pctComplete, upcoming, storyCards } = mockJourney;
  const unread = storyCards.find((c) => !c.read);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.h2}>Your Journey</Text>
          <Pressable onPress={() => navigation.navigate('JourneyStats')} hitSlop={8}>
            <Text style={styles.statsLink}>Stats →</Text>
          </Pressable>
        </View>

        <Card glow style={styles.mapCard}>
          <MapPlaceholder height={210} pct={pctComplete} glow />
          <View style={styles.mapFooter}>
            <View>
              <Text style={[type.label, { marginBottom: 2 }]}>Currently in</Text>
              <Text style={styles.currentLocation}>{goal.currentLocation}</Text>
            </View>
            <Tag label={`${pctComplete}% complete`} color="ochre" />
          </View>
        </Card>

        <View style={styles.progressRow}>
          <Text style={styles.progressEnd}>{shortName(goal.origin)}</Text>
          <View style={{ flex: 1 }}>
            <ProgressBar pct={pctComplete} height={6} />
          </View>
          <Text style={styles.progressEnd}>{shortName(goal.destination)}</Text>
        </View>

        {unread ? (
          <Pressable onPress={() => navigation.navigate('StoryCard', { id: unread.id })}>
            {({ pressed }) => (
              <Card style={[styles.storyCard, pressed && styles.cardPressed]}>
                <Text style={styles.storyTitle}>◈ Story waiting — {unread.title}</Text>
                <Text style={[type.bodySmall, { marginTop: 2 }]}>Tap to read</Text>
              </Card>
            )}
          </Pressable>
        ) : null}

        <Text style={[type.label, styles.section]}>Ahead on your route</Text>
        {upcoming.map((p) => (
          <StoryRow
            key={p.id}
            icon="★"
            title={p.name}
            subtitle={`${p.miles.toLocaleString('en-US')} mi · ${formatStepsApprox(milesToSteps(p.miles))} away`}
            style={{ marginBottom: 8 }}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function shortName(full) {
  return full.split(',')[0];
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  h2: {
    fontFamily: fonts.serif.semibold,
    fontSize: 22,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  statsLink: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    color: colors.ochre.soft,
  },

  mapCard: { marginBottom: 14, padding: 10 },
  mapFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 10,
    paddingBottom: 2,
  },
  currentLocation: {
    fontFamily: fonts.serif.semibold,
    fontSize: 14,
    color: colors.text.primary,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  progressEnd: {
    fontFamily: fonts.sans.regular,
    fontSize: 10,
    color: colors.text.dim,
  },

  storyCard: {
    marginBottom: 14,
    borderLeftWidth: 2,
    borderLeftColor: colors.ochre.base,
  },
  cardPressed: { backgroundColor: colors.bg.cardHover },
  storyTitle: {
    fontFamily: fonts.serif.medium,
    fontSize: 13,
    color: colors.text.primary,
  },

  section: { marginBottom: 10 },
});
