import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Icon, type IconName } from '@/components/ui/Icon';
import { MonumentHero } from '@/components/ui/MonumentHero';
import { getCharactersForDialect } from '@/content/characters';
import { getBackdrop, getPageBackground } from '@/content/dialectBackdrops';
import { DIALECTS } from '@/content/dialectMeta';
import { fonts } from '@/lib/fonts';
import { useTheme } from '@/lib/ThemeProvider';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { DialectId } from '@/types';

interface Topic {
  id: string;
  title: string;
  icon: IconName;
  tint: (t: ReturnType<typeof useTheme>) => string;
  count: number;
  /** A fixed screen to open (e.g. stories). */
  route?: string;
  /** Or a topic to auto-build a lesson around (opens custom-lesson pre-generating). */
  lessonTopic?: string;
}

const TOPICS: Topic[] = [
  { id: 'souk', title: 'At the souk', icon: 'souk', tint: (t) => t.accentGold, count: 18, route: '/story' },
  { id: 'food', title: 'Food & family', icon: 'food', tint: (t) => t.primary, count: 22, lessonTopic: 'Food & family' },
  { id: 'around', title: 'Getting around', icon: 'travel', tint: (t) => t.accentDiamond, count: 15, lessonTopic: 'Getting around & directions' },
  { id: 'greet', title: 'Greetings', icon: 'chat', tint: (t) => t.primary, count: 12, lessonTopic: 'Greetings & small talk' },
  { id: 'money', title: 'Numbers & money', icon: 'coins', tint: (t) => t.accentGold, count: 20, lessonTopic: 'Numbers & money' },
];

const TOOLS: { id: string; title: string; icon: IconName; tint: (t: ReturnType<typeof useTheme>) => string; route: string }[] = [
  { id: 'translator', title: 'Translator', icon: 'translate', tint: (t) => t.accentDiamond, route: '/translator' },
  { id: 'challenge', title: 'Dialect Challenge', icon: 'trophy', tint: (t) => t.accentGold, route: '/challenge' },
  { id: 'drill', title: 'Watch & speak', icon: 'play', tint: () => '#a24b6e', route: '/drill' },
  { id: 'stories', title: 'Interactive stories', icon: 'souk', tint: () => '#c9860a', route: '/story' },
];

