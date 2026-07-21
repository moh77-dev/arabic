import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { VOCAB_BY_ID } from '@/content/dialects';
import { useTheme } from '@/lib/ThemeProvider';
import { useLessonStore } from '@/stores/useLessonStore';

export default function Practice() {
  const theme = useTheme();
  const getDueWordIds = useLessonStore((s) => s.getDueWordIds);
  const getWeakWordIds = useLessonStore((s) => s.getWeakWordIds);
  const srsCards = useLessonStore((s) => s.srsCards);

  const dueWordIds = useMemo(() => getDueWordIds(), [srsCards, getDueWordIds]);
  const weakWordIds = useMemo(() => getWeakWordIds(), [srsCards, getWeakWordIds]);
  const totalWordsTracked = Object.keys(srsCards).length;

  return (
    <ScreenContainer gradient>
      <Text style={{ fontSize: 26, fontWeight: '900', color: theme.textPrimary }}>Practice</Text>
      <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
        Spaced repetition keeps your vocabulary from fading.
      </Text>

      <Card glass style={{ marginTop: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Stat label="Words tracked" value={totalWordsTracked} />
          <Stat label="Due today" value={dueWordIds.length} />
          <Stat label="Weak words" value={weakWordIds.length} />
        </View>
      </Card>

      <View style={{ marginTop: 20, gap: 12 }}>
        <Button
          label={dueWordIds.length > 0 ? `Review ${dueWordIds.length} due words` : 'No words due — practice anyway'}
          onPress={() => router.push({ pathname: '/review', params: { wordIds: (dueWordIds.length > 0 ? dueWordIds : Object.keys(srsCards)).join(',') } })}
          disabled={totalWordsTracked === 0}
        />
        {weakWordIds.length > 0 && (
          <Button
            label={`Drill ${weakWordIds.length} weak words`}
            variant="secondary"
            onPress={() => router.push({ pathname: '/review', params: { wordIds: weakWordIds.join(',') } })}
          />
        )}
      </View>

      {totalWordsTracked === 0 && (
        <Card glass style={{ marginTop: 20 }}>
          <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Complete a few lessons first — words you learn show up here for spaced-repetition review.
          </Text>
        </Card>
      )}

      {weakWordIds.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 10 }}>Weak areas</Text>
          <View style={{ gap: 8 }}>
            {weakWordIds.slice(0, 8).map((id) => {
              const word = VOCAB_BY_ID[id];
              if (!word) return null;
              return (
                <View key={id} style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.surfaceElevated, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 12 }}>
                  <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{word.arabic} — {word.transliteration}</Text>
                  <Text style={{ color: theme.textSecondary }}>{word.english}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '900', color: theme.textPrimary }}>{value}</Text>
      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{label}</Text>
    </View>
  );
}
