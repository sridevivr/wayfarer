import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import { colors } from '../../constants/colors';
import { type } from '../../constants/fonts';

export default function SplashScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.spacerTop} />

      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <View style={styles.iconHalo} />
          <View style={styles.icon}>
            <Text style={styles.iconGlyph}>◈</Text>
          </View>
        </View>

        <Text style={styles.hero}>Wayfarer</Text>
        <Text style={styles.tagline}>
          Turn your daily steps{"\n"}into a personal journey
        </Text>
      </View>

      <View style={styles.actions}>
        <Button label="Begin your journey" onPress={() => navigation.navigate('FitbitConnect')} />
        <Button
          label="I already have an account"
          variant="secondary"
          onPress={() => navigation.navigate('Main')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    paddingHorizontal: 28,
  },
  spacerTop: { flex: 0.6 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconHalo: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.glow.bright,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.bright,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ochre.base,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  iconGlyph: {
    fontSize: 32,
    color: colors.ochre.soft,
  },
  hero: {
    ...type.display,
    marginBottom: 10,
    textAlign: 'center',
  },
  tagline: {
    ...type.tagline,
    textAlign: 'center',
  },
  actions: {
    paddingBottom: 8,
    gap: 10,
  },
});
