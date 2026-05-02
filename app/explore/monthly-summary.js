import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function MonthlySummaryScreen() {
  return (
    <PlaceholderScreen
      flow="Explore · Monthly Summary"
      title="This month in steps"
      description="Month-to-date step totals, busiest day, streaks, and interesting comparisons. Built in M10."
      links={[{ label: 'Back to Explore', target: 'Main' }]}
    />
  );
}
