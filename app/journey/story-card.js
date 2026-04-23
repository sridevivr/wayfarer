import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function StoryCardScreen() {
  return (
    <PlaceholderScreen
      flow="Journey · Story Card"
      title="A story for you"
      description="Reader view for an AI-generated story card (landmark, state crossing, or cadence-triggered). Built in M8."
      links={[{ label: 'Back to Progress Map', target: 'Main' }]}
    />
  );
}
