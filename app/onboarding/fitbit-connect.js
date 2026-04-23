import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Card from '../../components/Card';
import OnboardingBar from '../../components/OnboardingBar';
import { colors } from '../../constants/colors';
import { type } from '../../constants/fonts';

const ACCESS_ITEMS = ['Daily step count', 'Stride length', '30-day step history'];

export default function FitbitConnectScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <OnboardingBar step={1} />
        <Text style={[type.label, styles.step]}>Step 1 of 5</Text>

        <Text style={[type.h1, styles.headline]}>Connect your Fitbit</Text>
        <Text style={[type.body, styles.body]}>
          We use your Fitbit to read your step count and stride length. Your data stays on your device.
        </Text>

        <Card style={styles.accountCard}>
          <View style={styles.accountRow}>
            <View style={styles.accountIcon}>
              <Ionicons name="watch-outline" size={22} color={colors.ochre.soft} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.h3}>Fitbit Account</Text>
              <Text style={[type.bodySmall, styles.accountSub]}>Secure OAuth connection</Text>
            </View>
          </View>
        </Card>

        <View style={styles.accessBox}>
          <Text style={[type.label, styles.accessLabel]}>Wayfarer will access</Text>
          {ACCESS_ITEMS.map((item) => (
            <View key={item} style={styles.accessItem}>
              <View style={styles.check}>
                <Ionicons name="checkmark" size={12} color={colors.sage.soft} />
              </View>
              <Text style={[type.body, styles.accessText]}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button label="Connect Fitbit" onPress={() => navigation.navigate('StrideConfirm')} />
          <Text style={[type.micro, styles.micro]}>
            We never sell or share your health data
          </Text>
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
  step: {
    marginTop: 18,
    marginBottom: 10,
  },
  headline: {
    marginBottom: 10,
  },
  body: {
    marginBottom: 24,
  },
  accountCard: {
    marginBottom: 20,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(201,137,42,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(201,137,42,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountSub: {
    marginTop: 2,
  },
  accessBox: {
    backgroundColor: colors.bg.deep,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  accessLabel: {
    marginBottom: 10,
  },
  accessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
  },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(122,158,106,0.5)',
    backgroundColor: 'rgba(92,122,78,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessText: {
    color: colors.text.primary,
    fontSize: 13,
  },
  actions: {
    gap: 10,
  },
  micro: {
    textAlign: 'center',
    marginTop: 4,
  },
});
