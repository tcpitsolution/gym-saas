import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { ArrowLeft, Play, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react-native';
import { spacing, radius, typography } from '../theme/colors';
import { useTheme } from '../store/themeStore';
import { useNavigationStore } from '../store/navigationStore';
import type { Exercise } from './ExercisesScreen';

export default function ExerciseDetailScreen() {
  const colors = useTheme();
  const { params, setScreen } = useNavigationStore();
  const exercise: Exercise = params?.exercise;

  const [showTips, setShowTips] = useState(false);
  const [showMistakes, setShowMistakes] = useState(false);

  if (!exercise) {
    setScreen('exercises');
    return null;
  }

  const openVideo = () => Linking.openURL(exercise.videoUrl);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setScreen('exercises')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>{exercise.name}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: 16, paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>

        {/* Video Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openVideo}
          style={[styles.videoCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}
        >
          <Image source={{ uri: exercise.imageUrl }} style={styles.videoThumb} resizeMode="cover" />
          <View style={styles.playOverlay}>
            <View style={[styles.playCircle, { backgroundColor: colors.primary }]}>
              <Play size={28} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Meta */}
        <View style={[styles.metaRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[
            { label: 'Sets / Reps', value: exercise.sets },
            { label: 'Equipment', value: exercise.equipment },
            { label: 'Category', value: exercise.category },
          ].map((item, i) => (
            <View key={i} style={[styles.metaItem, i < 2 && { borderRightWidth: 1, borderRightColor: colors.border }]}>
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>{item.label}</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Steps */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <CheckCircle size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>How To Do It</Text>
          </View>
          {exercise.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepNum, { backgroundColor: colors.primaryDark }]}>
                <Text style={[styles.stepNumText, { color: colors.primary }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Tips Accordion */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.accordionHeader} onPress={() => setShowTips(v => !v)} activeOpacity={0.7}>
            <View style={styles.sectionHeader}>
              <Lightbulb size={16} color={colors.warning} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Pro Tips</Text>
            </View>
            {showTips ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
          </TouchableOpacity>
          {showTips && exercise.tips.map((tip, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bullet, { backgroundColor: colors.warning }]} />
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Common Mistakes Accordion */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.accordionHeader} onPress={() => setShowMistakes(v => !v)} activeOpacity={0.7}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={16} color={colors.error} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Common Mistakes</Text>
            </View>
            {showMistakes ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
          </TouchableOpacity>
          {showMistakes && exercise.commonMistakes.map((m, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bullet, { backgroundColor: colors.error }]} />
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>{m}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1 },
  headerTitle: { ...typography.h3, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },
  videoCard: { borderRadius: radius.card, borderWidth: 1, overflow: 'hidden' },
  videoThumb: { height: 200, width: '100%' },
  playOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  playCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', borderRadius: radius.card, borderWidth: 1, overflow: 'hidden' },
  metaItem: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  metaLabel: { ...typography.caption, marginBottom: 2 },
  metaValue: { ...typography.h3 },
  section: { borderRadius: radius.card, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sectionTitle: { ...typography.h3 },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  stepNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNumText: { fontSize: 11, fontWeight: '700' },
  stepText: { ...typography.body, flex: 1, lineHeight: 22 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingTop: spacing.xs },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
});
