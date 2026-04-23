import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function CelebrationScreen() {
  return (
    <PlaceholderScreen
      flow="Completion · 1 of 3"
      title="You made it"
      description="Celebration screen when cumulativeSteps meets totalSteps. Hero stats + next-step CTA. Built in M9."
      links={[
        { label: 'Continue → Photo Upload', target: 'Completion', params: { screen: 'PhotoUpload' } },
      ]}
    />
  );
}
