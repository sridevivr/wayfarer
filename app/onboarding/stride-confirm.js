import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function StrideConfirmScreen() {
  return (
    <PlaceholderScreen
      flow="Onboarding · 3 of 5"
      title="Confirm Your Stride"
      description="Pulls strideLength from Fitbit profile and lets the user confirm or override. Built in M5."
      links={[
        { label: 'Continue → Where is home?', target: 'Onboarding', params: { screen: 'OnboardHome' } },
      ]}
    />
  );
}
