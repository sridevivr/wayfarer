import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function OnboardPlacesScreen() {
  return (
    <PlaceholderScreen
      flow="Onboarding · 5 of 5"
      title="Places you want to reach"
      description="Up to three aspirational destinations that seed suggestions for the first goal. Built in M3."
      links={[{ label: 'Finish onboarding → Today', target: 'Main' }]}
    />
  );
}
