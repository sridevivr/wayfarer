import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Card from '../../components/Card';
import OnboardingBar from '../../components/OnboardingBar';
import Tag from '../../components/Tag';
import { colors } from '../../constants/colors';
import { type } from '../../constants/fonts';
import { getUser } from '../../storage/userStore';

// Reads stride from `@user.strideStepsPerMile` (set by FitbitConnect
// after a successful OAuth + profile fetch). Falls back to the design
// number if a dev arrives here without going through real OAuth.
const FALLBACK_STRIDE = 2246;

export default function StrideConfirmScreen() {
  const navigation = useNavigation();
  const [stride, setStride] = useState(FALLBACK_STRIDE);

  useEffect(() => {
    let cancelled = false;
    getUser().then((u) => {
      if (!cancelled && u?.strideStepsPerMile) setStride(u.strideStepsPerMile);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const onContinue = () => navigation.navigate('OnboardHome');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <OnboardingBar step={2} />
        <Text style={[type.label, styles.step]}>Step 2 of 5</Text>

        <Text style={[type.h1, styles.headline]}>Your stride length</Text>
        <Text style={[type.body, styles.body]}>
          Pulled from your Fitbit profile. This makes all distances personal and accurate for you specifically.
        </Text>

        <Card glow style={styles.strideCard}>
          <Text style={type.number}>{stride.toLocaleString()}</Text>
          <Text style={[type.body, styles.strideUnit]}>steps per mile</Text>
          <Tag label="From Fitbit profile" color="sage" style={styles.strideTag} />
        </Card>

        <Text style={[type.bodySmall, styles.explain]}>
          All distances in Wayfarer use your personal stride — not a population average.
        </Text>

        <View style={styles.actions}>
          <Button label="Looks right" onPress={onContinue} />
          <Button label="Adjust" variant="secondary" onPress={onContinue} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  step: { marginTop: 18, marginBottom: 10 },
  headline: { marginBottom: 10 },
  body: { marginBottom: 24 },
  strideCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  strideUnit: { marginTop: 6, marginBottom: 16 },
  strideTag: { alignSelf: 'center' },
  explain: {
    textAlign: 'center',
    marginBottom: 28,
  },
  actions: { gap: 10 },
});
