import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Icon, type IconName } from '@/components/ui/Icon';
import { MonumentHero } from '@/components/ui/MonumentHero';
import { getBackdrop } from '@/content/dialectBackdrops';
import { DIALECTS } from '@/content/dialectMeta';
import { GUIDE_GLYPH, GUIDE_NAME, getGuideGreeting } from '@/content/guide';
import { useTheme } from '@/lib/ThemeProvider';
import { useSettingsStore } from '@/stores/useSettingsStore';

const CAPABILITIES: { icon: IconName; tint: (t: ReturnType<typeof useTheme>) => string; title: string; subtitle: string; route: string }[] = [
  { icon: 'edit', tint: (t) => t.primary, title: 'Fix my Arabic', subtitle: 'Correct a phrase and explain why', route: 'tutor' },
  { icon: 'grammar', tint: (t) => t.accentGold, title: 'Explain the grammar', subtitle: 'Rules, in plain language', route: 'tutor' },
  { icon: 'lesson', tint: () => '#0ea5e9', title: 'Make me a quick lesson', subtitle: 'Tell Amine what to improve — he builds it', route: '/custom-lesson' },
  { icon: 'speak', tint: (t) => t.primary, title: 'Say it for me', subtitle: 'Translate & hear it in your dialect', route: '/translator' },
];

export default function AskSalah() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const activeDialect = useSettingsStore((s) => s.activeDialect);
  const backdrop = getBackdrop(activeDialect);
  const meta = DIALECTS[activeDialect] ?? DIALECTS.msa;
  const greeting = getGuideGreeting(activeDialect);
  const [draft, setDraft] = useState('');

  // Pulsing "live" dot.
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // Talk to Amine, the AI tutor — he replies in whatever dialect you're currently studying.
  const openTutor = () => router.push('/conversation/anis');

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient colors={theme.mode === 'dark' ? theme.backdropGradient : backdrop.pageWash} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <MonumentHero dialectId={activeDialect} height={300 + insets.top} radius={32}>
          <View style={{ paddingHorizontal: 20, paddingBottom: 30, paddingTop: insets.top + 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AnimatedPressable onPress={() => router.back()} withHaptic={false} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="chevronLeft" size={22} color="#fff" />
              </AnimatedPressable>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}>
                <Text style={{ fontSize: 13 }}>{meta.flag}</Text>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{meta.name}</Text>
              </View>
            </View>

            {/* Amine persona */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22 }}>
              <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: '900', color: backdrop.heroGradient[1] }}>{GUIDE_GLYPH}</Text>
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{GUIDE_NAME}</Text>
                  <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#42d386', opacity: pulse }} />
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>Your {meta.name} guide · {backdrop.landmark}</Text>
              </View>
            </View>

            <Text style={{ color: '#fff', fontSize: 30, fontWeight: '700', marginTop: 18, textAlign: 'right' }}>{greeting.arabic}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 4 }}>{greeting.english}</Text>
          </View>
        </MonumentHero>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Ask bar overlapping the hero */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: -26,
              backgroundColor: theme.surfaceElevated,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 8,
              paddingLeft: 16,
              shadowColor: '#0f172a',
              shadowOpacity: 0.12,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 8 },
            }}
          >
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={`Ask ${GUIDE_NAME}, or say it out loud…`}
              placeholderTextColor={theme.textSecondary}
              style={{ flex: 1, color: theme.textPrimary, fontSize: 14 }}
              onSubmitEditing={openTutor}
            />
            <AnimatedPressable onPress={openTutor} style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="mic" size={20} color={theme.textSecondary} />
            </AnimatedPressable>
            <AnimatedPressable
              onPress={openTutor}
              style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', shadowColor: theme.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
            >
              <Icon name="send" size={20} color={theme.primaryText} />
            </AnimatedPressable>
          </View>

          {/* Capabilities */}
          <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginTop: 24 }}>THINGS I CAN DO</Text>
          <View style={{ gap: 10, marginTop: 12 }}>
            {CAPABILITIES.map((c) => (
              <AnimatedPressable
                key={c.title}
                onPress={() => (c.route === 'tutor' ? openTutor() : router.push(c.route as never))}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.surfaceElevated, borderRadius: 18, borderWidth: 1, borderColor: theme.border, padding: 14 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: `${c.tint(theme)}1f`, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={c.icon} size={22} color={c.tint(theme)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 14 }}>{c.title}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{c.subtitle}</Text>
                </View>
                <Icon name="chevronRight" size={22} color={theme.textSecondary} />
              </AnimatedPressable>
            ))}
          </View>

          {/* Free Talk lives on its own screen now — point people there instead of duplicating it. */}
          <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginTop: 26 }}>WANT TO JUST CHAT?</Text>
          <AnimatedPressable
            onPress={() => router.push('/free-talk')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.surfaceElevated, borderRadius: 18, borderWidth: 1, borderColor: theme.border, padding: 14, marginTop: 12 }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: `${theme.accentDiamond}1f`, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="freetalk" size={22} color={theme.accentDiamond} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 14 }}>Free Talk</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Chat with a local — unscripted, no corrections</Text>
            </View>
            <Icon name="chevronRight" size={22} color={theme.textSecondary} />
          </AnimatedPressable>
        </View>
      </ScrollView>
    </View>
  );
}
