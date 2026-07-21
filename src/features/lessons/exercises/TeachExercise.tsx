import React, { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { DIALECTS } from '@/content/dialectMeta';
import { VOCAB_BY_ID } from '@/content/dialects';
import { useTheme } from '@/lib/ThemeProvider';
import { speakArabic } from '@/lib/speech';
import type { DialectId, Exercise } from '@/types';

interface Props {
  exercise: Exercise;
  onDone: () => void;
}

/**
 * The "learn this" card shown before a word is quizzed — the instructional heart of a lesson.
 * Presents the word in Arabic, its pronunciation (transliteration + IPA), meaning, an example
 * sentence, a usage note, and how it compares in other dialects. Auto-plays the audio on mount.
 */
export function TeachExercise({ exercise, onDone }: Props) {
  const theme = useTheme();
  const word = exercise.relatedWordId ? VOCAB_BY_ID[exercise.relatedWordId] : undefined;

  useEffect(() => {
    speakArabic(word?.arabic ?? exercise.promptArabic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  if (!word) {
    // Fallback if the word isn't in the static dictionary (e.g. AI-generated).
    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 40, color: theme.textPrimary, fontWeight: '700' }}>{exercise.promptArabic}</Text>
        <Text style={{ color: theme.textSecondary, marginTop: 8 }}>{exercise.prompt}</Text>
        <View style={{ marginTop: 28, width: '100%' }}>
          <Button label="Got it" onPress={onDone} />
        </View>
      </View>
    );
  }

  const crossDialect = word.crossDialect ? Object.entries(word.crossDialect) : [];

  return (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: theme.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 }}>NEW WORD</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
        {/* Headword */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: theme.textPrimary, fontSize: 46, fontWeight: '800' }}>{word.arabic}</Text>
          <AnimatedPressable
            onPress={() => speakArabic(word.arabic)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: `${theme.primary}18`, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}
          >
            <Icon name="speak" size={16} color={theme.primary} />
            <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>Hear it</Text>
          </AnimatedPressable>
          <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '700', marginTop: 12 }}>{word.transliteration}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{word.ipa}</Text>
          <Text style={{ color: theme.textPrimary, fontSize: 17, marginTop: 10 }}>{word.english}</Text>
        </View>

        {/* Example sentence */}
        {word.exampleSentenceArabic && (
          <View style={{ marginTop: 20, backgroundColor: theme.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>IN A SENTENCE</Text>
              <AnimatedPressable onPress={() => speakArabic(word.exampleSentenceArabic)} withHaptic={false}>
                <Icon name="speak" size={18} color={theme.textSecondary} />
              </AnimatedPressable>
            </View>
            <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '700', marginTop: 8, textAlign: 'right' }}>{word.exampleSentenceArabic}</Text>
            {word.exampleSentenceTranslit ? <Text style={{ color: theme.textSecondary, fontStyle: 'italic', marginTop: 4 }}>{word.exampleSentenceTranslit}</Text> : null}
            {word.exampleSentenceEnglish ? <Text style={{ color: theme.textPrimary, marginTop: 6 }}>{word.exampleSentenceEnglish}</Text> : null}
          </View>
        )}

        {/* Usage note */}
        {word.notes && (
          <View style={{ marginTop: 14, flexDirection: 'row', gap: 10, backgroundColor: `${theme.accentGold}14`, borderRadius: 16, borderWidth: 1, borderColor: `${theme.accentGold}55`, padding: 14 }}>
            <Icon name="grammar" size={18} color={theme.accentGold} />
            <Text style={{ flex: 1, color: theme.textPrimary, fontSize: 13, lineHeight: 19 }}>{word.notes}</Text>
          </View>
        )}

        {/* Cross-dialect */}
        {crossDialect.length > 0 && (
          <View style={{ marginTop: 14 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 }}>COMPARE ACROSS DIALECTS</Text>
            <View style={{ backgroundColor: theme.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' }}>
              {crossDialect.map(([d, val], i) => (
                <View key={d} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: theme.border }}>
                  <Text style={{ fontSize: 15 }}>{DIALECTS[d as DialectId]?.flag ?? '🏳️'}</Text>
                  <Text style={{ flex: 1, color: theme.textSecondary, fontSize: 12 }}>{DIALECTS[d as DialectId]?.name ?? d}</Text>
                  <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 13 }}>{val}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{ paddingTop: 12 }}>
        <Button label="Got it" onPress={onDone} />
      </View>
    </View>
  );
}
