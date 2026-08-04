import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { DialectPicker } from '@/components/ui/DialectPicker';
import { Icon } from '@/components/ui/Icon';
import { getBackdrop } from '@/content/dialectBackdrops';
import { DIALECTS } from '@/content/dialectMeta';
import { getUnitsForDialect, LESSONS_BY_ID } from '@/content/lessonPaths';
import { useTheme } from '@/lib/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { useT } from '@/lib/i18n';
import { notify } from '@/lib/platformAlert';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useLessonStore } from '@/stores/useLessonStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

// The winding path offsets each node horizontally in a repeating wave so the track "snakes".
const WAVE = [0, 56, 0, -56];

export default function Learn() {
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  const completedLessonIds = useLessonStore((s) => s.completedLessonIds);
  const claimedUnitRewards = useGamificationStore((s) => s.claimedUnitRewards);
  const claimUnitReward = useGamificationStore((s) => s.claimUnitReward);

  const units = useMemo(() => getUnitsForDialect(activeDialect), [activeDialect]);
  const backdrop = getBackdrop(activeDialect);
  const meta = DIALECTS[activeDialect] ?? DIALECTS.msa;
  const pageWash = theme.mode === 'dark' ? theme.backdropGradient : backdrop.pageWash;

  // The first unit that still has an incomplete lesson is the "current" one.
  const currentUnitIndex = units.findIndex((u) => u.lessonIds.some((id) => !completedLessonIds.includes(id)));
  const totalLessons = units.reduce((n, u) => n + u.lessonIds.length, 0);
  const doneLessons = units.reduce((n, u) => n + u.lessonIds.filter((id) => completedLessonIds.includes(id)).length, 0);

  // A running counter across the whole path so the wave is continuous between units.
  let step = 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient colors={pageWash} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: theme.textPrimary, fontSize: 26, fontWeight: '900', letterSpacing: -0.4 }}>{t('learn.title')}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>
          {meta.name} · {t('learn.lessonsCount', { done: doneLessons, total: totalLessons })}
        </Text>

        <View style={{ marginTop: 16 }}>
          <DialectPicker />
        </View>

        <View style={{ marginTop: 24 }}>
          {units.map((unit, unitIndex) => {
            const total = unit.lessonIds.length;
            const done = unit.lessonIds.filter((id) => completedLessonIds.includes(id)).length;
            const unitComplete = done === total && total > 0;
            const isCurrentUnit = unitIndex === currentUnitIndex;

            return (
              <View key={unit.id} style={{ marginBottom: 8 }}>
                {/* Unit banner */}
                <UnitBanner theme={theme} title={unit.title} done={done} total={total} highlighted={isCurrentUnit} />

                {/* Winding path of lesson nodes */}
                <View style={{ alignItems: 'center', marginTop: 18, gap: 20 }}>
                  {unit.lessonIds.map((lessonId, i) => {
                    const lesson = LESSONS_BY_ID[lessonId];
                    if (!lesson) return null;
                    const isDone = completedLessonIds.includes(lessonId);
                    const prevDone = i === 0 || completedLessonIds.includes(unit.lessonIds[i - 1]);
                    const isLocked = !isDone && !prevDone;
                    const isCurrent = !isDone && prevDone;
                    const offset = WAVE[step % WAVE.length];
                    step += 1;
                    return (
                      <PathNode
                        key={lessonId}
                        theme={theme}
                        offset={offset}
                        state={isDone ? 'done' : isCurrent ? 'current' : 'locked'}
                        label={lesson.title}
                        sublabel={isCurrent ? `${lesson.estimatedMinutes} ${t('learn.min')} · +${lesson.xpReward} XP` : undefined}
                        onPress={isLocked ? undefined : () => router.push(`/lesson/${lessonId}`)}
                      />
                    );
                  })}

                  {/* Unit reward chest */}
                  <RewardNode
                    theme={theme}
                    unlocked={unitComplete}
                    claimed={claimedUnitRewards.includes(unit.id)}
                    onClaim={() => {
                      if (claimUnitReward(unit.id)) {
                        haptic.success();
                        notify('Chest opened! 🎉', '+50 coins and +3 gems added to your balance.');
                      }
                    }}
                    offset={WAVE[step++ % WAVE.length]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function UnitBanner({
  theme,
  title,
  done,
  total,
  highlighted,
}: {
  theme: ReturnType<typeof useTheme>;
  title: string;
  done: number;
  total: number;
  highlighted: boolean;
}) {
  const t = useT();
  if (!highlighted) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 15 }}>{title}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          {done}/{total}
        </Text>
      </View>
    );
  }
  return (
    <View
      style={{
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#0f7a47',
        shadowColor: '#0f7a47',
        shadowOpacity: 0.32,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="souk" size={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }}>{t('learn.currentUnit')}</Text>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 17 }}>{title}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 }}>
          <Icon name="streak" size={14} color="#ffd873" />
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{done}</Text>
        </View>
      </View>
      <View style={{ height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden', marginTop: 14 }}>
        <View style={{ height: '100%', width: `${total ? (done / total) * 100 : 0}%`, backgroundColor: '#fff' }} />
      </View>
      <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 6 }}>
        {done} of {total} lessons complete
      </Text>
    </View>
  );
}

