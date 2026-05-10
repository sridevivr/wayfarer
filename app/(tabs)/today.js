import { useNavigation } from '@react-navigation/native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '../../components/Card';
import GlowPulse from '../../components/GlowPulse';
import MapPlaceholder from '../../components/MapPlaceholder';
import { colors } from '../../constants/colors';
import { fonts, type } from '../../constants/fonts';
import { mockJourney } from '../../constants/mockData';
import useActiveGoal from '../../hooks/useActiveGoal';
import useFitbit from '../../hooks/useFitbit';

// Today tab. When a real active goal exists in storage, ActiveToday
// reads from useActiveGoal (real destination, real days-remaining,
// real percentage) and from useFitbit (today's step count). When no
// active goal exists, falls back to a minimal "Set a destination →"
// empty state.
//
// Story-waiting card and the monthly insight line still read from
// mockJourney — story content is M8 territory; monthly aggregate is a
// later milestone.
export default function TodayScreen() {
  const ag = useActiveGoal();
  if (ag.isActive) return <ActiveToday ag={ag} />;
  return <NoGoalToday />;
}

function ActiveToday({ ag }) {
  const navigation = useNavigation();
  const fb = useFitbit();
  const { goal, pctComplete, daysRemaining } = ag;
  const steps = fb.connected && fb.todaySteps != null ? fb.todaySteps : 0;
  const unread = mockJourney.storyCards.find((c) => !c.read);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroSubRow}>
            <GlowPulse style={styles.heroDotWrap}>
              <View style={styles.heroDot} />
            </GlowPulse>
            <Text style={[type.h2, styles.heroTitle]}>
              On your way to {shortName(goal.destination.name)}
            </Text>
          </View>
          <Text style={[type.body, styles.heroSubText]}>
            {daysRemaining != null ? `${daysRemaining} days to go` : 'Calibrating pace…'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[type.label, styles.statLabel]}>Today</Text>
            <Text style={styles.statNumberOchre}>{steps.toLocaleString('en-US')}</Text>
            <Text style={[type.bodySmall, styles.statUnit]}>steps</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[type.label, styles.statLabel]}>Days left</Text>
            <Text style={styles.statNumberSage}>
              {daysRemaining != null ? daysRemaining : '—'}
            </Text>
            <Text style={[type.bodySmall, styles.statUnit]}>to destination</Text>
          </Card>
        </View>

        <Text style={[type.label, styles.section]}>Your route</Text>
        <Pressable onPress={() => navigation.navigate('Journey')}>
          {({ pressed }) => (
            <Card glow style={[styles.routeCard, pressed && styles.cardPressed]}>
              <MapPlaceholder height={100} pct={pctComplete ?? 0} glow={false} />
              <View style={styles.routeFooter}>
                <Text style={type.bodySmall}>
                  {shortName(goal.origin.name)} → {shortName(goal.destination.name)}
                </Text>
                <Text style={styles.openLink}>Open map →</Text>
              </View>
            </Card>
          )}
        </Pressable>

        {unread ? (
          <>
            <Text style={[type.label, styles.section]}>Story waiting</Text>
            <Pressable onPress={() => navigation.navigate('StoryCard', { id: unread.id })}>
              {({ pressed }) => (
                <Card glow style={[styles.storyCard, pressed && styles.cardPressed]}>
                  <View style={styles.storyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.storyTitle}>{unread.title}</Text>
                      <Text style={[type.bodySmall, styles.storySub]}>A story is waiting for you</Text>
                    </View>
                    <GlowPulse>
                      <Text style={styles.storyGlyph}>◈</Text>
                    </GlowPulse>
                  </View>
                </Card>
              )}
            </Pressable>
          </>
        ) : null}

        <View style={styles.divider} />

        <Text style={styles.monthly}>
          This month you&apos;ve walked{' '}
          <Text style={styles.monthlyAccent}>{mockJourney.today.monthlyMiles} miles</Text> — that&apos;s{' '}
          {mockJourney.today.monthlyComparison}.
        </Text>

        {!fb.connected ? (
          <Pressable
            onPress={() => navigation.navigate('Onboarding', { screen: 'FitbitConnect' })}
            style={styles.connectFitbit}
          >
            <Text style={styles.connectFitbitLabel}>Tap to connect Fitbit →</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function NoGoalToday() {
  const navigation = useNavigation();
  const fb = useFitbit();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[type.h1, styles.emptyGreeting]}>No active goal yet.</Text>
        <Text style={[type.body, styles.emptyBody]}>
          Pick a destination to start a virtual journey. Your real steps will
          carry you there.
        </Text>

        <Pressable
          onPress={() => navigation.navigate('GoalSetup', { screen: 'Origin' })}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          testID="empty-set-destination"
        >
          <Text style={styles.ctaLabel}>Set a destination →</Text>
        </Pressable>

        {!fb.connected ? (
          <Pressable
            onPress={() => navigation.navigate('Onboarding', { screen: 'FitbitConnect' })}
            style={styles.connectFitbit}
          >
            <Text style={styles.connectFitbitLabel}>Tap to connect Fitbit →</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function shortName(full) {
  return full ? full.split(',')[0] : '';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },

  heroCard: {
    marginBottom: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.bright,
    backgroundColor: colors.bg.card,
    shadowColor: colors.ochre.base,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  heroTitle: { flexShrink: 1 },
  heroSubRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  heroSubText: { color: colors.text.secondary },
  heroDotWrap: { marginRight: 10, flexShrink: 0 },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.ochre.base,
    shadowColor: colors.ochre.base,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, padding: 14 },
  statLabel: { marginBottom: 6 },
  statNumberOchre: {
    fontFamily: fonts.serif.semibold,
    fontSize: 24,
    color: colors.ochre.soft,
    letterSpacing: -0.5,
  },
  statNumberSage: {
    fontFamily: fonts.serif.semibold,
    fontSize: 24,
    color: colors.sage.soft,
    letterSpacing: -0.5,
  },
  statUnit: { marginBottom: 8, fontSize: 10 },

  section: { marginBottom: 8 },
  routeCard: { marginBottom: 14, padding: 10 },
  cardPressed: { backgroundColor: colors.bg.cardHover },
  routeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  openLink: {
    fontFamily: fonts.sans.semibold,
    fontSize: 11,
    color: colors.ochre.base,
  },

  storyCard: {
    marginBottom: 14,
    borderLeftWidth: 2,
    borderLeftColor: colors.ochre.base,
  },
  storyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storyTitle: {
    fontFamily: fonts.serif.medium,
    fontSize: 13,
    color: colors.text.primary,
    marginBottom: 4,
  },
  storySub: {},
  storyGlyph: {
    fontSize: 20,
    color: colors.ochre.base,
    marginLeft: 8,
    textShadowColor: colors.ochre.base,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: 14,
  },
  monthly: {
    fontFamily: fonts.serif.regularItalic,
    fontSize: 12,
    color: colors.text.dim,
    textAlign: 'center',
    lineHeight: 20,
  },
  monthlyAccent: {
    color: colors.text.primary,
  },

  connectFitbit: {
    marginTop: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  connectFitbitLabel: {
    color: colors.ochre.soft,
    fontSize: 12,
    fontFamily: fonts.sans.semibold,
  },

  emptyGreeting: { marginTop: 24, marginBottom: 10, fontSize: 24, lineHeight: 30 },
  emptyBody: { marginBottom: 28 },
  cta: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.ochre.base,
    alignItems: 'center',
  },
  ctaPressed: { backgroundColor: colors.ochre.soft },
  ctaLabel: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    color: colors.bg.deep,
    letterSpacing: 0.2,
  },
});
