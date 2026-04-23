import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function PhotoUploadScreen() {
  return (
    <PlaceholderScreen
      flow="Completion · 2 of 3"
      title="Add a photo"
      description="Optional photo upload attached to the completed goal for the share card. Built in M9."
      links={[
        { label: 'Continue → Share Card', target: 'Completion', params: { screen: 'ShareCard' } },
      ]}
    />
  );
}
