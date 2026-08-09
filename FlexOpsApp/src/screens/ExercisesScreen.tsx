import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Play, ChevronRight } from 'lucide-react-native';
import { spacing, radius, typography } from '../theme/colors';
import { useTheme } from '../store/themeStore';
import { useNavigationStore } from '../store/navigationStore';

export type Exercise = {
  name: string;
  category: string;
  sets: string;
  equipment: string;
  premium: boolean;
  videoUrl: string;
  imageUrl: string;
  steps: string[];
  tips: string[];
  commonMistakes: string[];
};

export const exercises: Exercise[] = [
  {
    name: 'Bench Press',
    category: 'Chest',
    sets: '4x8',
    equipment: 'Barbell',
    premium: false,
    videoUrl: 'https://www.youtube.com/watch?v=4Y2ZdHCOXok',
    imageUrl: 'https://img.youtube.com/vi/4Y2ZdHCOXok/hqdefault.jpg',
    steps: [
      'Lie on bench with eyes directly under the bar.',
      'Grip bar slightly wider than shoulder width.',
      'Plant feet firmly on the floor and brace your core.',
      'Unrack the bar and hold it over your chest.',
      'Lower bar to lower chest with controlled motion.',
      'Press bar back up in a slight arc to starting position.',
    ],
    tips: ['Keep shoulder blades pulled back and down.', 'Keep wrists stacked over elbows.', 'Do not bounce bar off chest.'],
    commonMistakes: ['Flaring elbows too wide', 'Lifting hips off bench', 'Uneven grip width'],
  },
  {
    name: 'Incline Dumbbell Press',
    category: 'Chest',
    sets: '3x10',
    equipment: 'Dumbbell',
    premium: false,
    videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
    imageUrl: 'https://img.youtube.com/vi/8iPEnn-ltC8/hqdefault.jpg',
    steps: [
      'Set bench to 30–45 degree incline.',
      'Hold dumbbells at shoulder level, palms facing forward.',
      'Press dumbbells up until arms are fully extended.',
      'Lower slowly back to starting position.',
    ],
    tips: ['Keep core tight throughout.', 'Control the descent — 2 seconds down.'],
    commonMistakes: ['Setting incline too steep (over 45°)', 'Letting dumbbells drift too far apart'],
  },
  {
    name: 'Pull-ups',
    category: 'Back',
    sets: '4x8',
    equipment: 'Bodyweight',
    premium: false,
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    imageUrl: 'https://img.youtube.com/vi/eGo4IYlbE5g/hqdefault.jpg',
    steps: [
      'Hang from bar with overhand grip, hands shoulder-width apart.',
      'Engage your core and squeeze shoulder blades together.',
      'Pull your chest toward the bar by driving elbows down.',
      'Pause at the top, then lower slowly.',
    ],
    tips: ['Avoid swinging or kipping.', 'Full range of motion — start from dead hang.'],
    commonMistakes: ['Partial reps', 'Shrugging shoulders at the top', 'Using momentum'],
  },
  {
    name: 'Deadlift',
    category: 'Back',
    sets: '3x5',
    equipment: 'Barbell',
    premium: false,
    videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    imageUrl: 'https://img.youtube.com/vi/op9kVnSso6Q/hqdefault.jpg',
    steps: [
      'Stand with feet hip-width apart, bar over mid-foot.',
      'Hinge at hips and grip bar just outside your legs.',
      'Flatten your back and brace your core hard.',
      'Push the floor away — drive hips forward as bar passes knees.',
      'Stand tall at the top, then hinge back down with control.',
    ],
    tips: ['Keep bar close to body throughout the lift.', 'Do not jerk the bar off the floor.'],
    commonMistakes: ['Rounding lower back', 'Bar drifting away from body', 'Looking up too much'],
  },
  {
    name: 'Squats',
    category: 'Legs',
    sets: '4x8',
    equipment: 'Barbell',
    premium: false,
    videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
    imageUrl: 'https://img.youtube.com/vi/ultWZbUMPL8/hqdefault.jpg',
    steps: [
      'Place bar on upper traps, feet shoulder-width apart.',
      'Brace core and take a deep breath.',
      'Push knees out and sit back and down.',
      'Descend until thighs are parallel to floor.',
      'Drive through heels to stand back up.',
    ],
    tips: ['Keep chest up throughout.', 'Knees should track over toes.'],
    commonMistakes: ['Caving knees inward', 'Heels rising off floor', 'Leaning too far forward'],
  },
  {
    name: 'Leg Press',
    category: 'Legs',
    sets: '3x12',
    equipment: 'Machine',
    premium: false,
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    imageUrl: 'https://img.youtube.com/vi/IZxyjW7MPJQ/hqdefault.jpg',
    steps: [
      'Sit in machine with back flat against pad.',
      'Place feet shoulder-width apart on platform.',
      'Release safety handles and lower platform toward chest.',
      'Press back up without locking knees at top.',
    ],
    tips: ['Do not let lower back peel off the seat.', 'Control the negative (lowering) phase.'],
    commonMistakes: ['Locking knees at top', 'Feet too low on platform', 'Partial range of motion'],
  },
  {
    name: 'Bicep Curls',
    category: 'Arms',
    sets: '3x12',
    equipment: 'Dumbbell',
    premium: false,
    videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
    imageUrl: 'https://img.youtube.com/vi/ykJmrZ5v0Oo/hqdefault.jpg',
    steps: [
      'Stand with dumbbells at sides, palms facing forward.',
      'Keep elbows pinned to your sides.',
      'Curl dumbbells up toward shoulders.',
      'Squeeze at the top, then lower slowly.',
    ],
    tips: ['Avoid swinging torso.', 'Full extension at the bottom.'],
    commonMistakes: ['Using momentum', 'Elbows drifting forward', 'Partial reps'],
  },
  {
    name: 'Plank',
    category: 'Core',
    sets: '3x60s',
    equipment: 'Bodyweight',
    premium: false,
    videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
    imageUrl: 'https://img.youtube.com/vi/ASdvN_XEl_c/hqdefault.jpg',
    steps: [
      'Place forearms on floor, elbows under shoulders.',
      'Extend legs behind you, toes on floor.',
      'Keep body in a straight line from head to heels.',
      'Brace core and hold for target time.',
    ],
    tips: ['Do not let hips sag or pike up.', 'Breathe steadily throughout.'],
    commonMistakes: ['Hips too high or too low', 'Holding breath', 'Looking up instead of down'],
  },
  {
    name: 'Treadmill HIIT',
    category: 'Cardio',
    sets: '20 min',
    equipment: 'Treadmill',
    premium: false,
    videoUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
    imageUrl: 'https://img.youtube.com/vi/ml6cT4AZdqI/hqdefault.jpg',
    steps: [
      'Warm up at easy pace for 3 minutes.',
      'Sprint at 80–90% max effort for 30 seconds.',
      'Walk or slow jog for 60 seconds to recover.',
      'Repeat sprint/rest cycle 8–10 times.',
      'Cool down at easy pace for 3 minutes.',
    ],
    tips: ['Stay hydrated.', 'Land mid-foot, not heel.'],
    commonMistakes: ['Skipping warm-up', 'Holding treadmill handles during sprint', 'Going too fast too soon'],
  },
];

