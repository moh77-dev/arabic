import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DialectHero } from '@/components/ui/DialectHero';
import { DialectSwitcher } from '@/components/ui/DialectSwitcher';
import { GemCounter } from '@/components/ui/GemCounter';
import { HeatmapCalendar } from '@/components/ui/HeatmapCalendar';
import { ACHIEVEMENTS } from '@/content/achievements';
import { getBackdrop } from '@/content/dialectBackdrops';
import { DIALECTS } from '@/content/dialectMeta';
import { VOCAB_BY_ID } from '@/content/dialects';
import { getUnitsForDialect, LESSONS_BY_ID } from '@/content/lessonPaths';
import { useTheme } from '@/lib/ThemeProvider';
import { levelFromTotalXp } from '@/lib/gamificationMath';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useLessonStore } from '@/stores/useLessonStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useSocialStore } from '@/stores/useSocialStore';
import { useUserStore } from '@/stores/useUserStore';

const DAILY_GOAL_DEFS = [
  { key: 'vocab', icon: '🧰', label: 'Vocabulary', unit: 'words', goal: 30 },
  { key: 'grammar', icon: '⚖️', label: 'Grammar', unit: 'lessons', goal: 2 },
  { key: 'speaking', icon: '🎙️', label: 'Speaking', unit: 'reps', goal: 5 },
] as const;

