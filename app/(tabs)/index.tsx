import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Avatar } from '@/components/ui/Avatar';
import { DialectPicker } from '@/components/ui/DialectPicker';
import { Icon, type IconName } from '@/components/ui/Icon';
import { MonumentHero } from '@/components/ui/MonumentHero';
import { getBackdrop } from '@/content/dialectBackdrops';
import { DIALECTS } from '@/content/dialectMeta';
import { getUnitsForDialect, LESSONS_BY_ID } from '@/content/lessonPaths';
import { useTheme } from '@/lib/ThemeProvider';
import { levelFromTotalXp } from '@/lib/gamificationMath';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useLessonStore } from '@/stores/useLessonStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUserStore } from '@/stores/useUserStore';

export default function Home() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const gami = useGamificationStore();
  const { completedLessonIds, getDueWordIds, srsCards } = useLessonStore();
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  const displayName = useUserStore((s) => s.displayName) ?? 'friend';

  const { level, xpIntoLevel, xpForNextLevel } = levelFromTotalXp(gami.totalXp);
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

  const dueCount = useMemo(() => getDueWordIds().length, [srsCards, getDueWordIds]);
  const pageWash = theme.mode === 'dark' ? theme.backdropGradient : backdrop.pageWash;
  const parchment = theme.mode === 'dark' ? (['#241d12', '#191308'] as const) : (['#fbf1dc', '#f4e6c8'] as const);
  const parchInk = theme.mode === 'dark' ? '#e7d4a8' : '#5c3f12';
  const parchMuted = theme.mode === 'dark' ? '#c9a253' : '#9a7521';

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient colors={pageWash} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <MonumentHero dialectId={activeDialect} height={210 + insets.top}>
          <View style={{ paddingHorizontal: 20, paddingBottom: 22, paddingTop: insets.top + 8 }}>
            {/* Avatar + quiet stat chips */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AnimatedPressable onPress={() => router.push('/(tabs)/profile')} withHaptic={false}>
                <Avatar id={gami.activeAvatar} size={40} ring />
              </AnimatedPressable>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <StatChip icon="streak" value={gami.currentStreak} />
                <AnimatedPressable onPress={() => router.push('/shop')} withHaptic={false}>
                  <StatChip icon="diamond" value={gami.diamonds} />
                </AnimatedPressable>
              </View>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, marginTop: 26 }}>Assalamu alaykum,</Text>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.4 }}>{displayName}</Text>
          </View>
        </MonumentHero>

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          {/* Level card (parchment) */}
          <View style={{ borderRadius: 22, overflow: 'hidden' }}>
            <LinearGradient
              colors={parchment}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20, borderRadius: 22, borderWidth: 1, borderColor: theme.mode === 'dark' ? '#3a2f1a' : '#e9d4a6' }}
            >
              <MonoLabel color={parchMuted}>
                {meta.name.toUpperCase()} · LEVEL {level}
              </MonoLabel>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ color: parchInk, fontSize: 26, fontWeight: '900' }}>{meta.nativeName}</Text>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.mode === 'dark' ? 'rgba(201,162,83,0.18)' : 'rgba(154,117,33,0.14)',
                  }}
                >
                  <Text style={{ fontSize: 26 }}>{meta.flag}</Text>
                </View>
              </View>

              <View style={{ height: 8, borderRadius: 999, backgroundColor: theme.mode === 'dark' ? '#3a2f1a' : '#e6d2a4', overflow: 'hidden', marginTop: 16 }}>
                <LinearGradient
                  colors={[theme.accentGold, theme.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: '100%', width: `${(xpIntoLevel / xpForNextLevel) * 100}%`, borderRadius: 999 }}
                />
              </View>
              <Text style={{ color: parchMuted, fontSize: 12, marginTop: 6 }}>
                {xpIntoLevel} / {xpForNextLevel} XP to Level {level + 1}
              </Text>

              <AnimatedPressable
                onPress={() => (nextLesson ? router.push(`/lesson/${nextLesson.id}`) : router.push('/(tabs)/learn'))}
                style={{
                  marginTop: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  alignSelf: 'flex-start',
                  overflow: 'hidden',
                  paddingHorizontal: 20,
                  paddingVertical: 13,
                  borderRadius: 15,
                  backgroundColor: theme.primary,
                  shadowColor: theme.primary,
                  shadowOpacity: 0.45,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 8 },
                }}
              >
                {/* Glossy sheen to match the premium buttons. */}
                <LinearGradient
                  pointerEvents="none"
                  colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.04)', 'rgba(0,0,0,0.08)']}
                  locations={[0, 0.55, 1]}
                  style={StyleSheet.absoluteFill}
                />
                <Icon name="play" size={18} color={theme.primaryText} />
                <Text style={{ color: theme.primaryText, fontWeight: '800', fontSize: 15 }}>
                  {nextLesson ? `Continue · ${nextLesson.title}` : 'Explore lessons'}
                </Text>
              </AnimatedPressable>
            </LinearGradient>
          </View>

          {/* Pick up where you left off */}
          <View style={{ marginTop: 26 }}>
            <MonoLabel color={theme.textSecondary}>PICK UP WHERE YOU LEFT OFF</MonoLabel>
            <View style={{ gap: 10, marginTop: 12 }}>
              <ActionRow
                icon="chat"
                tint={theme.primary}
                title="Ask Anis"
                subtitle={`Your ${meta.name} tutor — grammar, phrases, anything`}
                onPress={() => router.push('/conversation')}
              />
              <ActionRow
                icon="freetalk"
                tint={theme.accentDiamond}
                title="Free Talk"
                subtitle="Pick a place and start a real conversation"
                onPress={() => router.push('/conversation')}
              />
              <ActionRow
                icon="review"
                tint={theme.accentGold}
                title={dueCount > 0 ? `Review ${dueCount} words` : 'Review your words'}
                subtitle="Spaced repetition keeps them from fading"
                onPress={() => router.push('/(tabs)/streak')}
                overridePress={() =>
                  router.push({
                    pathname: '/review',
                    params: { wordIds: (dueCount > 0 ? getDueWordIds() : Object.keys(srsCards)).join(',') },
                  })
                }
                disabled={Object.keys(srsCards).length === 0}
              />
            </View>
          </View>

          {/* Keep exploring */}
          <View style={{ marginTop: 24 }}>
            <MonoLabel color={theme.textSecondary}>KEEP EXPLORING</MonoLabel>
            <View style={{ gap: 10, marginTop: 12 }}>
              <ActionRow
                icon="goal"
                tint={theme.primary}
                title="Your plan"
                subtitle="This week's path, made for your goal"
                onPress={() => router.push('/plan')}
              />
              <ActionRow
                icon="trophy"
                tint={theme.accentGold}
                title="Dialect Challenge"
                subtitle="Guess where each phrase is from"
                onPress={() => router.push('/challenge')}
              />
              <ActionRow
                icon="translate"
                tint={theme.accentDiamond}
                title="Translator"
                subtitle="English to your dialect, with audio"
                onPress={() => router.push('/translator')}
              />
              <ActionRow
                icon="play"
                tint="#a24b6e"
                title="Watch & speak"
                subtitle="Listen to a native speaker, then say it back"
                onPress={() => router.push('/drill')}
              />
              <ActionRow
                icon="souk"
                tint="#c9860a"
                title="Interactive stories"
                subtitle="Branching scenes — order food, take a taxi, meet family"
                onPress={() => router.push('/story')}
              />
            </View>
          </View>

          {/* Your dialects */}
          <View style={{ marginTop: 26 }}>
            <MonoLabel color={theme.textSecondary}>YOUR DIALECTS</MonoLabel>
            <View style={{ marginTop: 12 }}>
              <DialectPicker />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatChip({ icon, value }: { icon: IconName; value: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(0,0,0,0.28)',
        borderRadius: 999,
        paddingHorizontal: 11,
        paddingVertical: 6,
      }}
    >
      <Icon name={icon} size={15} color="#ffffff" />
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{value}</Text>
    </View>
  );
}

function MonoLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
      {/* Small eight-point star — a nod to Islamic geometric ornament — to give section
          headers a bit of cultural character instead of a plain caps label. */}
      <Text style={{ color, fontSize: 11, marginTop: -1 }}>۞</Text>
      <Text style={{ color, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 }}>{children}</Text>
    </View>
  );
}

function ActionRow({
  icon,
  tint,
  title,
  subtitle,
  onPress,
  overridePress,
  disabled,
}: {
  icon: IconName;
  tint: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  overridePress?: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <AnimatedPressable
      onPress={overridePress ?? onPress}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: theme.surfaceElevated,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 14,
        opacity: disabled ? 0.5 : 1,
        // A soft colored glow tinted to the row's accent gives the list depth and warmth
        // instead of reading as flat identical rows.
        shadowColor: tint,
        shadowOpacity: theme.mode === 'dark' ? 0.35 : 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 5 },
      }}
    >
      {/* Solid, saturated tile with a white glyph and a matching glow — richer than a pale wash. */}
      <LinearGradient
        colors={[tint, `${tint}cc`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: tint,
          shadowOpacity: 0.5,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Icon name={icon} size={22} color="#ffffff" />
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 14 }}>{title}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 1 }}>{subtitle}</Text>
      </View>
      <Icon name="chevronRight" size={22} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}
