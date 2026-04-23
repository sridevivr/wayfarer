import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function GoalConfirmScreen() {
  return (
    <PlaceholderScreen
      flow="Goal setup · 3 of 3"
      title="Confirm Your Goal"
      description="Summary of origin, destination, distance, total steps, and projected finish. Saves the goal to AsyncStorage. Built in M6."
      links={[{ label: 'Start walking → Today', target: 'Main' }]}
    />
  );
}
