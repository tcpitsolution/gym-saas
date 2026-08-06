import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
  Modal, FlatList,
} from 'react-native';
import { Brain, Send, Plus, Trash2, Clock, X, Lock } from 'lucide-react-native';
import { spacing, radius, typography } from '../theme/colors';
import { useTheme } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { aiApi } from '../api';

const SUGGESTIONS = [
  { icon: '📊', text: 'Give me a summary of my gym' },
  { icon: '⏰', text: 'Who is expiring soon?' },
  { icon: '💰', text: 'Who has pending payments?' },
  { icon: '🏃', text: "Who hasn't visited in a while?" },
  { icon: '📈', text: 'How is my revenue this month?' },
  { icon: '💪', text: 'Tips to retain more members' },
];

type Message = { role: 'user' | 'ai'; text: string };

// Simple bold (**text**) renderer
function renderText(text: string, textColor: string, mutedColor: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <Text style={{ color: mutedColor, fontSize: 14, lineHeight: 21 }}>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <Text key={i} style={{ fontWeight: '700', color: textColor }}>{part.slice(2, -2)}</Text>
          : <Text key={i}>{part}</Text>
      )}
    </Text>
  );
}

export default function AskAIScreen() {
  const colors = useTheme();
  const s = getStyles(colors);
  const { user } = useAuthStore();
  const aiEnabled = user?.features?.askai !== false;

  // If feature is locked, show locked screen
  if (!aiEnabled) {
    return (
      <View style={[s.container, { alignItems: 'center', justifyContent: 'center', padding: spacing.lg }]}>
        <View style={[s.lockIconBox, { backgroundColor: 'rgba(255,90,54,0.12)' }]}>
          <Lock size={40} color={colors.primary} />
        </View>
        <Text style={[s.lockTitle, { color: colors.textPrimary }]}>AI Assistant Locked</Text>
        <Text style={[s.lockDesc, { color: colors.textSecondary }]}>
          The AI Assistant feature is not included in your current plan. Contact your admin to unlock it.
        </Text>
        <View style={[s.lockBadge, { backgroundColor: 'rgba(255,90,54,0.1)', borderColor: 'rgba(255,90,54,0.3)' }]}>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>📞 Contact Admin to Unlock</Text>
        </View>
      </View>
    );
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const [conversations, setConversations] = useState<any[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const loadConversations = useCallback(async () => {
    try {
      const data = await aiApi.getConversations();
      setConversations(data);
    } catch {}
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const openConversation = async (id: string) => {
    if (id === conversationId) { setHistoryOpen(false); return; }
    setHistoryLoading(true);
    setHistoryOpen(false);
    try {
      const data = await aiApi.getConversation(id);
      setMessages(data.messages.map((m: any) => ({ role: m.role, text: m.text })));
      setConversationId(id);
    } catch {}
    setHistoryLoading(false);
  };

  const deleteConversation = async (id: string) => {
    try {
      await aiApi.deleteConversation(id);
      setConversations(prev => prev.filter(c => c._id !== id));
      if (id === conversationId) clearChat();
    } catch {}
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(undefined);
  };

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      const res = await aiApi.chat(q, conversationId);
      setConversationId(res.conversationId);
      setMessages(prev => [...prev, { role: 'ai', text: res.answer }]);
      loadConversations();
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.historyBtn} onPress={() => setHistoryOpen(true)} activeOpacity={0.7}>
          <Clock size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.aiIcon}><Brain size={20} color={colors.purple} /></View>
          <View>
            <Text style={s.headerTitle}>FlexOps AI</Text>
            <Text style={s.headerSub}>Ask anything about your gym</Text>
          </View>
        </View>
        <TouchableOpacity style={s.newChatBtn} onPress={clearChat} activeOpacity={0.7}>
          <Plus size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={s.messages}
        contentContainerStyle={s.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {historyLoading ? (
          <View style={s.centerState}>
            <ActivityIndicator color={colors.purple} size="large" />
            <Text style={s.centerStateText}>Loading conversation...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🏋️</Text>
            <Text style={s.emptyTitle}>What can I help you with?</Text>
            <Text style={s.emptySub}>Ask about members, revenue, fitness tips, or business advice</Text>
            <View style={s.suggestions}>
              {SUGGESTIONS.map(sg => (
                <TouchableOpacity
                  key={sg.text}
                  style={s.chip}
                  onPress={() => send(sg.text)}
                  activeOpacity={0.7}
                >
                  <Text style={s.chipIcon}>{sg.icon}</Text>
                  <Text style={s.chipText}>{sg.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <>
            {messages.map((m, i) => (
              <View key={i} style={[s.msgRow, m.role === 'user' ? s.msgRowUser : s.msgRowAi]}>
                {m.role === 'ai' && (
                  <View style={s.aiBadge}><Text>🤖</Text></View>
                )}
                <View style={[s.bubble, m.role === 'user' ? s.bubbleUser : s.bubbleAi]}>
                  {m.role === 'ai'
                    ? renderText(m.text, colors.textPrimary, colors.textSecondary)
                    : <Text style={s.bubbleUserText}>{m.text}</Text>
                  }
                </View>
              </View>
            ))}
            {loading && (
              <View style={[s.msgRow, s.msgRowAi]}>
                <View style={s.aiBadge}><Text>🤖</Text></View>
                <View style={[s.bubble, s.bubbleAi, s.thinkingBubble]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[s.chipText, { marginLeft: spacing.xs }]}>Thinking...</Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Input */}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder="Ask anything about your gym..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          onSubmitEditing={() => send(input)}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!input.trim() || loading) && { opacity: 0.5 }]}
          onPress={() => send(input)}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <Send size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* History Modal */}
      <Modal visible={historyOpen} transparent animationType="slide" onRequestClose={() => setHistoryOpen(false)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setHistoryOpen(false)} />
          <View style={[s.historySheet, { backgroundColor: colors.surface }]}>
            <View style={s.historyHeader}>
              <Text style={[s.historyTitle, { color: colors.textPrimary }]}>Chat History</Text>
              <TouchableOpacity onPress={() => setHistoryOpen(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={s.newChatRow}
              onPress={() => { clearChat(); setHistoryOpen(false); }}
              activeOpacity={0.8}
            >
              <Plus size={15} color={colors.primary} />
              <Text style={[s.newChatText, { color: colors.primary }]}>New Chat</Text>
            </TouchableOpacity>

            {conversations.length === 0 ? (
              <View style={s.centerState}>
                <Text style={s.centerStateText}>No past chats yet</Text>
              </View>
            ) : (
              <FlatList
                data={conversations}
                keyExtractor={c => c._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[s.historyItem, item._id === conversationId && { backgroundColor: colors.surfaceElevated }]}
                    onPress={() => openConversation(item._id)}
                    activeOpacity={0.7}
                  >
                    <Brain size={14} color={colors.purple} style={{ marginTop: 2 }} />
                    <Text style={[s.historyItemText, { color: item._id === conversationId ? colors.textPrimary : colors.textSecondary }]} numberOfLines={1}>
                      {item.title || 'Untitled'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => deleteConversation(item._id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={14} color={colors.error} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    aiIcon: {
      width: 38, height: 38, borderRadius: radius.icon,
      backgroundColor: colors.purpleBg, alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { ...typography.h3, color: colors.textPrimary },
    headerSub: { ...typography.caption, color: colors.textMuted },
    historyBtn: {
      width: 36, height: 36, borderRadius: radius.button,
      backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    newChatBtn: {
      width: 36, height: 36, borderRadius: radius.button,
      backgroundColor: `${colors.primary}18`, borderWidth: 1, borderColor: `${colors.primary}40`,
      alignItems: 'center', justifyContent: 'center',
    },

    messages: { flex: 1 },
    messagesContent: { padding: spacing.md, paddingBottom: spacing.lg, flexGrow: 1 },

    centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl },
    centerStateText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },

    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
    emptySub: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.lg },
    suggestions: { width: '100%', gap: spacing.sm },
    chip: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      backgroundColor: colors.surface, borderRadius: radius.button,
      borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: spacing.md, paddingVertical: 10,
    },
    chipIcon: { fontSize: 16 },
    chipText: { ...typography.caption, color: colors.textSecondary, flex: 1 },

    msgRow: { flexDirection: 'row', marginBottom: spacing.sm, alignItems: 'flex-end' },
    msgRowUser: { justifyContent: 'flex-end' },
    msgRowAi: { justifyContent: 'flex-start' },
    aiBadge: {
      width: 30, height: 30, borderRadius: 15,
      backgroundColor: `${colors.primary}18`,
      alignItems: 'center', justifyContent: 'center',
      marginRight: spacing.xs, marginBottom: 2,
    },
    bubble: { maxWidth: '80%', borderRadius: radius.card, padding: spacing.sm + 2 },
    bubbleUser: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    bubbleAi: {
      backgroundColor: colors.surface,
      borderWidth: 1, borderColor: colors.border,
      borderBottomLeftRadius: 4,
    },
    bubbleUserText: { ...typography.body, color: '#fff' },
    thinkingBubble: { flexDirection: 'row', alignItems: 'center' },

    inputRow: {
      flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
      padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
    },
    input: {
      flex: 1, ...typography.body, color: colors.textPrimary,
      backgroundColor: colors.surface, borderRadius: radius.button,
      borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      maxHeight: 100,
    },
    sendBtn: {
      width: 44, height: 44, borderRadius: radius.button,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    },

    // History modal
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    historySheet: {
      borderTopLeftRadius: radius.card * 1.5, borderTopRightRadius: radius.card * 1.5,
      padding: spacing.md, maxHeight: '75%', minHeight: 300,
    },
    historyHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    historyTitle: { ...typography.h3 },
    newChatRow: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
      backgroundColor: `${colors.primary}12`, borderRadius: radius.button,
      borderWidth: 1, borderColor: `${colors.primary}30`,
      paddingHorizontal: spacing.md, paddingVertical: 10,
      marginBottom: spacing.sm,
    },
    newChatText: { ...typography.button, fontWeight: '700' },
    historyItem: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      paddingVertical: 12, paddingHorizontal: spacing.sm,
      borderRadius: radius.button, marginBottom: 2,
    },
    historyItemText: { ...typography.body, flex: 1 },

    // Locked state
    lockIconBox: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
    lockTitle: { ...typography.h2, marginBottom: spacing.xs, textAlign: 'center' },
    lockDesc: { ...typography.body, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 22, paddingHorizontal: spacing.md },
    lockBadge: { paddingHorizontal: spacing.lg, paddingVertical: 14, borderRadius: radius.button, borderWidth: 1 },
  });
}
