import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function ShareCardScreen() {
  return (
    <PlaceholderScreen
      flow="Completion · 3 of 3"
      title="Share your journey"
      description="Rendered share card (route + stats + photo) piped into the iOS share sheet. Built in M9."
      links={[{ label: 'Done → Today', target: 'Main' }]}
    />
  );
}
