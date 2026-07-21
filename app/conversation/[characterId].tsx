import { useLocalSearchParams, router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { AI_CHARACTERS } from '@/content/characters';
import { useTheme } from '@/lib/ThemeProvider';
import { ai } from '@/lib/ai/client';
import { haptic } from '@/lib/haptics';
import { useConversationStore } from '@/stores/useConversationStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import type { ConversationScore, ConversationTurn } from '@/types';

export default function ConversationChat() {
  const { characterId } = useLocalSearchParams<{ characterId: string }>();
  const theme = useTheme();
  const character = AI_CHARACTERS.find((c) => c.id === characterId);

  const history = useConversationStore((s) => s.historyByCharacter[characterId] ?? []);
  const appendTurn = useConversationStore((s) => s.appendTurn);
  const saveScore = useConversationStore((s) => s.saveScore);
  const addXp = useGamificationStore((s) => s.addXp);
  const addCoins = useGamificationStore((s) => s.addCoins);
  const recordActivity = useGamificationStore((s) => s.recordActivity);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [score, setScore] = useState<ConversationScore | null>(null);
  const [ending, setEnding] = useState(false);

  if (!character) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.textPrimary }}>Character not found.</Text>
      </View>
    );
  }

  const send = async () => {
    if (!input.trim() || sending) return;
    const userTurn: ConversationTurn = { id: `u_${Date.now()}`, speaker: 'user', textEnglish: input, timestamp: Date.now() };
    appendTurn(character.id, userTurn);
    setInput('');
    setSending(true);
    haptic.tap();
    try {
      const { reply } = await ai.chatWithCharacter({ characterId: character.id, history: [...history, userTurn], userMessageText: input });
      appendTurn(character.id, reply);
    } catch {
      // Backend not configured in this environment — fall back to a friendly local placeholder
      // so the UI stays testable; see supabase/functions/character-chat for the real implementation.
      appendTurn(character.id, {
        id: `a_${Date.now()}`,
        speaker: 'ai',
        textArabic: '...',
        textEnglish: `(${character.name} would reply here once the AI backend is connected.)`,
        timestamp: Date.now(),
      });
    } finally {
      setSending(false);
    }
  };

  const endConversation = async () => {
    setEnding(true);
    try {
      const result = await ai.scoreConversation({ history, dialectId: character.dialectId, characterId: character.id });
      setScore(result);
      saveScore(character.id, result);
      const xp = Math.round(result.overall * 0.6);
      addXp(xp);
      addCoins(15);
      recordActivity({ conversationsCompleted: 1 });
    } catch {
      const fallback: ConversationScore = {
        pronunciation: 70,
        grammar: 70,
        vocabulary: 70,
        confidence: 70,
        naturalness: 70,
        fluency: 70,
        overall: 70,
        corrections: [],
        strengths: ['You kept the conversation going!'],
        areasToImprove: ['Connect the AI backend for detailed, personalized scoring.'],
      };
      setScore(fallback);
      saveScore(character.id, fallback);
      addXp(40);
      addCoins(15);
      recordActivity({ conversationsCompleted: 1 });
    } finally {
      setEnding(false);
    }
  };

  if (score) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: theme.textPrimary }}>Conversation Report</Text>
        <View style={{ marginTop: 20, gap: 10 }}>
          {(
            [
              ['Pronunciation', score.pronunciation],
              ['Grammar', score.grammar],
              ['Vocabulary', score.vocabulary],
              ['Confidence', score.confidence],
              ['Naturalness', score.naturalness],
              ['Fluency', score.fluency],
            ] as const
          ).map(([label, value]) => (
            <View key={label}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{label}</Text>
                <Text style={{ color: theme.textSecondary }}>{value}</Text>
              </View>
              <View style={{ height: 6, borderRadius: 999, backgroundColor: theme.border, marginTop: 4 }}>
                <View style={{ height: '100%', width: `${value}%`, backgroundColor: theme.primary, borderRadius: 999 }} />
              </View>
            </View>
          ))}
        </View>
        {score.areasToImprove.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>Areas to improve</Text>
            {score.areasToImprove.map((a, i) => (
              <Text key={i} style={{ color: theme.textSecondary, marginTop: 4 }}>• {a}</Text>
            ))}
          </View>
        )}
        <View style={{ marginTop: 32 }}>
          <Button label="Done" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <AnimatedPressable onPress={() => router.back()} withHaptic={false}>
          <Text style={{ fontSize: 20, color: theme.textSecondary }}>‹</Text>
        </AnimatedPressable>
        <Text style={{ fontSize: 24 }}>{character.avatar}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{character.name}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{character.role}</Text>
        </View>
        <AnimatedPressable onPress={endConversation} disabled={ending || history.length === 0}>
          <Text style={{ color: theme.primary, fontWeight: '700' }}>{ending ? 'Scoring...' : 'End'}</Text>
        </AnimatedPressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={90}>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
              Say hello to {character.name} to start the conversation.
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={{
                alignSelf: item.speaker === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: item.speaker === 'user' ? theme.primary : theme.surfaceElevated,
                borderWidth: item.speaker === 'user' ? 0 : 1,
                borderColor: theme.border,
                borderRadius: 16,
                padding: 12,
                maxWidth: '80%',
              }}
            >
              {item.textArabic ? (
                <Text style={{ color: item.speaker === 'user' ? theme.primaryText : theme.textPrimary, fontWeight: '700', marginBottom: 2 }}>
                  {item.textArabic}
                </Text>
              ) : null}
              <Text style={{ color: item.speaker === 'user' ? theme.primaryText : theme.textPrimary }}>{item.textEnglish}</Text>
            </View>
          )}
        />
        <View style={{ flexDirection: 'row', gap: 10, padding: 16, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <TextField placeholder="Type a message..." value={input} onChangeText={setInput} onSubmitEditing={send} />
          </View>
          <AnimatedPressable onPress={send} disabled={sending || !input.trim()} style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20 }}>➤</Text>
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
