import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TextField } from '@/components/ui/TextField';
import { ANIS_CHARACTER_ID, findCharacter, getAnisCharacter } from '@/content/characters';
import { useTheme } from '@/lib/ThemeProvider';
import { ai } from '@/lib/ai/client';
import { audioUriToBase64, recordingMimeType } from '@/lib/audio';
import { haptic } from '@/lib/haptics';
import { speakReply, stopSpeaking } from '@/lib/speech';
import { useConversationStore } from '@/stores/useConversationStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { ConversationScore, ConversationTurn } from '@/types';

// Stable empty-history reference. Returning a fresh `[]` from a Zustand v5 selector makes
// React's useSyncExternalStore see a new snapshot every render → infinite loop (React #185).
// Defaulting to this module-level constant outside the selector keeps the reference stable.
const EMPTY_HISTORY: ConversationTurn[] = [];

export default function ConversationChat() {
  const { characterId } = useLocalSearchParams<{ characterId: string }>();
  const theme = useTheme();
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  // Amine is the tutor persona (id 'anis' kept internally) — teaches in your active dialect.
  const character = characterId === ANIS_CHARACTER_ID ? getAnisCharacter(activeDialect) : findCharacter(characterId);

  // Select the raw (possibly undefined) value — both the stored array and `undefined` are
  // stable references across renders. Default to EMPTY_HISTORY *outside* the selector.
  const history = useConversationStore((s) => s.historyByCharacter[characterId]) ?? EMPTY_HISTORY;
  const appendTurn = useConversationStore((s) => s.appendTurn);
  const saveScore = useConversationStore((s) => s.saveScore);
  const addXp = useGamificationStore((s) => s.addXp);
  const addCoins = useGamificationStore((s) => s.addCoins);
  const recordActivity = useGamificationStore((s) => s.recordActivity);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [score, setScore] = useState<ConversationScore | null>(null);
  const [ending, setEnding] = useState(false);
  const [recState, setRecState] = useState<'idle' | 'recording' | 'transcribing'>('idle');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // Stop any in-flight speech when leaving the chat so it doesn't keep talking after you navigate away.
  useEffect(() => stopSpeaking, []);

  if (!character) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.textPrimary }}>Character not found.</Text>
      </View>
    );
  }

  // Speak a reply with the AI voice if a TTS provider is configured, else the free browser voice.
  const voiceReply = (text?: string) => {
    if (!text || text === '...') return;
    void speakReply(text, () => ai.textToSpeech({ text, dialectId: character!.dialectId, voiceKey: character!.voiceId, characterId: character!.id }));
  };

  const sendText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const userTurn: ConversationTurn = { id: `u_${Date.now()}`, speaker: 'user', textEnglish: trimmed, timestamp: Date.now() };
    appendTurn(character!.id, userTurn);
    setSending(true);
    haptic.tap();
    try {
      const { reply } = await ai.chatWithCharacter({ characterId: character!.id, dialectId: character!.dialectId, history: [...history, userTurn], userMessageText: trimmed });
      appendTurn(character!.id, reply);
      voiceReply(reply.textArabic);
    } catch {
      // Backend not configured in this environment — fall back to a friendly local placeholder
      // so the UI stays testable; see supabase/functions/character-chat for the real implementation.
      appendTurn(character!.id, {
        id: `a_${Date.now()}`,
        speaker: 'ai',
        textArabic: '...',
        textEnglish: `(${character!.name} would reply here once the AI backend is connected.)`,
        timestamp: Date.now(),
      });
    } finally {
      setSending(false);
    }
  };

  const send = () => {
    const text = input;
    setInput('');
    void sendText(text);
  };

  // Voice input: record → transcribe with Whisper (free via Groq) → send the transcript.
  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec);
      setRecState('recording');
      haptic.tap();
    } catch {
      setRecState('idle');
    }
  };

  const stopRecordingAndSend = async () => {
    const rec = recording;
    if (!rec) return;
    setRecording(null);
    setRecState('transcribing');
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (!uri) throw new Error('No recording');
      const audioBase64 = await audioUriToBase64(uri);
      const { transcript } = await ai.transcribeSpeech({ audioBase64, dialectId: character!.dialectId, mimeType: recordingMimeType() });
      setRecState('idle');
      if (transcript?.trim()) await sendText(transcript);
    } catch {
      setRecState('idle');
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
          <Icon name="chevronLeft" size={26} color={theme.textPrimary} />
        </AnimatedPressable>
        <LinearGradient colors={[theme.accentGold, theme.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: undefined, fontSize: 22, fontWeight: '900', color: theme.primaryText }}>{character.nameArabic?.[0] ?? character.avatar}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 15 }}>{character.name}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{character.role} · here now</Text>
        </View>
        <AnimatedPressable
          onPress={endConversation}
          disabled={ending || history.length === 0}
          style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, opacity: history.length === 0 ? 0.5 : 1 }}
        >
          <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 13 }}>{ending ? 'Scoring…' : 'End'}</Text>
        </AnimatedPressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={90}>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8 }}
          ListEmptyComponent={
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
              Say hello to {character.name} to start talking.
            </Text>
          }
          renderItem={({ item }) => {
            const isUser = item.speaker === 'user';
            const canSpeak = !isUser && !!item.textArabic && item.textArabic !== '...';
            const align = isUser ? 'right' : 'left';
            return (
              <View style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border, opacity: 1 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', color: isUser ? theme.accentDiamond : theme.textSecondary, textAlign: align }}>
                  {isUser ? 'You' : character.name}
                </Text>
                {item.textArabic && item.textArabic !== '...' ? (
                  <Text style={{ color: theme.textPrimary, fontSize: 26, lineHeight: 40, fontWeight: '700', writingDirection: 'rtl', textAlign: 'right', marginTop: 8 }}>
                    {item.textArabic}
                  </Text>
                ) : null}
                {item.textTransliteration ? (
                  <Text style={{ color: theme.accentGold, fontSize: 15, fontStyle: 'italic', marginTop: 4, textAlign: align }}>{item.textTransliteration}</Text>
                ) : null}
                {item.textEnglish ? (
                  <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 3, textAlign: align }}>{item.textEnglish}</Text>
                ) : null}
                {canSpeak ? (
                  <AnimatedPressable
                    onPress={() => voiceReply(item.textArabic)}
                    withHaptic={false}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10, alignSelf: 'flex-start' }}
                  >
                    <Icon name="speak" size={16} color={theme.accentGold} />
                    <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '700' }}>Replay</Text>
                  </AnimatedPressable>
                ) : null}
              </View>
            );
          }}
        />
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <TextField
              placeholder={recState === 'recording' ? 'Listening…' : recState === 'transcribing' ? 'Transcribing…' : 'Type, or tap the mic…'}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={send}
              editable={recState === 'idle'}
            />
          </View>
          {/* Mic — tap to start, tap to stop. Records → Whisper → sends the transcript. */}
          <AnimatedPressable
            onPress={recState === 'recording' ? stopRecordingAndSend : startRecording}
            disabled={sending || recState === 'transcribing'}
            withHaptic={false}
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: recState === 'recording' ? theme.danger : theme.surfaceElevated,
              borderWidth: 1,
              borderColor: recState === 'recording' ? theme.danger : theme.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={recState === 'recording' ? 'close' : 'mic'} size={22} color={recState === 'recording' ? '#fff' : theme.textPrimary} />
          </AnimatedPressable>
          <AnimatedPressable
            onPress={send}
            disabled={sending || !input.trim()}
            style={{ width: 52, height: 52, borderRadius: 16, overflow: 'hidden', opacity: !input.trim() ? 0.5 : 1 }}
          >
            <LinearGradient colors={[theme.accentGold, theme.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="send" size={22} color={theme.primaryText} />
            </LinearGradient>
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
