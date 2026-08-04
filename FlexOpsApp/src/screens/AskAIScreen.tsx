import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Brain, Send } from 'lucide-react-native';
import { spacing, radius, typography } from '../theme/colors';
import { useTheme } from '../store/themeStore';

const suggestions = [
  'How many members expire this month?',
  'Show revenue trend for last 3 months',
  'Which plan is most popular?',
  'Members with pending payments',
];

type Message = { role: 'user' | 'ai'; text: string };

export default function AskAIScreen() {
  const colors = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hi! I'm your FlexOps AI Coach. Ask me anything about your gym — members, revenue, attendance, or fitness tips! 💪" },
  ]);
  const [input, setInput] = useState('');

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', text },
      { role: 'ai', text: `I'm analyzing your gym data for: "${text}". This feature will connect to your backend soon!` },
    ]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={[styles.aiIcon, { backgroundColor: colors.purpleBg }]}>
          <Brain size={22} color={colors.purple} />
        </View>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Ask AI</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>Powered by FlexOps Intelligence</Text>
        </View>
      </View>

      <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
        {messages.map((m, i) => (
          <View key={i} style={[
            styles.bubble,
            { backgroundColor: colors.surface, borderColor: colors.border },
            m.role === 'user' && { alignSelf: 'flex-end', backgroundColor: colors.primaryDark, borderColor: colors.primary },
            m.role === 'ai' && { alignSelf: 'flex-start' },
          ]}>
            <Text style={[styles.bubbleText, { color: m.role === 'user' ? colors.textPrimary : colors.textSecondary }]}>{m.text}</Text>
          </View>
        ))}

        {messages.length === 1 && (
          <View style={styles.suggestions}>
            <Text style={[styles.suggestLabel, { color: colors.textMuted }]}>Suggested</Text>
            <View style={styles.chips}>
              {suggestions.map(s => (
                <TouchableOpacity key={s} style={[styles.chip, { backgroundColor: colors.purpleBg, borderColor: colors.purple }]} onPress={() => send(s)} activeOpacity={0.7}>
                  <Text style={[styles.chipText, { color: colors.purple }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
          placeholder="Ask anything about your gym..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={() => send(input)} activeOpacity={0.8}>
          <Send size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderBottomWidth: 1 },
  aiIcon: { width: 44, height: 44, borderRadius: radius.icon, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.h3 },
  sub: { ...typography.caption },
  messages: { flex: 1 },
  messagesContent: { padding: spacing.md, gap: spacing.sm },
  bubble: { maxWidth: '80%', borderRadius: radius.card, padding: spacing.sm + 4, borderWidth: 1 },
  bubbleText: { ...typography.body },
  suggestions: { marginTop: spacing.md },
  suggestLabel: { ...typography.caption, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1 },
  chipText: { ...typography.caption },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, padding: spacing.md, borderTopWidth: 1 },
  input: { flex: 1, ...typography.body, borderRadius: radius.button, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
});
