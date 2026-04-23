import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function SplashScreen() {
  return (
    <PlaceholderScreen
      flow="Onboarding · 1 of 5"
      title="Splash"
      description="Wayfarer intro — name, tagline, and a single CTA to start. Built in M3."
      links={[
        { label: 'Continue → Fitbit Connect', target: 'Onboarding', params: { screen: 'FitbitConnect' } },
      ]}
    />
  );
}
