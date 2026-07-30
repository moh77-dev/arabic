import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Avatar } from '@/components/ui/Avatar';
import { Icon, type IconName } from '@/components/ui/Icon';
import { SayItWave } from '@/components/ui/SayItWave';
import { getPageBackground } from '@/content/dialectBackdrops';
import { DIALECTS } from '@/content/dialectMeta';
import { getUnitsForDialect, LESSONS_BY_ID } from '@/content/lessonPaths';
import { getPhraseOfDay } from '@/content/phraseOfDay';
import { fonts } from '@/lib/fonts';
import { useTheme } from '@/lib/ThemeProvider';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useLessonStore } from '@/stores/useLessonStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUserStore } from '@/stores/useUserStore';
import type { DialectId } from '@/types';

const WEEKDAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function Home() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const gami = useGamificationStore();
  const { completedLessonIds, getDueWordIds, srsCards } = useLessonStore();
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  const enrolledDialects = useSettingsStore((s) => s.enrolledDialects);
  const setActiveDialect = useSettingsStore((s) => s.setActiveDialect);
  const displayName = useUserStore((s) => s.displayName) ?? 'friend';

  const meta = DIALECTS[activeDialect] ?? DIALECTS.msa;
  const phrase = useMemo(() => getPhraseOfDay(activeDialect), [activeDialect]);
  const pageWash = getPageBackground(activeDialect, theme.mode);

  const units = useMemo(() => getUnitsForDialect(activeDialect), [activeDialect]);
  const nextLesson = useMemo(() => {
    for (const unit of units) {
      for (const lessonId of unit.lessonIds) {
        if (!completedLessonIds.includes(lessonId)) return LESSONS_BY_ID[lessonId];
      }
    }
    return null;
  }, [units, completedLessonIds]);

  const dueCount = useMemo(() => getDueWordIds().length, [srsCards, getDueWordIds]);

  // Voice streak — the last 7 evenings, lit when the learner studied that day.
  const evenings = useMemo(() => {
    const out: { key: string; initial: string; on: boolean; today: boolean }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setUTCDate(now.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ key, initial: WEEKDAY[d.getUTCDay()], on: (gami.studyHeatmap[key] ?? 0) > 0, today: i === 0 });
    }
    return out;
  }, [gami.studyHeatmap]);
  const spokeCount = evenings.filter((e) => e.on).length;

  const brass = theme.accentGold;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient colors={pageWash} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 14, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <AnimatedPressable onPress={() => router.push('/(tabs)/profile')} withHaptic={false}>
              <Avatar id={gami.activeAvatar} size={40} ring />
            </AnimatedPressable>
            <View>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Assalamu alaykum,</Text>
              <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 }}>{displayName}</Text>
            </View>
          </View>
          <AnimatedPressable
            onPress={() => router.push('/(tabs)/learn')}
            withHaptic={false}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surfaceElevated }}
          >
            <Text style={{ fontSize: 14 }}>{meta.flag}</Text>
            <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 13 }}>{meta.name}</Text>
            <Icon name="chevronDown" size={14} color={theme.textSecondary} />
          </AnimatedPressable>
        </View>

        {/* Phrase of the evening — the thesis */}
        <View style={{ marginTop: 20, padding: 22, borderRadius: 24, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surfaceElevated }}>
          <Kicker color={brass}>PHRASE OF THE EVENING</Kicker>
          <Text style={{ color: theme.textPrimary, fontFamily: fonts.arabicDisplay, fontSize: 40, lineHeight: 62, textAlign: 'right', writingDirection: 'rtl', marginTop: 8 }}>
            {phrase.arabic}
          </Text>
          <Text style={{ color: brass, fontSize: 18, fontStyle: 'italic', marginTop: 2 }}>{phrase.translit}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13.5, marginTop: 4, lineHeight: 20 }}>{phrase.english}</Text>
          <View style={{ marginTop: 18 }}>
            <SayItWave text={phrase.arabic} />
          </View>
        </View>

        {/* Voice streak */}
        <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>Voice streak</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 3 }}>
              {spokeCount > 0 ? `You practiced ${spokeCount} of the last 7 days` : 'Practice tonight to start your streak'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 7 }}>
            {evenings.map((e) => (
              <View
                key={e.key}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: e.on ? 'transparent' : e.today ? brass : theme.border,
                  backgroundColor: e.on ? brass : 'transparent',
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: '800', color: e.on ? theme.primaryText : e.today ? brass : theme.textSecondary }}>{e.initial}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: theme.border, opacity: 0.5, marginVertical: 24 }} />

        {/* Tonight with Amine */}
        <MajlisCard onPress={() => router.push('/conversation')} theme={theme} />

        {/* Actions */}
        <View style={{ gap: 12, marginTop: 14 }}>
          <ActionRow
            icon="play"
            tint={theme.primary}
            title={nextLesson ? `Continue · ${nextLesson.title}` : 'Start a lesson'}
            subtitle={nextLesson ? `${meta.name} · pick up where you left off` : 'Begin your first lesson'}
            onPress={() => (nextLesson ? router.push(`/lesson/${nextLesson.id}`) : router.push('/(tabs)/learn'))}
          />
          <ActionRow
            icon="freetalk"
            tint={theme.accentDiamond}
            title="Free Talk"
            subtitle="Chat with a local — a real, unscripted conversation"
            onPress={() => router.push('/free-talk')}
          />
          <ActionRow
            icon="review"
            tint={brass}
            title={dueCount > 0 ? `Review ${dueCount} words` : 'Review your words'}
            subtitle="Spaced repetition keeps them from fading"
            onPress={() =>
              router.push({
                pathname: '/review',
                params: { wordIds: (dueCount > 0 ? getDueWordIds() : Object.keys(srsCards)).join(',') },
              })
            }
            disabled={Object.keys(srsCards).length === 0}
          />
        </View>

        {/* Your dialects — lanterns */}
        <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginTop: 28, marginBottom: 12 }}>YOUR DIALECTS</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {enrolledDialects.map((d) => {
            const dm = DIALECTS[d] ?? DIALECTS.msa;
            const active = d === activeDialect;
            return (
              <Lantern
                key={d}
                flag={dm.flag}
                name={dm.name}
                active={active}
                onPress={() => setActiveDialect(d as DialectId)}
                theme={theme}
                brass={brass}
              />
            );
          })}
          <Lantern flag="＋" name="Add" active={false} onPress={() => router.push('/(tabs)/learn')} theme={theme} brass={brass} />
        </View>
      </ScrollView>
    </View>
  );
}

