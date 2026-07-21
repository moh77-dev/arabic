import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { DialectSwitcher } from '@/components/ui/DialectSwitcher';
import { LandmarkSilhouette } from '@/components/ui/LandmarkSilhouette';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { getBackdrop } from '@/content/dialectBackdrops';
import { DIALECTS } from '@/content/dialectMeta';
import { getUnitsForDialect, LESSONS_BY_ID } from '@/content/lessonPaths';
import { useTheme } from '@/lib/ThemeProvider';
import { useLessonStore } from '@/stores/useLessonStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function Learn() {
  const theme = useTheme();
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  const completedLessonIds = useLessonStore((s) => s.completedLessonIds);

  const units = useMemo(() => getUnitsForDialect(activeDialect), [activeDialect]);
  const backdrop = getBackdrop(activeDialect);

  return (
    <ScreenContainer gradient style={{ padding: 0 }}>
      {/* Dialect-tinted banner with the region's landmark */}
      <View style={{ borderRadius: 0, overflow: 'hidden' }}>
        <LinearGradient colors={backdrop.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 90 }}>
            <LandmarkSilhouette kind={backdrop.silhouette} color="#ffffff" opacity={0.14} height={90} />
          </View>
          <View style={{ paddingHorizontal: 20, paddingTop: 54, paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 28 }}>{DIALECTS[activeDialect].flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: -0.3 }}>
                  {DIALECTS[activeDialect].name}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>Your learning path</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <DialectSwitcher />
        <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 6 }}>
          Tip: hold a dialect chip to remove it from your list.
        </Text>
      </View>

      <View style={{ marginTop: 24, gap: 20, paddingHorizontal: 20 }}>
        {units.map((unit) => {
          const total = unit.lessonIds.length;
          const done = unit.lessonIds.filter((id) => completedLessonIds.includes(id)).length;
          return (
            <View key={unit.id}>
              <View
                style={{
                  padding: 16,
                  borderRadius: 22,
                  backgroundColor: unit.colorFrom,
                  shadowColor: unit.colorFrom,
                  shadowOpacity: 0.35,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 4,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <ProgressRing progress={total ? done / total : 0} size={48} strokeWidth={4} color="#ffffff" trackColor="rgba(255,255,255,0.3)">
                    <Text style={{ fontSize: 20 }}>{unit.icon}</Text>
                  </ProgressRing>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontWeight: '900', fontSize: 17 }}>{unit.title}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                      {done}/{total} lessons complete
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ marginTop: 10, gap: 8, paddingLeft: 8 }}>
                {unit.lessonIds.map((lessonId, i) => {
                  const lesson = LESSONS_BY_ID[lessonId];
                  if (!lesson) return null;
                  const isDone = completedLessonIds.includes(lessonId);
                  const prevDone = i === 0 || completedLessonIds.includes(unit.lessonIds[i - 1]);
                  const isLocked = !isDone && !prevDone;
                  return (
                    <AnimatedPressable
                      key={lessonId}
                      disabled={isLocked}
                      onPress={() => router.push(`/lesson/${lessonId}`)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 12,
                        borderRadius: 16,
                        backgroundColor: theme.glassTint,
                        borderWidth: 1,
                        borderColor: theme.glassBorder,
                        opacity: isLocked ? 0.4 : 1,
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>{isDone ? '✅' : isLocked ? '🔒' : '📘'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{lesson.title}</Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                          {lesson.estimatedMinutes} min · {lesson.xpReward} XP
                        </Text>
                      </View>
                    </AnimatedPressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    </ScreenContainer>
  );
}