const categories = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio'];

export default function ExercisesScreen() {
  const colors = useTheme();
  const { setScreen } = useNavigationStore();
  const [cat, setCat] = useState('All');
  const filtered = exercises.filter(e => cat === 'All' || e.category === cat);

  const handlePress = (e: Exercise) => {
    setScreen('exerciseDetail', { exercise: e });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.md }}>
      <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.md }]}>Exercises</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: spacing.md }} contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.md }}>
        {categories.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.tab, { backgroundColor: colors.surface, borderColor: colors.border }, cat === c && { backgroundColor: colors.primaryDark, borderColor: colors.primary }]}
            onPress={() => setCat(c)}
          >
            <Text style={[styles.tabText, { color: cat === c ? colors.primary : colors.textSecondary, fontWeight: cat === c ? '600' : '400' }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: spacing.xl }}>
        {filtered.map(e => {
          const locked = false;
          return (
            <TouchableOpacity
              key={e.name}
              activeOpacity={0.8}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handlePress(e)}
            >
              <View style={styles.cardLeft}>
                <Image source={{ uri: e.imageUrl }} style={styles.exIcon} resizeMode="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exName, { color: colors.textPrimary }]}>{e.name}</Text>
                  <Text style={[styles.exSub, { color: colors.textSecondary }]}>{e.equipment} · {e.sets}</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <View style={[styles.playBtn, { backgroundColor: colors.primary }]}>
                    <Play size={15} color={colors.textPrimary} />
                  </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1 },
  tabText: { ...typography.body },
  card: { borderRadius: radius.card, padding: spacing.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  exIcon: { width: 56, height: 56, borderRadius: radius.card, overflow: 'hidden' },
  exName: { ...typography.h3 },
  exSub: { ...typography.caption },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  playBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
