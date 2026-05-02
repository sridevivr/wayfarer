import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

import {
  useFonts,
  Lora_400Regular,
  Lora_400Regular_Italic,
  Lora_500Medium,
  Lora_500Medium_Italic,
  Lora_600SemiBold,
  Lora_700Bold,
} from '@expo-google-fonts/lora';
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';

import RootNavigation from './app/navigation';
import { colors } from './constants/colors';

export default function App() {
  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    Lora_400Regular_Italic,
    Lora_500Medium,
    Lora_500Medium_Italic,
    Lora_600SemiBold,
    Lora_700Bold,
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });

  if (!fontsLoaded) {
    // Native splash bg matches — this view takes over without a flash.
    return <View style={{ flex: 1, backgroundColor: colors.bg.primary }} />;
  }

  return (
    <SafeAreaProvider>
      <RootNavigation />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
