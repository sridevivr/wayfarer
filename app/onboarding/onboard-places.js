import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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

// Slot config: tag color matches the visual design sample (destination 1
// ochre, 2 sage; 3 is optional with no tag preview).
const SLOTS = [
  { index: 0, label: 'Destination 1', tagColor: 'ochre', optional: false, seed: 'San Francisco, CA' },
  { index: 1, label: 'Destination 2', tagColor: 'sage', optional: false, seed: 'Yellowstone National Park' },
  { index: 2, label: 'Destination 3', tagColor: 'terra', optional: true, seed: '' },
];

export default function OnboardPlacesScreen() {
  const navigation = useNavigation();
  const [values, setValues] = useState(SLOTS.map((s) => s.seed));

  const finish = () => navigation.navigate('Main');
  const updateAt = (i) => (text) => {
    setValues((prev) => prev.map((v, idx) => (idx === i ? text : v)));
  };

  const atLeastOne = values.some((v) => v.trim().length > 0);

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
          <OnboardingBar step={4} />
          <Text style={[type.label, styles.step]}>Step 4 of 5</Text>

          <Text style={[type.h1, styles.headline]}>Places you want to reach</Text>
          <Text style={[type.body, styles.body]}>
            Add up to 3 destinations. These become your first goal suggestions inside the app.
          </Text>

          {SLOTS.map((slot) => {
            const value = values[slot.index];
            const filled = value.trim().length > 0;
            return (
              <View key={slot.index} style={styles.slot}>
                <View style={styles.slotHeader}>
                  <Text style={type.label}>{slot.label}</Text>
                  {slot.optional ? (
                    <Text style={[type.micro, { color: colors.text.dim }]}>Optional</Text>
                  ) : null}
                </View>
                <View
                  style={[
                    styles.inputWrap,
                    { borderColor: filled ? colors.border.bright : colors.border.subtle },
                  ]}
                >
                  <TextInput
                    value={value}
                    onChangeText={updateAt(slot.index)}
                    placeholder="Search a city or landmark..."
                    placeholderTextColor={colors.text.dim}
                    style={[type.input, styles.input]}
                    autoCorrect={false}
                    returnKeyType="done"
                  />
                </View>
                {filled ? (
                  <Tag label="Added" color={slot.tagColor} style={styles.slotTag} />
                ) : null}
              </View>
            );
          })}

          <View style={styles.actions}>
            <Button
              label="Let's go →"
              onPress={finish}
              disabled={!atLeastOne}
            />
            <Button label="Skip for now" variant="secondary" onPress={finish} />
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
  body: { marginBottom: 22 },
  slot: {
    marginBottom: 18,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputWrap: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  input: {
    padding: 0,
  },
  slotTag: {
    marginTop: 8,
  },
  actions: {
    gap: 10,
    marginTop: 12,
  },
});
