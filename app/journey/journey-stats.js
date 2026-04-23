import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function JourneyStatsScreen() {
  return (
    <PlaceholderScreen
      flow="Journey · Stats"
      title="Journey Stats"
      description="Cumulative steps, miles walked, days in, average daily pace, projected completion. Built in M4."
      links={[{ label: 'Back to Progress Map', target: 'Main' }]}
    />
  );
}
