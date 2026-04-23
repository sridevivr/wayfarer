import PlaceholderScreen from '../../components/PlaceholderScreen';

// TODO M4: renders two states — empty (no active goal, CTA to set one) and
// active (progress bar, next story teaser). For M2 we show both transitions.
export default function TodayScreen() {
  return (
    <PlaceholderScreen
      flow="Today tab"
      title="Today"
      description="Two states live here: empty (no active goal, CTA to set one) and active (progress toward your current destination). Built with dummy data in M4."
      links={[
        { label: 'Set a goal →', target: 'GoalSetup' },
        { label: 'Restart onboarding →', target: 'Onboarding' },
      ]}
    />
  );
}
