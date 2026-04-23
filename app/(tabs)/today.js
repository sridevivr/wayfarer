import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '../../components/Card';
import MapPlaceholder from '../../components/MapPlaceholder';
import ProgressBar from '../../components/ProgressBar';
import StoryRow from '../../components/StoryRow';
import Tag from '../../components/Tag';
import { colors } from '../../constants/colors';
import { fonts, type } from '../../constants/fonts';
import {
  formatStepsApprox,
  milesToSteps,
  mockCurated,
  mockJourney,
  mockSuggestions,
} from '../../constants/mockData';

// Today tab. Active state shows the in-progress journey hero, two stat
// tiles, the route preview, and the unread story card. Empty state is
// a search field and a list of suggested + curated routes that all push
// into GoalSetup. M4 toggles between them via a debug ghost link at the
// bottom; M5 reads the real "is there a goal?" state from storage.
export default function TodayScreen() {
  const [hasGoal, setHasGoal] = useState(true);
  return hasGoal ? (
    <ActiveToday onResetGoal={() => setHasGoal(false)} />
  ) : (
    <EmptyToday onSetGoal={() => setHasGoal(true)} />
  );
}

function ActiveToday({ onResetGoal }) {
  const navigation = useNavigation();
  const { goal, today, pctComplete } = mockJourney;
  const unread = mockJourney.storyCards.find((c) => !c.read);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={[type.label, styles.heroLabel]}>You are currently in</Text>
          <Text style={[type.h1, styles.heroTitle]}>{goal.currentLocation}</Text>
          <View style={styles.heroSubRow}>
            <View style={styles.heroDot} />
            <Text style={type.body}>
              On your way to {shortName(goal.destination)} · {goal.daysRemaining} days to go
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[type.label, styles.statLabel]}>Today</Text>
            <Text style={styles.statNumberOchre}>{today.steps.toLocaleString('en-US')}</Text>
            <Text style={[type.bodySmall, styles.statUnit]}>steps</Text>
            <ProgressBar pct={today.dailyAveragePct} />
          </Card>
          <Card style={styles.statCard}>
            <Text style={[type.label, styles.statLabel]}>Journey</Text>
            <Text style={styles.statNumberSage}>{pctComplete}%</Text>
            <Text style={[type.bodySmall, styles.statUnit]}>complete</Text>
            <ProgressBar pct={pctComplete} />
          </Card>
        </View>

        <Text style={[type.label, styles.section]}>Your route</Text>
        <Pressable onPress={() => navigation.navigate('Journey')}>
          {({ pressed }) => (
            <Card glow style={[styles.routeCard, pressed && styles.cardPressed]}>
              <MapPlaceholder height={100} pct={pctComplete} glow={false} />
              <View style={styles.routeFooter}>
                <Text style={type.bodySmall}>
                  {shortName(goal.origin)} → {shortName(goal.destination)}
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
                    <Text style={styles.storyGlyph}>◈</Text>
                  </View>
                </Card>
              )}
            </Pressable>
          </>
        ) : null}

        <View style={styles.divider} />

        <Text style={styles.monthly}>
          This month you&apos;ve walked{' '}
          <Text style={styles.monthlyAccent}>{today.monthlyMiles} miles</Text> — that&apos;s{' '}
          {today.monthlyComparison}.
        </Text>

        <Pressable onPress={onResetGoal} style={styles.debug}>
          <Text style={styles.debugLabel}>Show empty state →</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyToday({ onSetGoal }) {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[type.h1, styles.greeting]}>Good morning.</Text>
        <Text style={[type.body, styles.greetingSub]}>Where do you want to walk to?</Text>

        <Pressable
          onPress={() => navigation.navigate('GoalSetup')}
          style={({ pressed }) => [styles.searchPill, pressed && styles.cardPressed]}
        >
          <Text style={styles.searchIcon}>⌕</Text>
          <Text style={styles.searchPlaceholder}>Search any destination...</Text>
        </Pressable>

        <Text style={[type.label, styles.section]}>Suggested for you</Text>
        {mockSuggestions.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => navigation.navigate('GoalSetup')}
            style={({ pressed }) => pressed && styles.cardPressed}
          >
            <Card style={styles.suggestCard}>
              <View style={styles.suggestHeader}>
                <Text style={styles.suggestName}>{s.name}</Text>
                <Tag label={s.tag} color={s.tagColor} />
              </View>
              <Text style={[type.bodySmall, styles.suggestSub]}>
                {s.miles.toLocaleString('en-US')} mi · {formatStepsApprox(milesToSteps(s.miles))} · ~{s.days} days
              </Text>
            </Card>
          </Pressable>
        ))}

        <View style={styles.divider} />

        <Text style={[type.label, styles.section]}>Curated routes</Text>
        {mockCurated.map((r) => (
          <StoryRow
            key={r.id}
            icon="◇"
            accent="sage"
            title={r.name}
            subtitle={r.subtitle}
            onPress={() => navigation.navigate('GoalSetup')}
            style={{ marginBottom: 8 }}
          />
        ))}

        <Pressable onPress={onSetGoal} style={styles.debug}>
          <Text style={styles.debugLabel}>Show active state →</Text>
        </Pressable>
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
  heroLabel: { marginBottom: 6 },
  heroTitle: { marginBottom: 6, fontSize: 22, lineHeight: 28 },
  heroSubRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.ochre.base,
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

  greeting: { marginBottom: 4, fontSize: 22, lineHeight: 28 },
  greetingSub: { marginBottom: 20 },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 24,
  },
  searchIcon: { color: colors.text.dim, fontSize: 14 },
  searchPlaceholder: { color: colors.text.dim, fontSize: 13, fontFamily: fonts.sans.regular },

  suggestCard: { marginBottom: 10 },
  suggestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  suggestName: {
    fontFamily: fonts.serif.medium,
    fontSize: 13,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 18,
  },
  suggestSub: { marginTop: 6 },

  debug: {
    marginTop: 24,
    paddingVertical: 8,
    alignItems: 'center',
  },
  debugLabel: {
    color: colors.text.dim,
    fontSize: 11,
    fontFamily: fonts.sans.semibold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
