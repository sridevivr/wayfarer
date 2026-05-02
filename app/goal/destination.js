import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '../../components/Card';
import PlaceAutocomplete from '../../components/PlaceAutocomplete';
import { colors } from '../../constants/colors';
import { fonts, type } from '../../constants/fonts';
import { suggestionsForOrigin } from '../../constants/regionSuggestions';
import { getActiveGoal, setActiveGoal } from '../../storage/goalStore';

// Goal setup · 2 of 3 — pick a destination. The free-search
// PlaceAutocomplete is always available; if the origin is in a region
// we have hardcoded suggestions for (New England / California for
// now), we surface them above the search as quick picks.
//
// Phase 1 stops here: selecting either a suggestion or a free-search
// result writes `destination` onto the active draft and dismisses the
// GoalSetup modal. Phase 2 will navigate to RouteSelect instead.
export default function DestinationScreen() {
  const navigation = useNavigation();
  const [origin, setOrigin] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const goal = await getActiveGoal();
      if (!cancelled) setOrigin(goal?.origin ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function commit(destination) {
    const current = (await getActiveGoal()) ?? {};
    const next = { ...current, destination };
    await setActiveGoal(next);
    if (__DEV__) console.log('[goal] draft saved:', JSON.stringify(next));
    navigation.navigate('RouteSelect');
  }

  const suggestions = suggestionsForOrigin(origin);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[type.label, styles.flow]}>Goal setup · 2 of 3</Text>
        <Text style={[type.h1, styles.title]}>Where do you want to walk to?</Text>
        <Text style={[type.body, styles.sub]}>
          {origin
            ? `From ${origin.name}. Pick a quick suggestion or search any place.`
            : 'Pick a place to walk to.'}
        </Text>

        {suggestions.length > 0 ? (
          <View style={styles.suggestWrap} testID="suggestions-wrap">
            <Text style={[type.label, styles.section]}>Suggested destinations</Text>
            {suggestions.map((s) => (
              <Pressable
                key={s.placeId}
                onPress={() => commit(s)}
                testID={`suggestion-${s.placeId}`}
                style={({ pressed }) => pressed && styles.cardPressed}
              >
                <Card style={styles.suggestCard}>
                  <Text style={styles.suggestName}>{s.name}</Text>
                  <Text style={[type.bodySmall, styles.suggestSub]}>{s.address}</Text>
                </Card>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={[type.label, styles.section]}>Search</Text>
        <PlaceAutocomplete
          onSelect={commit}
          placeholder="Search a destination"
          testID="destination-autocomplete"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { padding: 24, paddingTop: 32 },
  flow: { marginBottom: 12 },
  title: { marginBottom: 10 },
  sub: { marginBottom: 24 },
  section: { marginBottom: 8, marginTop: 8 },
  suggestWrap: { marginBottom: 24 },
  suggestCard: { marginBottom: 10 },
  cardPressed: { opacity: 0.7 },
  suggestName: {
    fontFamily: fonts.serif.medium,
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
  },
  suggestSub: {},
});
