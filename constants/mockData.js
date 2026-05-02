// Hardcoded mock data for Milestone 4. Every number on the Today, Journey,
// StoryCard, and JourneyStats screens reads from here so the dummy values
// stay internally consistent (steps, distances, percentages all line up).
//
// In M5+ this file disappears — replaced by AsyncStorage reads in the
// hooks layer (useFitbit, useGoal, useStoryCards). Until then, screens
// import from here directly.

const STRIDE_STEPS_PER_MILE = 2246;

const goal = {
  id: 'goal_001',
  origin: 'Somerville, MA',
  destination: 'San Francisco, CA',
  routeType: 'scenic',
  totalMiles: 3095,
  cumulativeMiles: 1053,
  daysActive: 34,
  daysProjected: 87,
  daysRemaining: 53,
  startDate: '2026-03-10T00:00:00Z',
  projectedEndDate: 'June 12, 2026',
  currentLocation: 'Columbus, Ohio',
};

const stepsForMiles = (mi) => Math.round(mi * STRIDE_STEPS_PER_MILE);

const today = {
  steps: 4821,
  dailyAveragePct: 71,
  dailyAverage: 6832,
  monthlyMiles: 47,
  monthlyComparison: "Boston to Providence",
};

const upcoming = [
  { id: 'up_1', name: 'Rock and Roll Hall of Fame', miles: 38 },
  { id: 'up_2', name: 'Indiana border', miles: 112 },
  { id: 'up_3', name: 'Chicago, Illinois', miles: 190 },
];

const storyCards = [
  {
    id: 'story_001',
    title: 'Crossed into New York',
    locationName: 'New York border',
    triggerType: 'stateBorder',
    read: true,
    createdAt: '2026-03-25T00:00:00Z',
    body: '',
  },
  {
    id: 'story_002',
    title: 'In the Alleghenies',
    locationName: 'Pennsylvania',
    triggerType: 'landmark',
    read: true,
    createdAt: '2026-04-04T00:00:00Z',
    body: '',
  },
  {
    id: 'story_003',
    title: "You've crossed into Ohio",
    locationName: 'Columbus, Ohio',
    triggerType: 'stateBorder',
    read: false,
    createdAt: '2026-04-13T00:00:00Z',
    tagLabel: 'State milestone',
    tagColor: 'sage',
    headerLabel: 'Story · Day 34',
    body: [
      "You've been walking for 34 days and have just crossed the Pennsylvania-Ohio border. Ahead lies the broad, flat expanse of the Midwest — a landscape that rewards the long walker with a real sense of distance conquered.",
      "Columbus sits at the heart of Ohio. Known for its university energy and quietly excellent food scene, it's a city that rewards the curious traveler.",
    ],
  },
];

const journey = {
  goal,
  today,
  upcoming,
  storyCards,
  // Pre-computed because these strings show up in multiple screens.
  pctComplete: Math.round((goal.cumulativeMiles / goal.totalMiles) * 100),
  remainingMiles: goal.totalMiles - goal.cumulativeMiles,
  totalSteps: stepsForMiles(goal.totalMiles),
  cumulativeSteps: stepsForMiles(goal.cumulativeMiles),
  remainingSteps: stepsForMiles(goal.totalMiles - goal.cumulativeMiles),
  strideStepsPerMile: STRIDE_STEPS_PER_MILE,
};

const suggestions = [
  { id: 's1', name: 'Walk home to Hanover, NH', miles: 130, days: 43, tag: 'Home', tagColor: 'terra' },
  { id: 's2', name: 'San Francisco, CA', miles: 3095, days: 1020, tag: 'Bucket list', tagColor: 'ochre' },
  { id: 's3', name: 'Yellowstone National Park', miles: 2200, days: 725, tag: 'Bucket list', tagColor: 'ochre' },
];

const curated = [
  { id: 'c1', name: 'Pacific Coast Highway', subtitle: "Scenic · Editors' pick" },
  { id: 'c2', name: 'Blue Ridge Parkway', subtitle: "Scenic · Editors' pick" },
];

export const mockJourney = journey;
export const mockSuggestions = suggestions;
export const mockCurated = curated;
export const mockStrideStepsPerMile = STRIDE_STEPS_PER_MILE;

// Pure helpers — exported for tests + reuse in screens.
export function milesToSteps(miles, stride = STRIDE_STEPS_PER_MILE) {
  return Math.round(miles * stride);
}

export function formatSteps(n) {
  return n.toLocaleString('en-US');
}

export function formatStepsApprox(n) {
  if (n >= 1_000_000) return `~${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M steps`;
  if (n >= 1_000) return `~${Math.round(n / 1_000)}k steps`;
  return `${n} steps`;
}