export default function Explore() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  const enrolledDialects = useSettingsStore((s) => s.enrolledDialects);
  const setActiveDialect = useSettingsStore((s) => s.setActiveDialect);
  const meta = DIALECTS[activeDialect] ?? DIALECTS.msa;
  const backdrop = getBackdrop(activeDialect);
  const wash = getPageBackground(activeDialect, theme.mode);

  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const cast = useMemo(() => getCharactersForDialect(activeDialect), [activeDialect]);

  // Chips: active dialect first, then everything the learner has started, then a few popular ones.
  const chipDialects = useMemo(() => {
    const popular: DialectId[] = ['msa', 'egyptian', 'levantine', 'moroccan', 'algerian_algiers'];
    return Array.from(new Set<DialectId>([activeDialect, ...enrolledDialects, ...popular])).slice(0, 8);
  }, [activeDialect, enrolledDialects]);

  const people = q ? cast.filter((c) => `${c.name} ${c.role}`.toLowerCase().includes(q)) : cast;
  const topics = q ? TOPICS.filter((t) => t.title.toLowerCase().includes(q)) : TOPICS;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient colors={wash} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: theme.textPrimary, fontSize: 30, fontWeight: '900', letterSpacing: -0.5, paddingHorizontal: 20 }}>Explore</Text>

        {/* Search */}
        <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.surfaceElevated, borderRadius: 16, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 14, height: 48 }}>
            <Icon name="search" size={20} color={theme.textSecondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search phrases, people, topics…"
              placeholderTextColor={theme.textSecondary}
              style={{ flex: 1, color: theme.textPrimary, fontSize: 14 }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <AnimatedPressable onPress={() => setQuery('')} withHaptic={false}>
                <Icon name="close" size={18} color={theme.textSecondary} />
              </AnimatedPressable>
            )}
          </View>
        </View>

        {/* Dialect filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 16 }}>
          {chipDialects.map((d) => {
            const dm = DIALECTS[d] ?? DIALECTS.msa;
            const active = d === activeDialect;
            return (
              <AnimatedPressable
                key={d}
                onPress={() => !active && setActiveDialect(d)}
                withHaptic={false}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: active ? theme.primary : theme.surfaceElevated,
                  borderWidth: 1,
                  borderColor: active ? theme.primary : theme.border,
                  borderRadius: 999,
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                }}
              >
                <Text style={{ fontSize: 14 }}>{dm.flag}</Text>
                <Text style={{ color: active ? theme.primaryText : theme.textPrimary, fontWeight: '700', fontSize: 13 }}>{dm.name}</Text>
              </AnimatedPressable>
            );
          })}
        </ScrollView>

        {/* Story of the week (hidden while searching) */}
        {!q && (
          <View style={{ paddingHorizontal: 20 }}>
            <AnimatedPressable onPress={() => router.push('/story')} style={{ borderRadius: 22, overflow: 'hidden' }}>
              <MonumentHero dialectId={activeDialect} height={176} radius={22}>
                <View style={{ padding: 18 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '800', letterSpacing: 1.4 }}>STORY OF THE WEEK</Text>
                  <Text style={{ color: '#fff', fontSize: 19, fontWeight: '800', marginTop: 4 }}>Phrases from {meta.name}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 }}>8 phrases · {backdrop.landmark} · 4 min</Text>
                </View>
              </MonumentHero>
            </AnimatedPressable>
          </View>
        )}

        {/* Topics shelf */}
        {topics.length > 0 && (
          <>
            <ShelfHeader title="TOPICS FOR YOU" onSeeAll={() => router.push('/custom-lesson')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
              {topics.map((t) => (
                <AnimatedPressable
                  key={t.id}
                  onPress={() => router.push(t.lessonTopic ? { pathname: '/custom-lesson', params: { topic: t.lessonTopic } } : (t.route as never))}
                  style={{ width: 138, backgroundColor: theme.surfaceElevated, borderRadius: 18, overflow: 'hidden', shadowColor: t.tint(theme), shadowOpacity: theme.mode === 'dark' ? 0.3 : 0.14, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }}
                >
                  <LinearGradient colors={[t.tint(theme), `${t.tint(theme)}cc`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 66, alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 14 }}>
                    <Icon name={t.icon} size={28} color="#ffffff" />
                  </LinearGradient>
                  <View style={{ padding: 12 }}>
                    <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 13 }}>{t.title}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>{t.count} phrases</Text>
                  </View>
                </AnimatedPressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* Practice shelf — the tools (kept reachable from Explore) */}
        {!q && (
          <>
            <ShelfHeader title="PRACTICE" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
              {TOOLS.map((tool) => (
                <AnimatedPressable
                  key={tool.id}
                  onPress={() => router.push(tool.route as never)}
                  style={{ width: 138, backgroundColor: theme.surfaceElevated, borderRadius: 18, padding: 14, shadowColor: tool.tint(theme), shadowOpacity: theme.mode === 'dark' ? 0.3 : 0.14, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }}
                >
                  <LinearGradient colors={[tool.tint(theme), `${tool.tint(theme)}cc`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={tool.icon} size={24} color="#ffffff" />
                  </LinearGradient>
                  <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 13, marginTop: 10 }}>{tool.title}</Text>
                </AnimatedPressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* People to meet */}
        {people.length > 0 && (
          <>
            <ShelfHeader title="PEOPLE TO MEET" onSeeAll={() => router.push('/free-talk')} />
            <View style={{ paddingHorizontal: 20, gap: 12 }}>
              {people.map((ch) => (
                <AnimatedPressable
                  key={ch.id}
                  onPress={() => router.push(`/conversation/${ch.id}`)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.surfaceElevated, borderRadius: 16, padding: 14, shadowColor: theme.primary, shadowOpacity: theme.mode === 'dark' ? 0.28 : 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }}
                >
                  <View style={{ width: 46, height: 46, borderRadius: 13, backgroundColor: `${theme.primary}1f`, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: fonts.arabicDisplayBold, fontSize: 20, color: theme.primary }}>{ch.nameArabic?.[0] ?? ch.name?.[0] ?? '؟'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 14 }}>{ch.name}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 1 }}>{ch.role}</Text>
                  </View>
                  <Icon name="chevronRight" size={22} color={theme.textSecondary} />
                </AnimatedPressable>
              ))}
            </View>
          </>
        )}

        {q && people.length === 0 && topics.length === 0 && (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40, paddingHorizontal: 20 }}>
            Nothing matches “{query}”. Try a person, a place, or a topic.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

function ShelfHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 26, marginBottom: 12 }}>
      <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 }}>{title}</Text>
      {onSeeAll && (
        <AnimatedPressable onPress={onSeeAll} withHaptic={false}>
          <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '800' }}>See all</Text>
        </AnimatedPressable>
      )}
    </View>
  );
}
