import { useNavigation } from '@react-navigation/native';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';

// Milestone 2 scaffold screen. Renders a title, a flow label, a short
// description of what will eventually live here, and optional navigation
// buttons so every screen is reachable end-to-end from the tabs.
//
// `links` is an array of { label, target, params? } where target is either
// { screen: 'ScreenName' } for the root stack or { screen: 'SomeStack',
// params: { screen: 'InnerScreen' } } for a nested navigator.
export default function PlaceholderScreen({ flow, title, description, links = [] }) {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        {flow ? <Text style={styles.flow}>{flow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}

        {links.length > 0 && (
          <View style={styles.linksWrap}>
            {links.map((link) => (
              <Pressable
                key={link.label}
                style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
                onPress={() => navigation.navigate(link.target, link.params)}
              >
                <Text style={styles.linkLabel}>{link.label}</Text>
                <Text style={styles.linkArrow}>›</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  container: {
    padding: 24,
    paddingTop: 32,
  },
  flow: {
    color: colors.text.dim,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    marginBottom: 12,
  },
  description: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  linksWrap: {
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.subtle,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.subtle,
  },
  linkPressed: {
    backgroundColor: colors.bg.cardHover,
  },
  linkLabel: {
    color: colors.ochre.soft,
    fontSize: 15,
    fontWeight: '500',
  },
  linkArrow: {
    color: colors.ochre.soft,
    fontSize: 22,
    fontWeight: '300',
  },
});