type NodeState = 'done' | 'current' | 'locked';

function PathNode({
  theme,
  offset,
  state,
  label,
  sublabel,
  onPress,
}: {
  theme: ReturnType<typeof useTheme>;
  offset: number;
  state: NodeState;
  label: string;
  sublabel?: string;
  onPress?: () => void;
}) {
  const t = useT();
  const isCurrent = state === 'current';
  const size = isCurrent ? 78 : 64;

  const circleStyle =
    state === 'done'
      ? { backgroundColor: theme.primary, borderColor: theme.mode === 'dark' ? '#0b3b24' : '#fff', shadowColor: '#0b6b3c' }
      : state === 'current'
        ? { backgroundColor: theme.surfaceElevated, borderColor: theme.primary, shadowColor: theme.primary }
        : { backgroundColor: theme.mode === 'dark' ? '#2a2f3a' : '#dfe5e2', borderColor: theme.mode === 'dark' ? '#20242e' : '#fff', shadowColor: '#00000000' };

  return (
    <View style={{ transform: [{ translateX: offset }], alignItems: 'center' }}>
      {isCurrent && (
        <View
          style={{
            backgroundColor: theme.primary,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 999,
            marginBottom: 8,
            shadowColor: theme.primary,
            shadowOpacity: 0.5,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Text style={{ color: theme.primaryText, fontWeight: '900', fontSize: 10, letterSpacing: 0.6 }}>{t('learn.start')}</Text>
        </View>
      )}
      <AnimatedPressable
        onPress={onPress}
        disabled={!onPress}
        withHaptic={state !== 'locked'}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 4,
          alignItems: 'center',
          justifyContent: 'center',
          shadowOpacity: state === 'locked' ? 0 : 0.5,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 8 },
          ...circleStyle,
        }}
      >
        <Icon
          name={state === 'done' ? 'check' : state === 'current' ? 'play' : 'lock'}
          size={state === 'current' ? 30 : 26}
          color={state === 'done' ? '#fff' : state === 'current' ? theme.primary : theme.textSecondary}
        />
      </AnimatedPressable>
      {(isCurrent || state === 'done') && (
        <Text style={{ color: state === 'current' ? theme.primary : theme.textSecondary, fontWeight: '800', fontSize: 12, marginTop: 8, maxWidth: 160, textAlign: 'center' }} numberOfLines={1}>
          {label}
        </Text>
      )}
      {sublabel && (
        <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>{sublabel}</Text>
      )}
    </View>
  );
}

function RewardNode({
  theme,
  unlocked,
  claimed,
  onClaim,
  offset,
}: {
  theme: ReturnType<typeof useTheme>;
  unlocked: boolean;
  claimed: boolean;
  onClaim: () => void;
  offset: number;
}) {
  const t = useT();
  const claimable = unlocked && !claimed;
  return (
    <View style={{ transform: [{ translateX: offset }], alignItems: 'center', marginTop: 4 }}>
      <AnimatedPressable
        onPress={claimable ? onClaim : undefined}
        disabled={!claimable}
        withHaptic={claimable}
        style={{
          width: 66,
          height: 66,
          borderRadius: 20,
          borderWidth: 4,
          borderColor: theme.mode === 'dark' ? '#3a2f14' : '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: unlocked ? '#f0a80e' : theme.mode === 'dark' ? '#2a2f3a' : '#dfe5e2',
          shadowColor: claimable ? '#c98a08' : '#00000000',
          shadowOpacity: claimable ? 0.6 : 0,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
          opacity: claimed ? 0.7 : 1,
        }}
      >
        <Icon name={claimed ? 'check' : 'gift'} size={28} color={unlocked ? '#7a5300' : theme.textSecondary} />
      </AnimatedPressable>
      <Text style={{ color: claimable ? '#c98a08' : unlocked ? '#9a7521' : theme.textSecondary, fontWeight: '800', fontSize: 12, marginTop: 8 }}>
        {claimed ? 'Claimed' : claimable ? 'Tap to claim!' : t('learn.unitReward')}
      </Text>
    </View>
  );
}
