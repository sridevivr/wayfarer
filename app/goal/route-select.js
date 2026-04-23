import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function RouteSelectScreen() {
  return (
    <PlaceholderScreen
      flow="Goal setup · 2 of 3"
      title="Choose a Route"
      description="Three route options rendered on mini-maps: most direct, picturesque, avoid highways. Built in M6."
      links={[
        { label: 'Continue → Goal Confirm', target: 'GoalSetup', params: { screen: 'GoalConfirm' } },
      ]}
    />
  );
}
