import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Lock, Play, Dumbbell } from 'lucide-react-native';
import { colors, spacing, radius, typography } from '../../src/theme/colors';
import { Badge } from '../../src/components';

const categories = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio'];

const exercises = [
  { name: 'Bench Press', category: 'Chest', sets: '4x8', equipment: 'Barbell', premium: false },
  { name: 'Incline Dumbbell Press', category: 'Chest', sets: '3x10', equipment: 'Dumbbell', premium: true },
  { name: 'Pull-ups', category: 'Back', sets: '4x8', equipment: 'Bodyweight', premium: false },
  { name: 'Deadlift', category: 'Back', sets: '3x5', equipment: 'Barbell', premium: true },
  { name: 'Squats', category: 'Legs', sets: '4x8', equipment: 'Barbell', premium: false },
  { name: 'Leg Press', category: 'Legs', sets: '3x12', equipment: 'Machine', premium: true },
  { name: 'Bicep Curls', category: 'Arms', sets: '3x12', equipment: 'Dumbbell', premium: false },
  { name: 'Plank', category: 'Core', sets: '3x60s', equipment: 'Bodyweight', premium: false },
  { name: 'Treadmill HIIT', category: 'Cardio', sets: '20 min', equipment: 'Treadmill', premium: true },
];

export default function ExercisesScreen() {
  const [cat, setCat] = useState('All');

  const filtered = exercises.filter(e => cat === 'All' || e.category === cat);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercises</Text>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabs}>
        {categories.map(c => (
          <TouchableOpacity key={c} style={[styles.tab, cat === c && styles.tabActive]} onPress={() => setCat(c)}>
            <Text style={[styles.tabText, cat === c && styles.tabTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercise Cards */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.map(e => (
          <View key={e.name} style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.exIcon}>
                <Dumbbell size={20} color={colors.primary} />
              </View>
              <View style={styles.exInfo}>
                <Text style={styles.exName}>{e.name}</Text>
                <Text style={styles.exSub}>{e.equipment} · {e.sets}</Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              {e.premium && <Badge label="PREMIUM" type="premium" />}
              <TouchableOpacity style={[styles.playBtn, e.premium && styles.playBtnLocked]}>
                {e.premium ? <Lock size={16} color={colors.textMuted} /> : <Play size={16} color={colors.textPrimary} />}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.md },
  tabScroll: { flexGrow: 0, marginBottom: spacing.md },
  tabs: { gap: spacing.sm, paddingRight: spacing.md },
  tab: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.pill, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primaryDark, borderColor: colors.primary },
  tabText: { ...typography.body, color: colors.textSecondary },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
  list: { gap: 12, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.card,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  exIcon: {
    width: 44, height: 44, borderRadius: radius.icon,
    backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center',
  },
  exInfo: { flex: 1 },
  exName: { ...typography.h3, color: colors.textPrimary },
  exSub: { ...typography.caption, color: colors.textSecondary },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  playBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  playBtnLocked: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
