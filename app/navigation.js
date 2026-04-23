import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../constants/colors';

import TodayScreen from './(tabs)/today';
import JourneyScreen from './(tabs)/journey';
import ExploreScreen from './(tabs)/explore';

import SplashScreen from './onboarding/splash';
import FitbitConnectScreen from './onboarding/fitbit-connect';
import StrideConfirmScreen from './onboarding/stride-confirm';
import OnboardHomeScreen from './onboarding/onboard-home';
import OnboardPlacesScreen from './onboarding/onboard-places';

import DestSearchScreen from './goal/dest-search';
import RouteSelectScreen from './goal/route-select';
import GoalConfirmScreen from './goal/goal-confirm';

import CelebrationScreen from './completion/celebration';
import PhotoUploadScreen from './completion/photo-upload';
import ShareCardScreen from './completion/share-card';

import StoryCardScreen from './journey/story-card';
import JourneyStatsScreen from './journey/journey-stats';

import MonthlySummaryScreen from './explore/monthly-summary';

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg.primary,
    card: colors.bg.deep,
    text: colors.text.primary,
    border: colors.border.subtle,
    primary: colors.ochre.base,
    notification: colors.terra.base,
  },
};

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.bg.deep },
  headerTintColor: colors.text.primary,
  headerTitleStyle: { color: colors.text.primary, fontWeight: '600' },
  contentStyle: { backgroundColor: colors.bg.primary },
};

const OnboardingStackNav = createNativeStackNavigator();
function OnboardingStack() {
  return (
    <OnboardingStackNav.Navigator screenOptions={stackScreenOptions} initialRouteName="Splash">
      <OnboardingStackNav.Screen name="Splash" component={SplashScreen} options={{ title: 'Welcome' }} />
      <OnboardingStackNav.Screen name="FitbitConnect" component={FitbitConnectScreen} options={{ title: 'Connect Fitbit' }} />
      <OnboardingStackNav.Screen name="StrideConfirm" component={StrideConfirmScreen} options={{ title: 'Your Stride' }} />
      <OnboardingStackNav.Screen name="OnboardHome" component={OnboardHomeScreen} options={{ title: 'Home' }} />
      <OnboardingStackNav.Screen name="OnboardPlaces" component={OnboardPlacesScreen} options={{ title: 'Places' }} />
    </OnboardingStackNav.Navigator>
  );
}

const GoalStackNav = createNativeStackNavigator();
function GoalStack() {
  return (
    <GoalStackNav.Navigator screenOptions={stackScreenOptions} initialRouteName="DestSearch">
      <GoalStackNav.Screen name="DestSearch" component={DestSearchScreen} options={{ title: 'Destination' }} />
      <GoalStackNav.Screen name="RouteSelect" component={RouteSelectScreen} options={{ title: 'Route' }} />
      <GoalStackNav.Screen name="GoalConfirm" component={GoalConfirmScreen} options={{ title: 'Confirm' }} />
    </GoalStackNav.Navigator>
  );
}

const CompletionStackNav = createNativeStackNavigator();
function CompletionStack() {
  return (
    <CompletionStackNav.Navigator screenOptions={stackScreenOptions} initialRouteName="Celebration">
      <CompletionStackNav.Screen name="Celebration" component={CelebrationScreen} options={{ title: 'Completed' }} />
      <CompletionStackNav.Screen name="PhotoUpload" component={PhotoUploadScreen} options={{ title: 'Photo' }} />
      <CompletionStackNav.Screen name="ShareCard" component={ShareCardScreen} options={{ title: 'Share' }} />
    </CompletionStackNav.Navigator>
  );
}

const Tabs = createBottomTabNavigator();
const tabIcon = (name) => ({ color, size }) => <Ionicons name={name} color={color} size={size} />;
function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg.deep },
        headerTintColor: colors.text.primary,
        headerTitleStyle: { color: colors.text.primary, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.bg.deep,
          borderTopColor: colors.border.subtle,
        },
        tabBarActiveTintColor: colors.ochre.soft,
        tabBarInactiveTintColor: colors.text.dim,
      }}
    >
      <Tabs.Screen name="Today" component={TodayScreen} options={{ tabBarIcon: tabIcon('home-outline') }} />
      <Tabs.Screen name="Journey" component={JourneyScreen} options={{ tabBarIcon: tabIcon('map-outline') }} />
      <Tabs.Screen name="Explore" component={ExploreScreen} options={{ tabBarIcon: tabIcon('compass-outline') }} />
    </Tabs.Navigator>
  );
}

const RootStackNav = createNativeStackNavigator();
export default function RootNavigation() {
  return (
    <NavigationContainer theme={navTheme}>
      <RootStackNav.Navigator
        screenOptions={stackScreenOptions}
        initialRouteName="Main"
      >
        <RootStackNav.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <RootStackNav.Screen name="Onboarding" component={OnboardingStack} options={{ headerShown: false, presentation: 'modal' }} />
        <RootStackNav.Screen name="GoalSetup" component={GoalStack} options={{ headerShown: false, presentation: 'modal' }} />
        <RootStackNav.Screen name="Completion" component={CompletionStack} options={{ headerShown: false, presentation: 'modal' }} />
        <RootStackNav.Screen name="StoryCard" component={StoryCardScreen} options={{ title: 'Story Card', presentation: 'modal' }} />
        <RootStackNav.Screen name="JourneyStats" component={JourneyStatsScreen} options={{ title: 'Stats' }} />
        <RootStackNav.Screen name="MonthlySummary" component={MonthlySummaryScreen} options={{ title: 'Monthly Summary' }} />
      </RootStackNav.Navigator>
    </NavigationContainer>
  );
}