function Kicker({ children, color }: { children: React.ReactNode; color: string }) {
  return <Text style={{ color, fontSize: 10, fontWeight: '800', letterSpacing: 2.4 }}>{children}</Text>;
}

function MajlisCard({ onPress, theme }: { onPress: () => void; theme: ReturnType<typeof useTheme> }) {
  return (
    <AnimatedPressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.surfaceElevated,
        shadowColor: theme.accentDiamond,
        shadowOpacity: theme.mode === 'dark' ? 0.3 : 0.12,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      <LinearGradient colors={[theme.accentGold, theme.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fonts.arabicDisplayBold, fontSize: 24, color: theme.primaryText }}>أ</Text>
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 15 }}>Tonight with Amine</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12.5, marginTop: 2, lineHeight: 17 }}>Ten minutes of real talk — he leads and corrects gently.</Text>
      </View>
      <View style={{ borderWidth: 1, borderColor: theme.accentDiamond, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
        <Text style={{ color: theme.accentDiamond, fontWeight: '800', fontSize: 12.5 }}>Start</Text>
      </View>
    </AnimatedPressable>
  );
}

function Lantern({ flag, name, active, onPress, theme, brass }: { flag: string; name: string; active: boolean; onPress: () => void; theme: ReturnType<typeof useTheme>; brass: string }) {
  return (
    <AnimatedPressable
      onPress={onPress}
      withHaptic={false}
      style={{
        width: '30%',
        flexGrow: 1,
        minWidth: 96,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: active ? brass : theme.border,
        backgroundColor: active ? `${brass}1f` : theme.surfaceElevated,
        paddingVertical: 14,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 22 }}>{flag}</Text>
      <Text style={{ color: active ? brass : theme.textSecondary, fontSize: 11, fontWeight: active ? '800' : '600', marginTop: 6 }}>{name}</Text>
    </AnimatedPressable>
  );
}

function ActionRow({
  icon,
  tint,
  title,
  subtitle,
  onPress,
  disabled,
}: {
  icon: IconName;
  tint: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: theme.surfaceElevated,
        borderRadius: 22,
        padding: 18,
        opacity: disabled ? 0.5 : 1,
        shadowColor: tint,
        shadowOpacity: theme.mode === 'dark' ? 0.32 : 0.14,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 7 },
      }}
    >
      <LinearGradient colors={[tint, `${tint}cc`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={24} color="#ffffff" />
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 15 }}>{title}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12.5, marginTop: 2 }}>{subtitle}</Text>
      </View>
      <Icon name="chevronRight" size={22} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}
