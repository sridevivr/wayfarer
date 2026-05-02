import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import PlaceAutocomplete from '../../components/PlaceAutocomplete';
import { colors } from '../../constants/colors';
import { type } from '../../constants/fonts';
import { getLastOrigin, setActiveGoal, setLastOrigin } from '../../storage/goalStore';

// Goal setup · 1 of 3 — pick the starting point. Pre-fills the
// autocomplete from `@goal_lastOrigin` so returning users don't have
// to retype their hometown every time. Continue is disabled until the
// user makes a selection (typing alone doesn't count).
export default function OriginScreen() {
  const navigation = useNavigation();
  const [origin, setOrigin] = useState(null);
  const [initialQuery, setInitialQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const last = await getLastOrigin();
      if (!cancelled && last) {
        setOrigin(last);
        setInitialQuery(last.name);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onContinue() {
    if (!origin) return;
    await setActiveGoal({
      origin,
      destination: null,
      route: null,
      status: 'draft',
      createdAt: new Date().toISOString(),
    });
    await setLastOrigin(origin);
    navigation.navigate('Destination');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[type.label, styles.flow]}>Goal setup · 1 of 3</Text>
        <Text style={[type.h1, styles.title]}>Where are you starting from?</Text>
        <Text style={[type.body, styles.sub]}>
          Pick your home or current city. We&apos;ll use it to draft a walking
          route to your destination.
        </Text>

        <View style={styles.field}>
          <PlaceAutocomplete
            value={origin}
            onSelect={setOrigin}
            placeholder="Search a city or address"
            initialQuery={initialQuery}
            testID="origin-autocomplete"
          />
        </View>

        <Button label="Continue" onPress={onContinue} disabled={!origin} style={styles.cta} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { padding: 24, paddingTop: 32 },
  flow: { marginBottom: 12 },
  title: { marginBottom: 10 },
  sub: { marginBottom: 28 },
  field: { marginBottom: 32 },
  cta: { marginTop: 8 },
});
