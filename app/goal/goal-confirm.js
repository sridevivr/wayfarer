import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors } from '../../constants/colors';
import { fonts, type } from '../../constants/fonts';
import useFitbit from '../../hooks/useFitbit';
import { activateGoal, getActiveGoal } from '../../storage/goalStore';

// Goal setup · 3 of 3 — final confirmation. Reads the draft goal +
// Fitbit-derived stride/dailyAverage and shows the headline numbers
// the user is committing to (total miles, total steps, projected days
// at current pace). Confirm flips the goal status from draft → active
// and dismisses the GoalSetup modal — Today's useFocusEffect re-reads
// on landing.

const METERS_PER_MILE = 1609.34;

export default function GoalConfirmScreen() {
  const navigation = useNavigation();
  const fb = useFitbit();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const g = await getActiveGoal();
        if (cancelled) return;
        if (!g?.route) {
          setError(new Error('No draft goal — restart goal setup.'));
        } else {
          setGoal(g);
        }
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onConfirm() {
    setConfirming(true);
    try {
      await activateGoal();
      navigation.getParent()?.goBack();
    } catch (e) {
      setError(e);
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.ochre.soft} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[type.label, styles.flow]}>Goal setup · 3 of 3</Text>
          <Text style={[type.h1, styles.title]}>Something&apos;s missing</Text>
          <Text style={[type.body, styles.sub]}>
            {error.message ?? String(error)}
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const totalMiles = goal.route.distanceMeters / METERS_PER_MILE;
  const totalSteps = fb.strideStepsPerMile
    ? Math.round(totalMiles * fb.strideStepsPerMile)
    : null;
  const projectedDays = totalSteps != null && fb.dailyAverage > 0
    ? Math.ceil(totalSteps / fb.dailyAverage)
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[type.label, styles.flow]}>Goal setup · 3 of 3</Text>
        <Text style={[type.h1, styles.title]}>Ready to walk?</Text>
        <Text style={[type.body, styles.sub]}>
          Take a look — once you start, this goal becomes your active journey.
        </Text>

        <Card style={styles.summary} testID="goal-confirm-summary">
          <View style={styles.row}>
            <Text style={[type.label, styles.rowLabel]}>From</Text>
            <Text style={styles.rowValue}>{goal.origin.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[type.label, styles.rowLabel]}>To</Text>
            <Text style={styles.rowValue}>{goal.destination.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[type.label, styles.rowLabel]}>Route</Text>
            <Text style={styles.rowValue}>
              {goal.route.label} · {goal.route.summary || '—'}
            </Text>
          </View>
        </Card>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[type.label, styles.statLabel]}>Distance</Text>
            <Text style={styles.statBig}>{totalMiles.toFixed(0)}</Text>
            <Text style={[type.bodySmall, styles.statUnit]}>miles</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[type.label, styles.statLabel]}>Total steps</Text>
            <Text style={styles.statBig}>
              {totalSteps != null ? totalSteps.toLocaleString('en-US') : '—'}
            </Text>
            <Text style={[type.bodySmall, styles.statUnit]}>at your stride</Text>
          </Card>
        </View>

        <Card style={styles.projection}>
          <Text style={[type.label, styles.statLabel]}>At your current pace</Text>
          <Text style={styles.projectionBig}>
            {projectedDays != null ? `~${projectedDays}` : '—'}
          </Text>
          <Text style={[type.bodySmall, styles.statUnit]}>
            days to {goal.destination.name}
          </Text>
        </Card>

        <Button
          label={confirming ? 'Starting…' : 'Start walking'}
          onPress={onConfirm}
          disabled={confirming}
          style={styles.cta}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { padding: 24, paddingTop: 32 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  flow: { marginBottom: 12 },
  title: { marginBottom: 6 },
  sub: { marginBottom: 24 },

  summary: { marginBottom: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.subtle,
  },
  rowLabel: { width: 60 },
  rowValue: {
    fontFamily: fonts.serif.medium,
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, padding: 14 },
  statLabel: { marginBottom: 6 },
  statBig: {
    fontFamily: fonts.serif.semibold,
    fontSize: 28,
    color: colors.ochre.soft,
    letterSpacing: -0.5,
  },
  statUnit: { marginTop: 4, fontSize: 11 },

  projection: { marginBottom: 24, padding: 16, alignItems: 'flex-start' },
  projectionBig: {
    fontFamily: fonts.serif.semibold,
    fontSize: 32,
    color: colors.sage.soft,
    letterSpacing: -0.5,
  },

  cta: { marginTop: 4 },
});
