import { colors } from './colors';

// Google Font keys as exposed by @expo-google-fonts/*. Values here are what
// useFonts() registers them as. Don't hardcode these strings in screens;
// import the `fonts` object or the `type` presets below.
export const fonts = {
  serif: {
    regular: 'Lora_400Regular',
    regularItalic: 'Lora_400Regular_Italic',
    medium: 'Lora_500Medium',
    mediumItalic: 'Lora_500Medium_Italic',
    semibold: 'Lora_600SemiBold',
    bold: 'Lora_700Bold',
  },
  sans: {
    light: 'DMSans_300Light',
    regular: 'DMSans_400Regular',
    medium: 'DMSans_500Medium',
    semibold: 'DMSans_600SemiBold',
  },
};

// Text style presets from docs/wayfarer_visual_design.jsx (H / Bod / Lbl
// helpers + inline headline/number styles). Use these directly in screens:
// `<Text style={type.h1}>...</Text>` so we stay tokenized end-to-end.
export const type = {
  // Display — splash hero
  display: {
    fontFamily: fonts.serif.semibold,
    fontSize: 38,
    color: colors.text.primary,
    lineHeight: 46,
    letterSpacing: -0.4,
  },
  // Big number on cards (stride confirm)
  number: {
    fontFamily: fonts.serif.bold,
    fontSize: 52,
    color: colors.ochre.soft,
    letterSpacing: -2,
    lineHeight: 60,
  },
  // Screen headline
  h1: {
    fontFamily: fonts.serif.semibold,
    fontSize: 28,
    color: colors.text.primary,
    lineHeight: 35,
    letterSpacing: -0.3,
  },
  // Card title
  h2: {
    fontFamily: fonts.serif.semibold,
    fontSize: 20,
    color: colors.text.primary,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: fonts.serif.medium,
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  // Body copy
  body: {
    fontFamily: fonts.sans.light,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 21,
  },
  bodySmall: {
    fontFamily: fonts.sans.light,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  // Tagline — italic serif
  tagline: {
    fontFamily: fonts.serif.regularItalic,
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  // Microcopy under inputs/buttons
  micro: {
    fontFamily: fonts.sans.light,
    fontSize: 11,
    color: colors.text.dim,
    lineHeight: 16,
  },
  // Uppercase label (progress step, input label, section headers)
  label: {
    fontFamily: fonts.sans.semibold,
    fontSize: 10,
    color: colors.text.dim,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  // Button label
  button: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  // Tag / chip label (smaller than label)
  tag: {
    fontFamily: fonts.sans.semibold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Input text value
  input: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.text.primary,
  },
};

export default fonts;
