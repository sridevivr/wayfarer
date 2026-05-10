import { useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Polyline } from 'react-native-maps';

import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import StoryRow from '../../components/StoryRow';
import Tag from '../../components/Tag';
import { colors } from '../../constants/colors';
import { fonts, type } from '../../constants/fonts';
import { formatStepsApprox, milesToSteps, mockJourney } from '../../constants/mockData';
import useActiveGoal from '../../hooks/useActiveGoal';

// Journey tab. With an active goal: real route polyline on Apple Maps,
// real start/end + percentage progress bar. Story content + "Ahead on
// your route" stay mocked until M8. With no active goal: minimal empty
// state matching Today's.
export default function JourneyScreen() {
  const ag = useActiveGoal();
  if (ag.isActive) return <ActiveJourney ag={ag} />;
  return <NoGoalJourney />;
}

function ActiveJourney({ ag }) {
  const navigation = useNavigation();
  const { goal, pctComplete } = ag;
  const { upcoming, storyCards } = mockJourney;
  const unread = storyCards.find((c) => !c.read);
  const region = regionFor(goal.origin, goal.destination);
  const coordinates = (goal.route?.polyline ?? []).map((p) => ({
    latitude: p.lat,
    longitude: p.lng,
  }));

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
          <View style={styles.mapWrap} testID="journey-map">
            <MapView style={styles.map} initialRegion={region}>
              {coordinates.length > 0 ? (
                <Polyline
                  coordinates={coordinates}
                  strokeColor={colors.ochre.base}
                  strokeWidth={4}
                />
              ) : null}
            </MapView>
          </View>
          <View style={styles.mapFooter}>
            <Text style={[type.body, styles.heroSubText]}>
              On your way to {shortName(goal.destination.name)}
            </Text>
            <Tag
              label={pctComplete != null ? `${pctComplete}% complete` : '—'}
              color="ochre"
            />
          </View>
        </Card>

        <View style={styles.progressRow}>
          <Text style={styles.progressEnd}>{shortName(goal.origin.name)}</Text>
          <View style={{ flex: 1 }}>
            <ProgressBar pct={pctComplete ?? 0} height={6} />
          </View>
          <Text style={styles.progressEnd}>{shortName(goal.destination.name)}</Text>
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

function NoGoalJourney() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[type.h1, styles.emptyGreeting]}>Nothing to map yet.</Text>
        <Text style={[type.body, styles.emptyBody]}>
          Set a destination on the Today tab to begin your journey.
        </Text>
        <Pressable
          onPress={() => navigation.navigate('GoalSetup', { screen: 'Origin' })}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          testID="empty-set-destination"
        >
          <Text style={styles.ctaLabel}>Set a destination →</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function regionFor(o, d) {
  const latitude = (o.lat + d.lat) / 2;
  const longitude = (o.lng + d.lng) / 2;
  const latitudeDelta = Math.max(Math.abs(o.lat - d.lat) * 1.5, 0.5);
  const longitudeDelta = Math.max(Math.abs(o.lng - d.lng) * 1.5, 0.5);
  return { latitude, longitude, latitudeDelta, longitudeDelta };
}

function shortName(full) {
  return full ? full.split(',')[0] : '';
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
  mapWrap: {
    height: 210,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  map: { flex: 1 },
  mapFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 10,
    paddingBottom: 2,
  },
  heroSubText: { color: colors.text.secondary, flexShrink: 1, marginRight: 8 },

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
