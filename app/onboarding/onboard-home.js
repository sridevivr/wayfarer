import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function OnboardHomeScreen() {
  return (
    <PlaceholderScreen
      flow="Onboarding · 4 of 5"
      title="Where is home?"
      description="Free-text hometown input, stored as the default starting point for future goals. Built in M3."
      links={[
        { label: 'Continue → Places to reach', target: 'Onboarding', params: { screen: 'OnboardPlaces' } },
      ]}
    />
  );
}
