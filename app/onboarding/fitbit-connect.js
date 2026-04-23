import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function FitbitConnectScreen() {
  return (
    <PlaceholderScreen
      flow="Onboarding · 2 of 5"
      title="Connect Fitbit"
      description="OAuth2 handoff to Fitbit via expo-auth-session. Stores access + refresh tokens. Built in M5."
      links={[
        { label: 'Continue → Stride Confirm', target: 'Onboarding', params: { screen: 'StrideConfirm' } },
      ]}
    />
  );
}
