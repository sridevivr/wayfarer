import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wayfarer</Text>
      <Text style={styles.subtitle}>Every step a story.</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12180F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#F0E4C8',
    fontSize: 38,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#6E5E48',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
});
