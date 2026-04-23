import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function JourneyScreen() {
  return (
    <PlaceholderScreen
      flow="Journey tab"
      title="Progress Map"
      description="Full-screen map with the route polyline (walked = ochre, remaining = dashed sage) and your animated marker. Built in M6/M7."
      links={[
        { label: 'Open a story card →', target: 'StoryCard' },
        { label: 'See journey stats →', target: 'JourneyStats' },
        { label: 'Trigger completion flow →', target: 'Completion' },
      ]}
    />
  );
}
