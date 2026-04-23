import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function DestSearchScreen() {
  return (
    <PlaceholderScreen
      flow="Goal setup · 1 of 3"
      title="Destination Search"
      description="Search a destination via Google Places autocomplete. Built in M6."
      links={[
        { label: 'Continue → Route Select', target: 'GoalSetup', params: { screen: 'RouteSelect' } },
      ]}
    />
  );
}
