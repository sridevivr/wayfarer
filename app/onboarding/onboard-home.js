import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import OnboardingBar from '../../components/OnboardingBar';
import Tag from '../../components/Tag';
import { colors } from '../../constants/colors';
import { type } from '../../constants/fonts';

const SUGGESTIONS = ['Hanover, NH', 'Boston, MA', 'Portland, ME'];
const DEFAULT_VALUE = 'Hanover, New Hampshire';

// Returns true if the input text corresponds to a given suggestion (loose
// match — either exact, or the suggestion's city appears in the free text).
// Exported for unit tests; not part of the screen's public surface.
export function matchesSuggestion(value, suggestion) {
  if (!value) return false;
  const [city] = suggestion.split(',');
  return value.toLowerCase().includes(city.trim().toLowerCase());
}

export default function OnboardHomeScreen() {
  const navigation = useNavigation();
  const [hometown, setHometown] = useState(DEFAULT_VALUE);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <OnboardingBar step={3} />
          <Text style={[type.label, styles.step]}>Step 3 of 5</Text>

          <Text style={[type.h1, styles.headline]}>Where is home?</Text>
          <Text style={[type.body, styles.body]}>
            We'll use this to create your first personalized goal suggestion — no location permissions needed.
          </Text>

          <Text style={[type.label, styles.fieldLabel]}>Your hometown</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="search-outline" size={16} color={colors.text.dim} />
            <TextInput
              value={hometown}
              onChangeText={setHometown}
              placeholder="Where you live"
              placeholderTextColor={colors.text.dim}
              style={[type.input, styles.input]}
              autoCorrect={false}
              returnKeyType="done"
            />
          </View>

          <Text style={[type.label, styles.fieldLabel, { marginTop: 24 }]}>Suggestions</Text>
          <View style={styles.suggestBox}>
            {SUGGESTIONS.map((s, i) => {
              const selected = matchesSuggestion(hometown, s);
              const isLast = i === SUGGESTIONS.length - 1;
              return (
                <Pressable
                  key={s}
                  onPress={() => setHometown(s)}
                  style={({ pressed }) => [
                    styles.suggest,
                    !isLast && styles.suggestDivider,
                    pressed && styles.suggestPressed,
                  ]}
                >
                  <Text
                    style={[
                      type.input,
                      { color: selected ? colors.text.primary : colors.text.secondary },
                    ]}
                  >
                    {s}
                  </Text>
                  {selected ? <Tag label="Selected" color="ochre" /> : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Button
              label="Continue"
              onPress={() => navigation.navigate('OnboardPlaces')}
              disabled={!hometown.trim()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  fieldLabel: {
    marginBottom: 10,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(201,137,42,0.55)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  input: {
    flex: 1,
    padding: 0,
  },
  suggestBox: {
    backgroundColor: colors.bg.deep,
    borderColor: colors.border.subtle,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 32,
  },
  suggest: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  suggestDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.subtle,
  },
  suggestPressed: {
    backgroundColor: colors.bg.cardHover,
  },
  actions: {
    gap: 10,
  },
});
