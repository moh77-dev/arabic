import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { DIALECTS } from '@/content/dialectMeta';
import { getUnitsForDialect, LESSONS_BY_ID } from '@/content/lessonPaths';
import { useTheme } from '@/lib/ThemeProvider';
import { useT } from '@/lib/i18n';
import { useLessonStore } from '@/stores/useLessonStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUserStore } from '@/stores/useUserStore';

const GOAL_COPY: Record<string, string> = {
  family: 'Speak with family',
  travel: 'Get around confidently',
  religion: 'Understand religious speech',
  business: 'Handle business talk',
  school: 'Keep up at school',
  fun: 'Just enjoy the language',
};

interface Step {
  key: string;
  icon: IconName;
  title: string;
  detail: string;
  action: () => void;
}

export default function Plan() {
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const dialectId = useSettingsStore((s) => s.activeDialect);
  const profile = useUserStore((s) => s.onboardingProfile);
  const completedLessonIds = useLessonStore((s) => s.completedLessonIds);
  const dueCount = useLessonStore((s) => s.getDueWordIds().length);
  const meta = DIALECTS[dialectId] ?? DIALECTS.msa;

  const goal = profile.goals?.[0] ? GOAL_COPY[profile.goals[0]] : 'Speak like a local';
  const minutes = profile.dailyGoalMinutes ?? 10;
  const byMonth = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d.toLocaleDateString('en-US', { month: 'long' });
  }, []);

  // Build this week's steps from the next few lessons in the active dialect.
  const upcoming = useMemo(() => {
    const units = getUnitsForDialect(dialectId);
    const all = units.flatMap((u) => u.lessonIds.map((id) => LESSONS_BY_ID[id]).filter(Boolean));
    return all;
  }, [dialectId]);

  const steps: Step[] = useMemo(() => {
    const lessons = upcoming.slice(0, 2);
    const s: Step[] = lessons.map((l) => ({
      key: l.id,
      icon: 'lesson',
      title: l.title,
      detail: `${l.estimatedMinutes} min · +${l.xpReward} XP`,
      action: () => router.push(`/lesson/${l.id}`),
    }));
    s.push({ key: 'freetalk', icon: 'chat', title: 'Free Talk: the souk', detail: 'Practice a real conversation', action: () => router.push('/conversation') });
    s.push({ key: 'review', icon: 'review', title: dueCount > 0 ? `Review ${dueCount} words` : 'Review your words', detail: 'Lock it in', action: () => router.push('/(tabs)/streak') });
    return s;
  }, [upcoming, dueCount]);

  // A step is "done" if it's a lesson already completed; the first not-done is "current".
  const doneFlags = steps.map((st) => completedLessonIds.includes(st.key));
  const currentIdx = doneFlags.findIndex((d) => !d);
  const progress = steps.length ? doneFlags.filter(Boolean).length / steps.length : 0;

  const parch = theme.mode === 'dark' ? (['#241d12', '#191308'] as const) : (['#fbf1dc', '#f4e6c8'] as const);
  const parchInk = theme.mode === 'dark' ? '#e7d4a8' : '#5c3f12';
  const parchMuted = theme.mode === 'dark' ? '#c9a253' : '#8a6a2a';

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={theme.backdropGradient} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <AnimatedPressable onPress={() => router.back()} withHaptic={false}>
            <Icon name="chevronLeft" size={24} color={theme.textPrimary} />
          </AnimatedPressable>
          <Text style={{ color: theme.textPrimary, fontSize: 22, fontWeight: '900' }}>{t('plan.title')}</Text>
        </View>

        {/* Hero */}
        <View style={{ marginTop: 16, borderRadius: 22, overflow: 'hidden' }}>
          <LinearGradient colors={parch} style={{ padding: 20, borderRadius: 22, borderWidth: 1, borderColor: theme.mode === 'dark' ? '#3a2f1a' : '#e9d4a6', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: parchMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>{t('plan.madeForYou')}</Text>
              <Text style={{ color: parchInk, fontSize: 19, fontWeight: '900', marginTop: 6 }}>
                {goal} in {meta.name}
              </Text>
              <Text style={{ color: parchMuted, fontSize: 12, marginTop: 4 }}>by {byMonth} · {minutes} min a day</Text>
            </View>
            <ProgressRing progress={progress} size={64} color={theme.primary}>
              <Text style={{ color: parchInk, fontWeight: '900' }}>{Math.round(progress * 100)}%</Text>
            </ProgressRing>
          </LinearGradient>
        </View>

        {/* Timeline */}
        <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 26 }}>{t('plan.thisWeek')}</Text>
        <View style={{ marginTop: 14 }}>
          {steps.map((st, i) => {
            const isDone = doneFlags[i];
            const isCurrent = i === currentIdx;
            const isLocked = !isDone && !isCurrent;
            const isLast = i === steps.length - 1;
            return (
              <View key={st.key} style={{ flexDirection: 'row', gap: 14 }}>
                {/* Node + connector */}
                <View style={{ alignItems: 'center' }}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isDone ? theme.primary : 'transparent',
                      borderWidth: isDone ? 0 : 2,
                      borderColor: isCurrent ? theme.primary : theme.border,
                    }}
                  >
                    {isDone ? (
                      <Icon name="check" size={18} color={theme.primaryText} />
                    ) : (
                      <Text style={{ color: isCurrent ? theme.primary : theme.textSecondary, fontWeight: '900' }}>{i + 1}</Text>
                    )}
                  </View>
                  {!isLast && <View style={{ width: 2, flex: 1, backgroundColor: theme.border, marginVertical: 2 }} />}
                </View>

                {/* Card */}
                <AnimatedPressable
                  onPress={st.action}
                  disabled={isLocked}
                  style={{
                    flex: 1,
                    marginBottom: 14,
                    backgroundColor: theme.surfaceElevated,
                    borderRadius: 16,
                    borderWidth: isCurrent ? 1.5 : 1,
                    borderColor: isCurrent ? theme.primary : theme.border,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    opacity: isLocked ? 0.6 : 1,
                    ...(isCurrent ? { shadowColor: theme.primary, shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } } : null),
                  }}
                >
                  <Icon name={isDone ? 'check' : st.icon} size={20} color={isDone ? theme.primary : theme.textSecondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{st.title}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{isDone ? 'Done' : isCurrent ? `Continue now · ${st.detail}` : st.detail}</Text>
                  </View>
                  {isCurrent && <Icon name="chevronRight" size={20} color={theme.primary} />}
                </AnimatedPressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
