import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { type } from '../constants/fonts';

// Primary: ochre fill, dark ink. Secondary: transparent, cream border.
// Ghost: no border, cream-dim label, used for tertiary "Skip" actions.
//
// When disabled, the button still renders but presses are ignored and
// opacity drops. Loading/spinner state isn't needed for M3 (UI-only).
export default function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles[`${variant}Pressed`],
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View pointerEvents="none">
        <Text style={[type.button, styles[`${variant}Label`]]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },

  primary: {
    backgroundColor: colors.ochre.base,
  },
  primaryPressed: {
    backgroundColor: colors.ochre.soft,
  },
  primaryLabel: {
    color: colors.bg.deep,
  },

  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.bright,
  },
  secondaryPressed: {
    backgroundColor: colors.bg.cardHover,
  },
  secondaryLabel: {
    color: colors.text.secondary,
  },

  ghost: {
    backgroundColor: 'transparent',
  },
  ghostPressed: {
    opacity: 0.6,
  },
  ghostLabel: {
    color: colors.text.dim,
  },
});