export default function Home() {
  const theme = useTheme();
  const gami = useGamificationStore();
  const { completedLessonIds, srsCards } = useLessonStore();
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  const leaderboard = useSocialStore((s) => s.leaderboard);
  const displayName = useUserStore((s) => s.displayName) ?? 'friend';

  const { level, xpIntoLevel, xpForNextLevel } = levelFromTotalXp(gami.totalXp);
  const todayActivity = gami.getTodayActivity();
  const backdrop = getBackdrop(activeDialect);
  const meta = DIALECTS[activeDialect] ?? DIALECTS.msa;

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

  const goalProgress = {
    vocab: Math.min(1, todayActivity.wordsReviewed / 30),
    grammar: Math.min(1, todayActivity.lessonsCompleted / 2),
    speaking: Math.min(1, todayActivity.speakingDone / 5),
  } as const;
  const goalValues = {
    vocab: todayActivity.wordsReviewed,
    grammar: todayActivity.lessonsCompleted,
    speaking: todayActivity.speakingDone,
  } as const;

  const startLearning = () => {
    if (nextLesson) router.push(`/lesson/${nextLesson.id}`);
    else router.push('/(tabs)/learn');
  };

  const pageWash = theme.mode === 'dark' ? theme.backdropGradient : backdrop.pageWash;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient colors={pageWash} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <DialectHero
          dialectId={activeDialect}
          name={displayName}
          avatarId={gami.activeAvatar}
          streak={gami.currentStreak}
          onProfile={() => router.push('/(tabs)/profile')}
          onSettings={() => router.push('/settings')}
        />

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          {/* Currency + dialect switcher */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 14 }}>
            <GemCounter icon="🪙" value={gami.coins} />
            <GemCounter icon="💎" value={gami.diamonds} />
          </View>
          <DialectSwitcher />

          {/* "Your Level" card — warm parchment feel with Continue Lesson */}
          <View style={{ marginTop: 18, borderRadius: 24, overflow: 'hidden' }}>
            <LinearGradient
              colors={theme.mode === 'dark' ? ['#241d12', '#191308'] : ['#fbf1dc', '#f4e6c8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20, borderWidth: 1, borderColor: theme.mode === 'dark' ? '#3a2f1a' : '#e9d4a6', borderRadius: 24 }}
            >
              <Text style={{ color: theme.mode === 'dark' ? '#c9a253' : '#9a7521', fontSize: 12, fontWeight: '800', letterSpacing: 0.6 }}>
                YOUR LEVEL
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.mode === 'dark' ? '#f3e6c8' : '#5c3f12', fontSize: 18, fontWeight: '900' }}>
                    {meta.name} · Level {level}
                  </Text>
                  <Text style={{ color: theme.mode === 'dark' ? '#e7d4a8' : '#7a5a20', fontSize: 26, fontWeight: '900', marginTop: 4 }}>
                    {meta.nativeName}
                  </Text>
                </View>
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    backgroundColor: theme.mode === 'dark' ? 'rgba(201,162,83,0.18)' : 'rgba(154,117,33,0.14)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 30 }}>{meta.flag}</Text>
                </View>
              </View>

              <View style={{ marginTop: 16 }}>
                <View style={{ height: 8, borderRadius: 999, backgroundColor: theme.mode === 'dark' ? '#3a2f1a' : '#e6d2a4', overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${(xpIntoLevel / xpForNextLevel) * 100}%`, backgroundColor: theme.primary, borderRadius: 999 }} />
                </View>
                <Text style={{ color: theme.mode === 'dark' ? '#c9a253' : '#9a7521', fontSize: 11, marginTop: 4 }}>
                  {xpIntoLevel} / {xpForNextLevel} XP to next level
                </Text>
              </View>

              <AnimatedPressable
                onPress={startLearning}
                style={{
                  marginTop: 16,
                  alignSelf: 'flex-start',
                  paddingHorizontal: 22,
                  paddingVertical: 12,
                  borderRadius: 16,
                  backgroundColor: theme.primary,
                  shadowColor: theme.primary,
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 6 },
                }}
              >
                <Text style={{ color: theme.primaryText, fontWeight: '800', fontSize: 15 }}>
                  {nextLesson ? 'Continue Lesson' : 'Review your words'}
                </Text>
              </AnimatedPressable>
            </LinearGradient>
          </View>

          {/* Daily Goals — themed tiles */}
          <View style={{ marginTop: 24 }}>
            <SectionTitle title="Daily Goals" action="See all" onAction={() => router.push('/(tabs)/practice')} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              {DAILY_GOAL_DEFS.map((g) => (
                <Card key={g.key} glass style={{ flex: 1, alignItems: 'center', paddingVertical: 16 }}>
                  <Text style={{ fontSize: 30 }}>{g.icon}</Text>
                  <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 13, marginTop: 8 }}>{g.label}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
                    {goalValues[g.key]}/{g.goal} {g.unit}
                  </Text>
                  <View style={{ height: 6, width: '100%', borderRadius: 999, backgroundColor: theme.border, marginTop: 8, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${goalProgress[g.key] * 100}%`, backgroundColor: theme.primary }} />
                  </View>
                </Card>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 18 }}>
            <Button label={nextLesson ? 'Start Learning' : 'Practice Vocabulary'} onPress={startLearning} />
          </View>

          {/* Quick access */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
            <AnimatedPressable onPress={() => router.push('/conversation')} style={{ flex: 1 }}>
              <Card glass>
                <Text style={{ fontSize: 24 }}>💬</Text>
                <Text style={{ color: theme.textPrimary, fontWeight: '800', marginTop: 6 }}>Talk to a character</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>AI conversation practice</Text>
              </Card>
            </AnimatedPressable>
            <AnimatedPressable onPress={() => router.push('/story')} style={{ flex: 1 }}>
              <Card glass>
                <Text style={{ fontSize: 24 }}>📖</Text>
                <Text style={{ color: theme.textPrimary, fontWeight: '800', marginTop: 6 }}>Interactive stories</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Choose your own path</Text>
              </Card>
            </AnimatedPressable>
          </View>

          {/* Recommended lessons */}
          {recommendedLessons.length > 0 && (
            <View style={{ marginTop: 26 }}>
              <SectionTitle title="Recommended for you" />
              <View style={{ gap: 10, marginTop: 10 }}>
                {recommendedLessons.map((lesson) => (
                  <AnimatedPressable key={lesson.id} onPress={() => router.push(`/lesson/${lesson.id}`)}>
                    <Card glass>
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
            <View style={{ marginTop: 26 }}>
              <SectionTitle title="Recently learned words" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {recentWords.map((w) => (
                  <View
                    key={w.id}
                    style={{ backgroundColor: theme.glassTint, borderWidth: 1, borderColor: theme.glassBorder, borderRadius: 14, padding: 10, minWidth: '31%' }}
                  >
                    <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{w.arabic}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>{w.english}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Achievements */}
          <View style={{ marginTop: 26 }}>
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
                      borderRadius: 18,
                      backgroundColor: unlocked ? `${theme.accentGold}22` : theme.glassTint,
                      borderWidth: 1,
                      borderColor: unlocked ? theme.accentGold : theme.glassBorder,
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

          {/* Streak heatmap */}
          <View style={{ marginTop: 26 }}>
            <SectionTitle title="Your study streak" />
            <Card glass style={{ marginTop: 10 }}>
              <HeatmapCalendar data={gami.studyHeatmap} />
            </Card>
          </View>

          {/* Leaderboard preview */}
          <View style={{ marginTop: 26, marginBottom: 12 }}>
            <SectionTitle title="Leaderboard" action="View all" onAction={() => router.push('/(tabs)/leaderboard')} />
            <Card glass style={{ marginTop: 10 }}>
              {leaderboard.length === 0 ? (
                <Text style={{ color: theme.textSecondary }}>Add friends to see how you rank against them this week.</Text>
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
        </View>
      </ScrollView>
    </View>
  );
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '800', letterSpacing: -0.2 }}>{title}</Text>
      {action ? (
        <AnimatedPressable onPress={onAction ?? (() => {})} withHaptic={false}>
          <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>{action}</Text>
        </AnimatedPressable>
      ) : null}
    </View>
  );
}
