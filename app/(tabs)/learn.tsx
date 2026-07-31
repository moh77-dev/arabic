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
import { useLessonStore } from '@/stores/useLessonStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function Learn() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  const completedLessonIds = useLessonStore((s) => s.completedLessonIds);

  const units = useMemo(() => getUnitsForDialect(activeDialect), [activeDialect]);
  const backdrop = getBackdrop(activeDialect);
  const meta = DIALECTS[activeDialect] ?? DIALECTS.msa;
  const pageWash = theme.mode === 'dark' ? theme.backdropGradient : backdrop.pageWash;

  // The "current unit" is the first with an incomplete lesson.
  const currentUnitIndex = units.findIndex((u) => u.lessonIds.some((id) => !completedLessonIds.includes(id)));

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient colors={pageWash} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: theme.textPrimary, fontSize: 26, fontWeight: '900', letterSpacing: -0.4 }}>Learn</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>
          {meta.name} · {units.length} units
        </Text>

        <View style={{ marginTop: 16 }}>
          <DialectPicker />
        </View>

        <View style={{ marginTop: 24, gap: 22 }}>
          {units.map((unit, unitIndex) => {
            const total = unit.lessonIds.length;
            const done = unit.lessonIds.filter((id) => completedLessonIds.includes(id)).length;
            const isCurrent = unitIndex === currentUnitIndex;
            return (
              <View key={unit.id}>
                {/* Unit banner — current one gets the solid green treatment, the rest a quiet hairline card */}
                {isCurrent ? (
                  <View
                    style={{
                      padding: 16,
                      borderRadius: 20,
                      backgroundColor: '#0f7a47',
                      shadowColor: '#0f7a47',
                      shadowOpacity: 0.3,
                      shadowRadius: 16,
                      shadowOffset: { width: 0, height: 8 },
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="souk" size={22} color="#fff" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }}>CURRENT UNIT</Text>
                        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 17 }}>{unit.title}</Text>
                      </View>
                    </View>
                    <View style={{ height: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden', marginTop: 14 }}>
                      <View style={{ height: '100%', width: `${total ? (done / total) * 100 : 0}%`, backgroundColor: '#fff' }} />
                    </View>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 6 }}>
                      {done} of {total} lessons complete
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 16 }}>{unit.title}</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                      {done}/{total}
                    </Text>
                  </View>
                )}

                {/* Lesson list */}
                <View style={{ marginTop: 12, gap: 8 }}>
                  {unit.lessonIds.map((lessonId, i) => {
                    const lesson = LESSONS_BY_ID[lessonId];
                    if (!lesson) return null;
                    const isDone = completedLessonIds.includes(lessonId);
                    const prevDone = i === 0 || completedLessonIds.includes(unit.lessonIds[i - 1]);
                    const isLocked = !isDone && !prevDone;
                    const isCurrentLesson = !isDone && prevDone;
                    return (
                      <AnimatedPressable
                        key={lessonId}
                        disabled={isLocked}
                        onPress={() => router.push(`/lesson/${lessonId}`)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 14,
                          padding: 14,
                          borderRadius: 16,
                          backgroundColor: theme.surfaceElevated,
                          borderWidth: isCurrentLesson ? 1.5 : 1,
                          borderColor: isCurrentLesson ? theme.primary : theme.border,
                          opacity: isLocked ? 0.55 : 1,
                          ...(isCurrentLesson
                            ? { shadowColor: theme.primary, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }
                            : null),
                        }}
                      >
                        <View
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 19,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isDone ? `${theme.primary}1f` : isLocked ? theme.surface : theme.primary,
                          }}
                        >
                          <Icon
                            name={isDone ? 'check' : isLocked ? 'lock' : 'play'}
                            size={18}
                            color={isDone ? theme.primary : isLocked ? theme.textSecondary : theme.primaryText}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{lesson.title}</Text>
                          <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 1 }}>
                            {isDone ? `Done · ${lesson.exercises.length} words` : `${lesson.estimatedMinutes} min`}
                          </Text>
                        </View>
                        {isCurrentLesson && (
                          <Text style={{ color: theme.accentGold, fontWeight: '800', fontSize: 12 }}>+{lesson.xpReward} XP</Text>
                        )}
                      </AnimatedPressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
