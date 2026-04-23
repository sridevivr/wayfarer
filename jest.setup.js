// Silence noisy native-only warnings under jsdom and stub modules that
// can't run in Node. Keep this file tiny — per-test mocks live next to
// the test, not here.

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  const React = require('react');
  const make = (label) => (props) =>
    React.createElement(Text, { accessibilityLabel: `icon-${label}:${props.name ?? ''}` });
  return {
    Ionicons: make('ion'),
    MaterialIcons: make('mat'),
    Feather: make('fea'),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => React.createElement(View, null, children),
    SafeAreaView: ({ children, ...rest }) => React.createElement(View, rest, children),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// react-native-svg's primitives reach into native code on import. Stub
// every element we use as a passthrough View so render trees stay
// inspectable in tests.
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const stub = (name) => {
    const C = ({ children, ...rest }) => React.createElement(View, { testID: name, ...rest }, children);
    C.displayName = name;
    return C;
  };
  return {
    __esModule: true,
    default: stub('Svg'),
    Svg: stub('Svg'),
    Circle: stub('Circle'),
    Defs: stub('Defs'),
    G: stub('G'),
    Line: stub('Line'),
    LinearGradient: stub('LinearGradient'),
    Path: stub('Path'),
    Rect: stub('Rect'),
    Stop: stub('Stop'),
  };
});
