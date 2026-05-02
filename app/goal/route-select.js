import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Polyline } from 'react-native-maps';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors } from '../../constants/colors';
import { fonts, type } from '../../constants/fonts';
import { getDirections } from '../../services/directions';
import { getActiveGoal, setActiveGoalRoute } from '../../storage/goalStore';

// Goal setup · 3 of 3 — pick a route. Fetches up to 3 length-sorted
// alternatives from Google Directions for the draft goal's
// origin → destination pair. Polylines render on Apple Maps (default
// provider on iOS — no Google Maps SDK key required); the selected
// route highlights in ochre while alternatives stay sage.
export default function RouteSelectScreen() {
  const navigation = useNavigation();
  const [goal, setGoal] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const g = await getActiveGoal();
      setGoal(g);
      if (!g?.origin || !g?.destination) {
        throw new Error('Missing origin or destination — restart goal setup.');
      }
      const r = await getDirections({ origin: g.origin, destination: g.destination });
      setRoutes(r);
      setSelectedIdx(0);
    } catch (e) {
      setError(e);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onContinue() {
    if (!routes.length) return;
    await setActiveGoalRoute(routes[selectedIdx]);
    navigation.navigate('GoalConfirm');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[type.label, styles.flow]}>Goal setup · 3 of 3</Text>
        <Text style={[type.h1, styles.title]}>Choose a route</Text>
        {goal?.origin && goal?.destination ? (
          <Text style={[type.body, styles.sub]}>
            {goal.origin.name} → {goal.destination.name}
          </Text>
        ) : null}

        {loading ? (
          <View style={styles.loadingWrap} testID="route-select-loading">
            <ActivityIndicator color={colors.ochre.soft} />
            <Text style={[type.bodySmall, styles.loadingLabel]}>Looking up routes…</Text>
          </View>
        ) : null}

        {error && !loading ? (
          <Card style={styles.errorCard} testID="route-select-error">
            <Text style={styles.errorTitle}>Couldn&apos;t load routes</Text>
            <Text style={[type.bodySmall, styles.errorBody]}>
              {error.message ?? String(error)}
            </Text>
            <Button label="Retry" onPress={load} variant="secondary" style={styles.retry} />
          </Card>
        ) : null}

        {!loading && !error && routes.length === 0 ? (
          <Text style={[type.body, styles.empty]}>No routes found between these points.</Text>
        ) : null}

        {!loading && !error && routes.length > 0 ? (
          <RouteMap goal={goal} routes={routes} selectedIdx={selectedIdx} />
        ) : null}

        {!loading && !error && routes.length > 0
          ? routes.map((r, i) => (
              <Pressable
                key={`${r.label}-${i}`}
                onPress={() => setSelectedIdx(i)}
                testID={`route-row-${i}`}
                style={({ pressed }) => pressed && styles.cardPressed}
              >
                <Card
                  style={[styles.routeCard, i === selectedIdx && styles.routeCardSelected]}
                  glow={i === selectedIdx}
                >
                  <View style={styles.routeRow}>
                    <Text style={[type.label, styles.routeLabel]}>{r.label}</Text>
                    <Text style={styles.routeMeta}>
                      {formatMiles(r.distanceMeters)} mi · {formatMinutes(r.durationSeconds)}
                    </Text>
                  </View>
                  {r.summary ? (
                    <Text style={[type.bodySmall, styles.routeSummary]}>via {r.summary}</Text>
                  ) : null}
                </Card>
              </Pressable>
            ))
          : null}

        {!loading && !error && routes.length > 0 ? (
          <Button label="Continue" onPress={onContinue} style={styles.cta} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function RouteMap({ goal, routes, selectedIdx }) {
  const region = regionFor(goal.origin, goal.destination);
  return (
    <View style={styles.mapWrap} testID="route-map">
      <MapView style={styles.map} initialRegion={region}>
        {routes.map((r, i) => (
          <Polyline
            key={`${r.label}-${i}`}
            coordinates={r.polyline.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
            strokeColor={i === selectedIdx ? colors.ochre.base : colors.sage.base}
            strokeWidth={i === selectedIdx ? 4 : 2}
          />
        ))}
      </MapView>
    </View>
  );
}

function regionFor(o, d) {
  const latitude = (o.lat + d.lat) / 2;
  const longitude = (o.lng + d.lng) / 2;
  const latitudeDelta = Math.max(Math.abs(o.lat - d.lat) * 1.5, 0.5);
  const longitudeDelta = Math.max(Math.abs(o.lng - d.lng) * 1.5, 0.5);
  return { latitude, longitude, latitudeDelta, longitudeDelta };
}

function formatMiles(meters) {
  return (meters / 1609.34).toFixed(1);
}

function formatMinutes(seconds) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { padding: 24, paddingTop: 32 },
  flow: { marginBottom: 12 },
  title: { marginBottom: 6 },
  sub: { marginBottom: 18 },

  loadingWrap: { paddingVertical: 32, alignItems: 'center' },
  loadingLabel: { marginTop: 12 },

  errorCard: { marginTop: 8, marginBottom: 16 },
  errorTitle: {
    fontFamily: fonts.serif.medium,
    fontSize: 14,
    color: colors.terra.soft,
    marginBottom: 6,
  },
  errorBody: { marginBottom: 12 },
  retry: { alignSelf: 'flex-start', paddingHorizontal: 18 },

  empty: { marginVertical: 32, color: colors.text.dim },

  mapWrap: {
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: 16,
  },
  map: { flex: 1 },

  routeCard: { marginBottom: 10 },
  routeCardSelected: {},
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeLabel: {},
  routeMeta: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    color: colors.text.primary,
  },
  routeSummary: { color: colors.text.dim },
  cardPressed: { opacity: 0.8 },

  cta: { marginTop: 16 },
});
