import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../constants/colors';
import { fonts, type } from '../constants/fonts';

// Wraps the Google Places Autocomplete + Place Details endpoints. The
// caller passes `value` (the currently selected PlaceObject or null) and
// `onSelect`, plus an optional `placeholder` and `initialQuery` to
// pre-fill the text field on mount.
//
// Two requests:
//   1. autocomplete/json — fetched 250ms after each keystroke (debounced)
//   2. details/json      — fetched once when the user taps a prediction
//
// Returns the same PlaceObject shape used by goalStore + the BACKLOG.md
// onboarding intake: { name, address, lat, lng, placeId }.

const AUTOCOMPLETE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const DEBOUNCE_MS = 250;

export default function PlaceAutocomplete({
  value,
  onSelect,
  placeholder = 'Search a place…',
  initialQuery = '',
  testID,
}) {
  const [query, setQuery] = useState(initialQuery || value?.name || '');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const queryGenRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!open || query.trim().length < 2) {
      setPredictions([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setError(null);
    const gen = ++queryGenRef.current;
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `${AUTOCOMPLETE_URL}?input=${encodeURIComponent(query)}&key=${API_KEY}`;
        const res = await fetch(url);
        const json = await res.json();
        if (gen !== queryGenRef.current) return;
        if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
          throw new Error(json.error_message || json.status || 'Autocomplete failed');
        }
        setPredictions(json.predictions ?? []);
      } catch (e) {
        if (gen !== queryGenRef.current) return;
        setError(e);
        setPredictions([]);
      } finally {
        if (gen === queryGenRef.current) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open]);

  async function selectPrediction(prediction) {
    setOpen(false);
    setLoading(true);
    setError(null);
    try {
      const url = `${DETAILS_URL}?place_id=${prediction.place_id}&fields=name,formatted_address,geometry,place_id&key=${API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status !== 'OK') {
        throw new Error(json.error_message || json.status || 'Place details failed');
      }
      const r = json.result;
      const place = {
        name: r.name,
        address: r.formatted_address,
        lat: r.geometry?.location?.lat,
        lng: r.geometry?.location?.lng,
        placeId: r.place_id,
      };
      setQuery(place.name);
      onSelect(place);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.wrap} testID={testID}>
      <TextInput
        value={query}
        onChangeText={(t) => {
          setQuery(t);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        placeholderTextColor={colors.text.dim}
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="words"
        testID={testID ? `${testID}-input` : 'place-autocomplete-input'}
      />
      {loading ? (
        <ActivityIndicator
          style={styles.spinner}
          color={colors.ochre.soft}
          testID="place-autocomplete-loading"
        />
      ) : null}
      {open && predictions.length > 0 ? (
        <View style={styles.results}>
          {predictions.map((p) => (
            <Pressable
              key={p.place_id}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => selectPrediction(p)}
              testID={`place-autocomplete-result-${p.place_id}`}
            >
              <Text style={styles.rowMain} numberOfLines={1}>
                {p.structured_formatting?.main_text ?? p.description}
              </Text>
              {p.structured_formatting?.secondary_text ? (
                <Text style={styles.rowSecondary} numberOfLines={1}>
                  {p.structured_formatting.secondary_text}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}
      {open && !loading && query.trim().length >= 2 && predictions.length === 0 && !error ? (
        <Text style={[type.bodySmall, styles.empty]}>No matches.</Text>
      ) : null}
      {error ? (
        <Text style={[type.bodySmall, styles.error]}>Couldn&apos;t reach Places API.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  input: {
    fontFamily: fonts.sans.regular,
    fontSize: 15,
    color: colors.text.primary,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  spinner: { position: 'absolute', right: 14, top: 14 },
  results: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.bg.card,
    overflow: 'hidden',
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.subtle,
  },
  rowPressed: { backgroundColor: colors.bg.cardHover },
  rowMain: {
    fontFamily: fonts.sans.medium,
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 2,
  },
  rowSecondary: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.text.dim,
  },
  empty: { marginTop: 8, color: colors.text.dim },
  error: { marginTop: 8, color: colors.terra.soft },
});
