import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { GemCounter } from '@/components/ui/GemCounter';
import { HeatmapCalendar } from '@/components/ui/HeatmapCalendar';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StreakFlame } from '@/components/ui/StreakFlame';
import { XPBar } from '@/components/ui/XPBar';
import { ACHIEVEMENTS } from '@/content/achievements';
import { DIALECTS } from '@/content/dialectMeta';
import { VOCAB_BY_ID } from '@/content/dialects';
import { getUnitsForDialect, LESSONS_BY_ID } from '@/content/lessonPaths';
import { DAILY_QUESTS } from '@/content/quests';
import { useTheme } from '@/lib/ThemeProvider';
import { levelFromTotalXp } from '@/lib/gamificationMath';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useLessonStore } from '@/stores/useLessonStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useSocialStore } from '@/stores/useSocialStore';

export default function Home() {
  const theme = useTheme();
  const gami = useGamificationStore();
  const { completedLessonIds, srsCards } = useLessonStore();
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  const leaderboard = useSocialStore((s) => s.leaderboard);

  const { level, xpIntoLevel, xpForNextLevel } = levelFromTotalXp(gami.totalXp);
  const todayActivity = gami.getTodayActivity();

  const units = useMemo(() => getUnitsForDialect(activeDialect), [activeDialect]);
  const nextLesson = useMemo(() => {
    for (const unit of units) {
      for (const lessonId of unit.lessonIds) {
        if (!completedLessonIds.includes(lessonId)) return LESSONS_BY_ID[lessonId];
      }
    }
    return null;
  }, [units, completedLessonIds]);

  const recommendedLessons = useMemo(() => {
    const all = units.flatMap((u) => u.lessonIds.map((id) => LESSONS_BY_ID[id]));
    return all.filter((l) => !completedLessonIds.includes(l.id)).slice(0, 5);
  }, [units, completedLessonIds]);

  const recentWords = useMemo(() => {
    return Object.values(srsCards)
      .sort((a, b) => new Date(b.lastReviewedAt ?? 0).getTime() - new Date(a.lastReviewedAt ?? 0).getTime())
      .slice(0, 6)
      .map((c) => VOCAB_BY_ID[c.wordId])
      .filter(Boolean);
  }, [srsCards]);

  const weeklyProgress = Math.min(1, gami.weeklyXp / gami.weeklyGoalXp);

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AnimatedPressable onPress={() => router.push('/(tabs)/profile')} withHaptic={false}>
          <Avatar id={gami.activeAvatar} size={44} ring />
        </AnimatedPressable>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <GemCounter icon="🪙" value={gami.coins} />
          <GemCounter icon="💎" value={gami.diamonds} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <View>
          <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Welcome back to</Text>
          <Text style={{ color: theme.textPrimary, fontSize: 24, fontWeight: '900' }}>
            {DIALECTS[activeDialect].name}
          </Text>
        </View>
        <StreakFlame streak={gami.currentStreak} size="lg" />
      </View>

      <View style={{ marginTop: 20 }}>
        <XPBar xpIntoLevel={xpIntoLevel} xpForNextLevel={xpForNextLevel} level={level} />
      </View>

      {/* Today's lesson */}
      <Card style={{ marginTop: 20 }}>
        <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '700' }}>TODAY'S LESSON</Text>
        {nextLesson ? (
          <AnimatedPressable onPress={() => router.push(`/lesson/${nextLesson.id}`)} style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: theme.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 26 }}>📗</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 17 }}>{nextLesson.title}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                  {nextLesson.estimatedMinutes} min · {nextLesson.xpReward} XP
                </Text>
              </View>
              <Text style={{ fontSize: 20 }}>▶️</Text>
            </View>
          </AnimatedPressable>
        ) : (
          <Text style={{ color: theme.textPrimary, marginTop: 8 }}>
            You've completed every lesson in this track! 🎉 Try another dialect.
          </Text>
        )}
      </Card>

      {/* Quick access: AI conversations & stories */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <AnimatedPressable onPress={() => router.push('/conversation')} style={{ flex: 1 }}>
          <Card>
            <Text style={{ fontSize: 24 }}>💬</Text>
            <Text style={{ color: theme.textPrimary, fontWeight: '800', marginTop: 6 }}>Talk to a character</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>AI conversation practice</Text>
          </Card>
        </AnimatedPressable>
        <AnimatedPressable onPress={() => router.push('/story')} style={{ flex: 1 }}>
          <Card>
            <Text style={{ fontSize: 24 }}>📖</Text>
            <Text style={{ color: theme.textPrimary, fontWeight: '800', marginTop: 6 }}>Interactive stories</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Choose your own path</Text>
          </Card>
        </AnimatedPressable>
      </View>

      {/* Weekly goal + quests */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <Card style={{ flex: 1, alignItems: 'center' }}>
          <ProgressRing progress={weeklyProgress} size={72} color={theme.accentDiamond}>
            <Text style={{ fontWeight: '900', color: theme.textPrimary }}>{Math.round(weeklyProgress * 100)}%</Text>
          </ProgressRing>
          <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 8, textAlign: 'center' }}>
            Weekly goal{'\n'}
            {gami.weeklyXp}/{gami.weeklyGoalXp} XP
          </Text>
        </Card>
        <Card style={{ flex: 1.4 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '700' }}>DAILY QUESTS</Text>
          <View style={{ gap: 8, marginTop: 8 }}>
            {DAILY_QUESTS.slice(0, 2).map((q) => {
              const progressValue =
                q.goalType === 'earn_xp'
                  ? todayActivity.xp
                  : q.goalType === 'complete_lessons'
                    ? todayActivity.lessonsCompleted
                    : q.goalType === 'perfect_lessons'
                      ? todayActivity.perfectLessons
                      : 0;
              const pct = Math.min(1, progressValue / q.target);
              return (
                <View key={q.id}>
                  <Text style={{ color: theme.textPrimary, fontSize: 12, fontWeight: '600' }}>
                    {q.icon} {q.title}
                  </Text>
                  <View style={{ height: 6, borderRadius: 999, backgroundColor: theme.border, marginTop: 4, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${pct * 100}%`, backgroundColor: theme.primary }} />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      {/* Recommended lessons */}
      {recommendedLessons.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <SectionTitle title="Recommended for you" />
          <View style={{ gap: 10, marginTop: 10 }}>
            {recommendedLessons.map((lesson) => (
              <AnimatedPressable key={lesson.id} onPress={() => router.push(`/lesson/${lesson.id}`)}>
                <Card>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ fontSize: 24 }}>📘</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{lesson.title}</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                        {lesson.estimatedMinutes} min · {lesson.exercises.length} exercises
                      </Text>
                    </View>
                  </View>
                </Card>
              </AnimatedPressable>
            ))}
          </View>
        </View>
      )}

      {/* Recently learned words */}
      {recentWords.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <SectionTitle title="Recently learned words" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {recentWords.map((w) => (
              <View key={w.id} style={{ backgroundColor: theme.surfaceElevated, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 10, minWidth: '31%' }}>
                <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{w.arabic}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 11 }}>{w.english}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Achievements preview */}
      <View style={{ marginTop: 24 }}>
        <SectionTitle title="Achievements" action="See all" onAction={() => router.push('/(tabs)/profile')} />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          {ACHIEVEMENTS.slice(0, 4).map((a) => {
            const unlocked = gami.unlockedAchievementIds.includes(a.id);
            return (
              <View
                key={a.id}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  backgroundColor: unlocked ? `${theme.accentGold}22` : theme.surfaceElevated,
                  borderWidth: 1,
                  borderColor: unlocked ? theme.accentGold : theme.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: unlocked ? 1 : 0.4,
                }}
              >
                <Text style={{ fontSize: 26 }}>{a.icon}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Calendar heatmap */}
      <View style={{ marginTop: 24 }}>
        <SectionTitle title="Your study streak" />
        <Card style={{ marginTop: 10 }}>
          <HeatmapCalendar data={gami.studyHeatmap} />
        </Card>
      </View>

      {/* Leaderboard preview */}
      <View style={{ marginTop: 24, marginBottom: 12 }}>
        <SectionTitle title="Leaderboard" action="View all" onAction={() => router.push('/(tabs)/leaderboard')} />
        <Card style={{ marginTop: 10 }}>
          {leaderboard.length === 0 ? (
            <Text style={{ color: theme.textSecondary }}>
              Add friends to see how you rank against them this week.
            </Text>
          ) : (
            leaderboard.slice(0, 3).map((entry, i) => (
              <View key={entry.userId} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                <Text style={{ fontWeight: '900', color: theme.textSecondary, width: 20 }}>{i + 1}</Text>
                <Avatar id={entry.avatar} size={32} />
                <Text style={{ flex: 1, color: theme.textPrimary, fontWeight: '600' }}>{entry.displayName}</Text>
                <Text style={{ color: theme.textSecondary }}>{entry.weeklyXp} XP</Text>
              </View>
            ))
          )}
        </Card>
      </View>
    </ScreenContainer>
  );
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '800' }}>{title}</Text>
      {action ? (
        <AnimatedPressable onPress={onAction ?? (() => {})} withHaptic={false}>
          <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>{action}</Text>
        </AnimatedPressable>
      ) : null}
    </View>
  );
}
