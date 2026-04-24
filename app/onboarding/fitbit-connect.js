import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  makeRedirectUri,
  ResponseType,
  useAuthRequest,
} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Card from '../../components/Card';
import OnboardingBar from '../../components/OnboardingBar';
import { colors } from '../../constants/colors';
import { type } from '../../constants/fonts';
import { cmToStepsPerMile } from '../../constants/stride';
import {
  exchangeCode,
  FITBIT_AUTH_URL,
  FITBIT_SCOPES,
  FITBIT_TOKEN_URL,
  getProfile,
} from '../../services/fitbit';
import { saveTokens } from '../../storage/secureStore';
import { setUser } from '../../storage/userStore';

// expo-auth-session needs this on native to dismiss the in-app browser
// when the auth provider redirects back. No-op on web.
WebBrowser.maybeCompleteAuthSession();

const ACCESS_ITEMS = ['Daily step count', 'Stride length', '30-day step history'];

const discovery = {
  authorizationEndpoint: FITBIT_AUTH_URL,
  tokenEndpoint: FITBIT_TOKEN_URL,
};

export default function FitbitConnectScreen() {
  const navigation = useNavigation();
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // `native:` routes correctly in both environments: in Expo Go it
  // returns `exp://LAN-IP:8081/--/fitbit-auth` (because Expo Go can't
  // handle custom schemes, and makeRedirectUri auto-detects the dev
  // URL), and in a standalone EAS build it returns the value verbatim
  // (`wayfarer://fitbit-auth`). Passing `scheme:` instead forces the
  // custom scheme in Expo Go too, which Fitbit then rejects because
  // that URI never actually routes back into Expo Go.
  const redirectUri = makeRedirectUri({ native: 'wayfarer://fitbit-auth' });

  // Surface the exact value Fitbit will see — both in Metro and on
  // screen — so a redirect-URI mismatch shows what to register.
  if (__DEV__) console.log('[Fitbit OAuth] redirect_uri =', redirectUri);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_FITBIT_CLIENT_ID ?? '',
      scopes: FITBIT_SCOPES,
      redirectUri,
      responseType: ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success' && request?.codeVerifier) {
      handleSuccess(response.params.code, request.codeVerifier);
    } else if (response?.type === 'error') {
      setError('Fitbit denied the request. Please try again.');
      setBusy(false);
    } else if (response?.type === 'cancel' || response?.type === 'dismiss') {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  async function handleSuccess(code, codeVerifier) {
    try {
      const tokens = await exchangeCode({ code, codeVerifier, redirectUri });
      await saveTokens(tokens);
      const profile = await getProfile();
      const stride = cmToStepsPerMile(profile.strideLengthCm);
      await setUser({ strideStepsPerMile: stride, fitbitDisplayName: profile.displayName });
      navigation.navigate('StrideConfirm');
    } catch (e) {
      setError('Could not connect to Fitbit. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const onConnect = async () => {
    if (!process.env.EXPO_PUBLIC_FITBIT_CLIENT_ID) {
      setError('Missing EXPO_PUBLIC_FITBIT_CLIENT_ID in .env.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await promptAsync();
    } catch (e) {
      setError('Could not open Fitbit. Please try again.');
      setBusy(false);
    }
  };

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
          <Button
            label={busy ? 'Connecting…' : 'Connect Fitbit'}
            onPress={onConnect}
            disabled={!request || busy}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {__DEV__ ? (
            <Text style={styles.redirectDebug} selectable>
              redirect_uri: {redirectUri}
            </Text>
          ) : null}
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
  error: {
    color: colors.terra.base,
    fontSize: 12,
    textAlign: 'center',
  },
  redirectDebug: {
    color: colors.text.dim,
    fontSize: 10,
    fontFamily: 'Courier',
    textAlign: 'center',
    marginTop: 4,
  },
  micro: {
    textAlign: 'center',
    marginTop: 4,
  },
});
