import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function ExploreScreen() {
  return (
    <PlaceholderScreen
      flow="Explore tab"
      title="Explore"
      description="Distance lookup for a destination and a preview of this month’s step summary. Built in M10."
      links={[{ label: 'See monthly summary →', target: 'MonthlySummary' }]}
    />
  );
}
