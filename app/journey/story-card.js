import { useNavigation, useRoute } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import Button from '../../components/Button';
import StatTile from '../../components/StatTile';
import Tag from '../../components/Tag';
import { colors } from '../../constants/colors';
import { fonts, type } from '../../constants/fonts';
import { mockJourney } from '../../constants/mockData';

// Story reader. Pulls the unread story by id (or falls back to whichever
// story is unread). Header is a "Story · Day N" tag — the back chevron
// belongs to the parent native-stack header. Body is two paragraphs and
// a 3-up stat tile row, then a "Keep walking →" CTA back to the map.
export default function StoryCardScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const story =
    mockJourney.storyCards.find((s) => s.id === route.params?.id) ??
    mockJourney.storyCards.find((s) => !s.read) ??
    mockJourney.storyCards[mockJourney.storyCards.length - 1];

  const { goal, pctComplete, remainingMiles } = mockJourney;

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Tag label={story.headerLabel ?? `Story · Day ${goal.daysActive}`} color="ochre" />
      </View>

      <View style={styles.hero}>
        <Svg viewBox="0 0 340 150" width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
          {Array.from({ length: 20 }).map((_, i) => {
            const fill =
              i % 3 === 0 ? colors.ochre.base : i % 3 === 1 ? colors.sage.soft : colors.terra.base;
            return (
              <Circle
                key={i}
                cx={20 + i * 16}
                cy={40 + Math.sin(i) * 28}
                r={1.5 + (i % 3)}
                fill={fill}
                opacity={0.25 + i * 0.025}
              />
            );
          })}
          <Path
            d="M0,150 Q60,115 120,125 Q180,135 240,105 Q290,85 340,100 L340,150Z"
            fill="rgba(20,35,15,0.8)"
          />
        </Svg>
        <View style={styles.heroCenter}>
          <Text style={styles.heroGlyph}>◈</Text>
          <Text style={styles.heroLocation}>{story.locationName}</Text>
        </View>
      </View>

      {story.tagLabel ? (
        <Tag label={story.tagLabel} color={story.tagColor ?? 'sage'} style={{ marginBottom: 4 }} />
      ) : null}
      <Text style={styles.title}>{story.title}</Text>
      {(Array.isArray(story.body) ? story.body : [story.body]).filter(Boolean).map((p, i) => (
        <Text key={i} style={[type.body, styles.para]}>{p}</Text>
      ))}

      <View style={styles.divider} />

      <View style={styles.stats}>
        <StatTile value={String(goal.daysActive)} label="Days" />
        <StatTile value={goal.cumulativeMiles.toLocaleString('en-US')} label="Miles" />
        <StatTile value={remainingMiles.toLocaleString('en-US')} label="To go" />
      </View>

      <Button label="Keep walking →" onPress={() => navigation.navigate('Main', { screen: 'Journey' })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: colors.bg.primary },
  scroll: { padding: 16, paddingBottom: 32 },

  headerRow: { flexDirection: 'row', marginBottom: 20 },

  hero: {
    height: 150,
    borderRadius: 14,
    backgroundColor: 'rgba(15,25,12,0.85)',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCenter: { alignItems: 'center' },
  heroGlyph: {
    fontSize: 26,
    color: colors.ochre.soft,
    marginBottom: 4,
  },
  heroLocation: {
    fontFamily: fonts.sans.semibold,
    fontSize: 11,
    color: colors.text.secondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  title: {
    fontFamily: fonts.serif.semibold,
    fontSize: 22,
    color: colors.text.primary,
    marginTop: 10,
    marginBottom: 14,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  para: { marginBottom: 12 },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
});
