import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Icon } from '@/components/ui/Icon';
import { DIALECTS } from '@/content/dialectMeta';
import { translateLocally, TRANSLATE_SUGGESTIONS, type TranslateResult } from '@/content/translate';
import { fonts } from '@/lib/fonts';
import { useTheme } from '@/lib/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { notify } from '@/lib/platformAlert';
import { speakArabic } from '@/lib/speech';
import { useLessonStore } from '@/stores/useLessonStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function Translator() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dialectId = useSettingsStore((s) => s.activeDialect);
  const ensureSRSCard = useLessonStore((s) => s.ensureSRSCard);
  const meta = DIALECTS[dialectId] ?? DIALECTS.msa;

  const [input, setInput] = useState('');
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  const parch = theme.mode === 'dark' ? (['#241d12', '#191308'] as const) : (['#fbf1dc', '#f4e6c8'] as const);
  const parchInk = theme.mode === 'dark' ? '#e7d4a8' : '#5c3f12';
  const parchMuted = theme.mode === 'dark' ? '#c9a253' : '#8a6a2a';

  const run = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const r = translateLocally(q, dialectId);
    setResult(r);
    setNotFound(!r);
    if (r) haptic.success();
  };

  const save = () => {
    if (!result) return;
    ensureSRSCard(result.word.id);
    haptic.success();
    notify('Saved to cards', `"${result.word.english}" was added to your review deck.`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={theme.backdropGradient} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <AnimatedPressable onPress={() => router.back()} withHaptic={false}>
            <Icon name="chevronLeft" size={24} color={theme.textPrimary} />
          </AnimatedPressable>
          <Text style={{ color: theme.textPrimary, fontSize: 22, fontWeight: '900' }}>Translator</Text>
        </View>

        {/* Language selector */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20 }}>
          <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>English</Text>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${theme.primary}1f`, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="swap" size={20} color={theme.primary} />
          </View>
          <AnimatedPressable onPress={() => router.push('/(tabs)/learn')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 15 }}>{meta.flag}</Text>
            <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{meta.name}</Text>
          </AnimatedPressable>
        </View>

        {/* Input card */}
        <View style={{ marginTop: 18, backgroundColor: theme.surfaceElevated, borderRadius: 18, borderWidth: 1, borderColor: theme.border, padding: 16 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>ENGLISH</Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => run(input)}
            placeholder="Type a word or phrase…"
            placeholderTextColor={theme.textSecondary}
            style={{ color: theme.textPrimary, fontSize: 17, fontWeight: '600', marginTop: 8, minHeight: 28 }}
            multiline
          />
          <View style={{ marginTop: 12 }}>
            <AnimatedPressable
              onPress={() => run(input)}
              style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.primary, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 11 }}
            >
              <Icon name="translate" size={18} color={theme.primaryText} />
              <Text style={{ color: theme.primaryText, fontWeight: '800' }}>Translate</Text>
            </AnimatedPressable>
          </View>
        </View>

        {/* Suggestions when empty */}
        {!result && !notFound && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
            {TRANSLATE_SUGGESTIONS.map((s) => (
              <AnimatedPressable
                key={s}
                onPress={() => {
                  setInput(s);
                  run(s);
                }}
                style={{ borderRadius: 999, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surfaceElevated, paddingHorizontal: 14, paddingVertical: 8 }}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 13 }}>{s}</Text>
              </AnimatedPressable>
            ))}
          </View>
        )}

        {notFound && (
          <View style={{ marginTop: 16, backgroundColor: theme.surfaceElevated, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16 }}>
            <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>Not in the offline dictionary yet</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>
              Try a common word (see the suggestions), or connect the AI backend to translate any phrase.
            </Text>
          </View>
        )}

        {/* Result parchment card */}
        {result && (
          <>
            <View style={{ marginTop: 18, borderRadius: 20, overflow: 'hidden' }}>
              <LinearGradient colors={parch} style={{ padding: 20, borderRadius: 20, borderWidth: 1, borderColor: theme.mode === 'dark' ? '#3a2f1a' : '#e9d4a6' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: parchMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>{meta.name.toUpperCase()}</Text>
                  <AnimatedPressable onPress={() => speakArabic(result.word.arabic)} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="speak" size={18} color={theme.primaryText} />
                  </AnimatedPressable>
                </View>
                <Text style={{ color: parchInk, fontFamily: fonts.arabicDisplay, fontSize: 32, marginTop: 10, textAlign: 'right' }}>{result.word.arabic}</Text>
                <Text style={{ color: parchMuted, fontStyle: 'italic', marginTop: 6 }}>{result.word.transliteration}</Text>
              </LinearGradient>
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <ActionPill icon="copy" label="Copy" onPress={() => notify('Copied', result.word.arabic)} />
              <ActionPill icon="save" label="Save to cards" onPress={save} primary />
            </View>

            {/* Other dialects */}
            {result.others.length > 0 && (
              <>
                <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 24 }}>IN OTHER DIALECTS</Text>
                <View style={{ marginTop: 12, backgroundColor: theme.surfaceElevated, borderRadius: 16, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' }}>
                  {result.others.map((o, i) => (
                    <View key={o.dialectId} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: theme.border }}>
                      <Text style={{ fontSize: 16 }}>{DIALECTS[o.dialectId]?.flag ?? '🏳️'}</Text>
                      <Text style={{ flex: 1, color: theme.textSecondary, fontWeight: '600', fontSize: 13 }}>{DIALECTS[o.dialectId]?.name ?? o.dialectId}</Text>
                      <Text style={{ color: theme.textPrimary, fontFamily: fonts.arabicBody }}>{o.arabic}</Text>
                      <AnimatedPressable onPress={() => speakArabic(o.arabic)} withHaptic={false}>
                        <Icon name="speak" size={18} color={theme.textSecondary} />
                      </AnimatedPressable>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ActionPill({ icon, label, onPress, primary }: { icon: 'copy' | 'save'; label: string; onPress: () => void; primary?: boolean }) {
  const theme = useTheme();
  return (
    <AnimatedPressable
      onPress={onPress}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 13,
        borderRadius: 14,
        backgroundColor: primary ? theme.primary : theme.surfaceElevated,
        borderWidth: primary ? 0 : 1,
        borderColor: theme.border,
      }}
    >
      <Icon name={icon} size={18} color={primary ? theme.primaryText : theme.textPrimary} />
      <Text style={{ color: primary ? theme.primaryText : theme.textPrimary, fontWeight: '800' }}>{label}</Text>
    </AnimatedPressable>
  );
}
