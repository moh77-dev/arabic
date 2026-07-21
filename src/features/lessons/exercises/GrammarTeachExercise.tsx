import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { DIALECTS } from '@/content/dialectMeta';
import { useTheme } from '@/lib/ThemeProvider';
import type { DialectId, Exercise } from '@/types';

interface Props {
  exercise: Exercise;
  onDone: () => void;
}

/** A short grammar mini-lesson woven into a lesson — the concept + how it differs across dialects. */
export function GrammarTeachExercise({ exercise, onDone }: Props) {
  const theme = useTheme();
  const g = exercise.grammar;
  const comparisons = g?.comparisons ? Object.entries(g.comparisons) : [];

  return (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: theme.accentGold, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 }}>GRAMMAR</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: `${theme.accentGold}22`, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="grammar" size={22} color={theme.accentGold} />
          </View>
          <Text style={{ flex: 1, color: theme.textPrimary, fontSize: 20, fontWeight: '900' }}>{g?.title ?? exercise.prompt}</Text>
        </View>

        <Text style={{ color: theme.textPrimary, fontSize: 15, lineHeight: 23, marginTop: 16 }}>
          {g?.explanation ?? exercise.explanation}
        </Text>

        {comparisons.length > 0 && (
          <View style={{ marginTop: 18 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 }}>HOW OTHERS DO IT</Text>
            <View style={{ backgroundColor: theme.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' }}>
              {comparisons.map(([d, val], i) => (
                <View key={d} style={{ flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: theme.border }}>
                  <Text style={{ fontSize: 15 }}>{DIALECTS[d as DialectId]?.flag ?? '🏳️'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '700' }}>{DIALECTS[d as DialectId]?.name ?? d}</Text>
                    <Text style={{ color: theme.textPrimary, fontSize: 13, marginTop: 2 }}>{val}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{ paddingTop: 12 }}>
        <Button label="Makes sense" onPress={onDone} />
      </View>
    </View>
  );
}
