import { router, Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Icon } from '@/components/ui/Icon';
import { generateChallengeRounds } from '@/content/challenge';
import { DIALECTS } from '@/content/dialectMeta';
import { haptic } from '@/lib/haptics';
import { speakArabic } from '@/lib/speech';
import { useGamificationStore } from '@/stores/useGamificationStore';

// Dark palette per the design.
const BG = '#0a0c11';
const CARD = '#12151c';
const CARD_SEL = '#1a2620';
const GREEN = '#42d386';
const RED = '#ff6b62';
const MUTED = '#9aa1ae';
const START_HEARTS = 3;
const ROUNDS = 10;

export default function DialectChallenge() {
  const rounds = useMemo(() => generateChallengeRounds(ROUNDS), []);
  const addXp = useGamificationStore((s) => s.addXp);
  const addCoins = useGamificationStore((s) => s.addCoins);

  const [index, setIndex] = useState(0);
  const [hearts, setHearts] = useState(START_HEARTS);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const round = rounds[index];

  const check = () => {
    if (!selected || revealed) return;
    setRevealed(true);
    const correct = selected === round.correct;
    if (correct) {
      haptic.success();
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      haptic.error();
      setStreak(0);
      setHearts((h) => h - 1);
    }
  };

  const next = () => {
    const outOfHearts = hearts <= 0;
    const lastRound = index + 1 >= rounds.length;
    if (outOfHearts || lastRound) {
      const xp = score * 12;
      addXp(xp);
      addCoins(score * 3);
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  if (finished || rounds.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Icon name="trophy" size={64} color={GREEN} />
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 16 }}>
          {score}/{rounds.length} correct
        </Text>
        <Text style={{ color: MUTED, marginTop: 6 }}>+{score * 12} XP · +{score * 3} coins</Text>
        <View style={{ marginTop: 32, width: '100%', gap: 10 }}>
          <BigButton label="Play again" onPress={() => router.replace('/challenge')} />
          <AnimatedPressable onPress={() => router.back()} withHaptic={false} style={{ alignItems: 'center', paddingVertical: 12 }}>
            <Text style={{ color: MUTED, fontWeight: '700' }}>Done</Text>
          </AnimatedPressable>
        </View>
      </SafeAreaView>
    );
  }

  const progress = (index + (revealed ? 1 : 0)) / rounds.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8 }}>
        <AnimatedPressable onPress={() => router.back()} withHaptic={false}>
          <Icon name="close" size={24} color={MUTED} />
        </AnimatedPressable>
        <View style={{ flex: 1, height: 8, borderRadius: 999, backgroundColor: '#1c2029', overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: GREEN }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="streak" size={16} color={RED} />
          <Text style={{ color: '#fff', fontWeight: '800' }}>{hearts}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 16 }}>
        <Text style={{ color: MUTED, fontWeight: '800', fontSize: 12, letterSpacing: 1 }}>ROUND {index + 1} / {rounds.length}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="streak" size={14} color={GREEN} />
          <Text style={{ color: GREEN, fontWeight: '800', fontSize: 12 }}>{streak} streak</Text>
        </View>
      </View>

      {/* Prompt */}
      <View style={{ alignItems: 'center', marginTop: 28, paddingHorizontal: 20 }}>
        <Text style={{ color: MUTED, fontSize: 14 }}>Where is this phrase from?</Text>
        <Text style={{ color: '#fff', fontSize: 40, fontWeight: '700', marginTop: 16, textAlign: 'center' }}>{round.arabic}</Text>
        <Text style={{ color: MUTED, fontStyle: 'italic', marginTop: 8 }}>{round.transliteration}</Text>
        <AnimatedPressable
          onPress={() => speakArabic(round.arabic)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, backgroundColor: CARD, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}
        >
          <Icon name="speak" size={16} color={GREEN} />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Hear it again</Text>
        </AnimatedPressable>
      </View>

      {/* 2x2 options */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 20, marginTop: 8 }}>
        {round.options.map((opt) => {
          const meta = DIALECTS[opt];
          const isSelected = selected === opt;
          const isCorrect = opt === round.correct;
          let border = '#262b36';
          let bg = CARD;
          if (revealed && isCorrect) {
            border = GREEN;
            bg = CARD_SEL;
          } else if (revealed && isSelected && !isCorrect) {
            border = RED;
            bg = '#241618';
          } else if (isSelected) {
            border = GREEN;
            bg = CARD_SEL;
          }
          return (
            <AnimatedPressable
              key={opt}
              onPress={() => !revealed && setSelected(opt)}
              disabled={revealed}
              style={{ width: '47%', borderRadius: 18, borderWidth: 1.5, borderColor: border, backgroundColor: bg, padding: 16, minHeight: 92, justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 26 }}>{meta?.flag ?? '🏳️'}</Text>
              <Text style={{ color: '#fff', fontWeight: '800', marginTop: 8 }}>{meta?.name ?? opt}</Text>
            </AnimatedPressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />
      <View style={{ padding: 20 }}>
        {revealed ? (
          <BigButton label={index + 1 >= rounds.length || hearts <= 0 ? 'See results' : 'Next round'} onPress={next} />
        ) : (
          <BigButton label="Check" onPress={check} disabled={!selected} />
        )}
      </View>
    </SafeAreaView>
  );
}

function BigButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      style={{
        height: 54,
        borderRadius: 16,
        backgroundColor: GREEN,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
        shadowColor: GREEN,
        shadowOpacity: 0.4,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      <Text style={{ color: '#04140c', fontWeight: '900', fontSize: 16 }}>{label}</Text>
    </AnimatedPressable>
  );
}
