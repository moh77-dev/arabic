import React from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/lib/ThemeProvider';

interface Props {
  accuracy: number;
  xpEarned: number;
  coinsEarned: number;
  isPerfect: boolean;
  onContinue: () => void;
}

export function LessonResults({ accuracy, xpEarned, coinsEarned, isPerfect, onContinue }: Props) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 72 }}>{isPerfect ? '🏆' : accuracy >= 0.7 ? '🎉' : '💪'}</Text>
      <Text style={{ fontSize: 26, fontWeight: '900', color: theme.textPrimary, marginTop: 16 }}>
        {isPerfect ? 'Perfect Lesson!' : accuracy >= 0.7 ? 'Great Job!' : 'Lesson Complete'}
      </Text>
      <Text style={{ color: theme.textSecondary, marginTop: 4 }}>{Math.round(accuracy * 100)}% accuracy</Text>

      <View style={{ flexDirection: 'row', gap: 16, marginTop: 28 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 28 }}>⚡</Text>
          <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: 18 }}>+{xpEarned}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>XP</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 28 }}>🪙</Text>
          <Text style={{ color: theme.textPrimary, fontWeight: '900', fontSize: 18 }}>+{coinsEarned}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Coins</Text>
        </View>
      </View>

      <View style={{ marginTop: 40, width: '100%' }}>
        <Button label="Continue" onPress={onContinue} />
      </View>
    </View>
  );
}
