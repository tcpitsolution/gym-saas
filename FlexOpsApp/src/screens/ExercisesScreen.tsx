import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Lock, Play, Dumbbell, ChevronRight, X } from 'lucide-react-native';
import { spacing, radius, typography } from '../theme/colors';
import { useTheme } from '../store/themeStore';
import { useNavigationStore } from '../store/navigationStore';
import { useAuthStore } from '../store/authStore';
import { Badge } from '../components';

export type Exercise = {
  name: string;
  category: string;
  sets: string;
  equipment: string;
  premium: boolean;
  videoUrl: string;
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
    premium: true,
    videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
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
    premium: true,
    videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
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
    premium: true,
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
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
    premium: true,
    videoUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
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
  const { user } = useAuthStore();
  const [cat, setCat] = useState('All');
  const [lockModal, setLockModal] = useState(false);
  const filtered = exercises.filter(e => cat === 'All' || e.category === cat);
  const exercisesEnabled = user?.features?.exercises !== false;

  const handlePress = (e: Exercise) => {
    if (!exercisesEnabled || e.premium) { setLockModal(true); return; }
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
          const locked = !exercisesEnabled || e.premium;
          return (
            <TouchableOpacity
              key={e.name}
              activeOpacity={0.8}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: locked ? 0.7 : 1 }]}
              onPress={() => handlePress(e)}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.exIcon, { backgroundColor: locked ? 'rgba(255,90,54,0.1)' : colors.primaryDark }]}>
                  {locked ? <Lock size={20} color={colors.primary} /> : <Dumbbell size={20} color={colors.primary} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exName, { color: colors.textPrimary }]}>{e.name}</Text>
                  <Text style={[styles.exSub, { color: colors.textSecondary }]}>{e.equipment} · {e.sets}</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                {locked ? (
                  <View style={[styles.playBtn, { backgroundColor: 'rgba(255,90,54,0.15)' }]}>
                    <Lock size={15} color={colors.primary} />
                  </View>
                ) : (
                  <View style={[styles.playBtn, { backgroundColor: colors.primary }]}>
                    <Play size={15} color={colors.textPrimary} />
                  </View>
                )}
                <ChevronRight size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lock Modal */}
      <Modal visible={lockModal} transparent animationType="fade" onRequestClose={() => setLockModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setLockModal(false)}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={[styles.lockIcon, { backgroundColor: 'rgba(255,90,54,0.12)' }]}>
              <Lock size={32} color={colors.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Feature Locked</Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              This exercise is part of the premium plan. Contact your admin to unlock full access.
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              onPress={() => setLockModal(false)}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Contact Admin to Unlock</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1 },
  tabText: { ...typography.body },
  card: { borderRadius: radius.card, padding: spacing.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  exIcon: { width: 44, height: 44, borderRadius: radius.icon, alignItems: 'center', justifyContent: 'center' },
  exName: { ...typography.h3 },
  exSub: { ...typography.caption },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  playBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalBox: { width: '100%', maxWidth: 340, borderRadius: radius.card * 1.5, padding: spacing.lg, borderWidth: 1, alignItems: 'center' },
  modalClose: { position: 'absolute', top: spacing.md, right: spacing.md },
  lockIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  modalTitle: { ...typography.h2, marginBottom: spacing.xs, textAlign: 'center' },
  modalDesc: { ...typography.body, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 22 },
  modalBtn: { width: '100%', paddingVertical: 14, borderRadius: radius.button, alignItems: 'center' },
});
