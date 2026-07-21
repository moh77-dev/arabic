import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { DIALECT_LIST, DIALECTS } from '@/content/dialectMeta';
import { getUnitsForDialect, LESSONS_BY_ID } from '@/content/lessonPaths';
import { useTheme } from '@/lib/ThemeProvider';
import { useLessonStore } from '@/stores/useLessonStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function Learn() {
  const theme = useTheme();
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  const setActiveDialect = useSettingsStore((s) => s.setActiveDialect);
  const completedLessonIds = useLessonStore((s) => s.completedLessonIds);
  const [showPicker, setShowPicker] = useState(false);

  const units = useMemo(() => getUnitsForDialect(activeDialect), [activeDialect]);

  return (
    <ScreenContainer>
      <AnimatedPressable onPress={() => setShowPicker((v) => !v)} withHaptic={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 28 }}>{DIALECTS[activeDialect].flag}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.textPrimary, fontSize: 22, fontWeight: '900' }}>{DIALECTS[activeDialect].name}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Tap to switch dialect</Text>
          </View>
          <Text style={{ color: theme.primary, fontSize: 18 }}>{showPicker ? '▲' : '▼'}</Text>
        </View>
      </AnimatedPressable>

      {showPicker && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {DIALECT_LIST.map((d) => (
              <AnimatedPressable
                key={d.id}
                onPress={() => {
                  setActiveDialect(d.id);
                  setShowPicker(false);
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: activeDialect === d.id ? theme.primary : theme.border,
                  backgroundColor: activeDialect === d.id ? `${theme.primary}15` : theme.surfaceElevated,
                }}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>
                  {d.flag} {d.name}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={{ marginTop: 24, gap: 20 }}>
        {units.map((unit) => {
          const total = unit.lessonIds.length;
          const done = unit.lessonIds.filter((id) => completedLessonIds.includes(id)).length;
          return (
            <View key={unit.id}>
              <View
                style={{
                  padding: 16,
                  borderRadius: 20,
                  backgroundColor: unit.colorFrom,
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
                        borderRadius: 14,
                        backgroundColor: theme.surfaceElevated,
                        borderWidth: 1,
                        borderColor: theme.border,
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
