import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { DIALECTS } from '@/content/dialectMeta';
import { useTheme } from '@/lib/ThemeProvider';
import { SUPPORTED_LANGUAGES, useT } from '@/lib/i18n';
import { scheduleDailyReminder } from '@/lib/notifications';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function Settings() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const t = useT();
  const s = useSettingsStore();
  const meta = DIALECTS[s.activeDialect] ?? DIALECTS.msa;

  const cycleTheme = () => {
    const order = ['system', 'light', 'dark'] as const;
    const next = order[(order.indexOf(s.themePreference) + 1) % order.length];
    s.setThemePreference(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient colors={theme.backdropGradient} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AnimatedPressable onPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)/profile'))} withHaptic={false}>
            <Icon name="chevronLeft" size={28} color={theme.textPrimary} />
          </AnimatedPressable>
          <Text style={{ color: theme.textPrimary, fontSize: 26, fontWeight: '900', letterSpacing: -0.4 }}>{t('settings.title')}</Text>
        </View>

        <SectionLabel text={t('settings.section.learning')} />
        <Group>
          <NavRow icon="flag" label={t('settings.dialect')} value={`${meta.flag} ${meta.name}`} onPress={() => router.push('/(tabs)/learn')} />
          <LanguageRow />
          <ReminderRow />
        </Group>

        <SectionLabel text={t('settings.section.app')} />
        <Group>
          <ToggleRow
            icon="notifications"
            label={t('settings.notifications')}
            value={s.notificationsEnabled}
            onValueChange={(v) => {
              s.toggleNotifications();
              if (v) {
                const [h, m] = s.reminderTime.split(':').map(Number);
                scheduleDailyReminder(h, m).catch(() => {});
              }
            }}
          />
          <NavRow
            icon="darkmode"
            label={t('settings.theme')}
            value={s.themePreference}
            onPress={cycleTheme}
          />
          <ToggleRow icon="accessibility" label={t('settings.reduceMotion')} value={s.reduceMotion} onValueChange={s.setReduceMotion} />
          <ToggleRow icon="accessibility" label={t('settings.largeText')} value={s.largeText} onValueChange={s.setLargeText} last />
        </Group>

        <SectionLabel text={t('settings.section.sound')} />
        <Group>
          <ToggleRow icon="sound" label={t('settings.soundEffects')} value={s.soundEffectsEnabled} onValueChange={s.toggleSound} />
          <ToggleRow icon="mic" label={t('settings.haptics')} value={s.hapticsEnabled} onValueChange={s.toggleHaptics} last />
        </Group>

        {/* Premium */}
        <View style={{ marginTop: 24, borderRadius: 20, overflow: 'hidden' }}>
          <LinearGradient
            colors={theme.mode === 'dark' ? ['#241d12', '#191308'] : ['#fbf1dc', '#f4e6c8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 18, borderRadius: 20, borderWidth: 1, borderColor: theme.mode === 'dark' ? '#3a2f1a' : '#e9d4a6', flexDirection: 'row', alignItems: 'center', gap: 14 }}
          >
            <Icon name="diamond" size={26} color={theme.accentDiamond} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.mode === 'dark' ? '#e7d4a8' : '#5c3f12', fontWeight: '900', fontSize: 15 }}>{t('settings.premium')}</Text>
              <Text style={{ color: theme.mode === 'dark' ? '#c9a253' : '#9a7521', fontSize: 12 }}>{t('settings.premiumSub')}</Text>
            </View>
            <Button label={t('common.manage')} onPress={() => router.push('/paywall')} size="md" fullWidth={false} />
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ text }: { text: string }) {
  const theme = useTheme();
  return <Text style={{ color: theme.textSecondary, fontWeight: '800', fontSize: 11, letterSpacing: 1.4, marginTop: 26, marginBottom: 10 }}>{text}</Text>;
}

function Group({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ backgroundColor: theme.surfaceElevated, borderRadius: 18, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' }}>
      {children}
    </View>
  );
}

function NavRow({ icon, label, value, onPress, last }: { icon: IconName; label: string; value?: string; onPress: () => void; last?: boolean }) {
  const theme = useTheme();
  return (
    <AnimatedPressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.border }}>
      <Icon name={icon} size={20} color={theme.textSecondary} />
      <Text style={{ flex: 1, color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>{label}</Text>
      {value ? <Text style={{ color: theme.textSecondary, fontSize: 13, textTransform: 'capitalize' }}>{value}</Text> : null}
      <Icon name="chevronRight" size={20} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}

function ToggleRow({ icon, label, value, onValueChange, last }: { icon: IconName; label: string; value: boolean; onValueChange: (v: boolean) => void; last?: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.border }}>
      <Icon name={icon} size={20} color={theme.textSecondary} />
      <Text style={{ flex: 1, color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: theme.primary, false: '#d5d8dd' }} thumbColor="#ffffff" />
    </View>
  );
}

function ReminderRow() {
  const s = useSettingsStore();
  const t = useT();
  const TIMES = ['07:00', '12:00', '17:00', '19:00', '21:00'];
  const next = () => {
    const i = (TIMES.indexOf(s.reminderTime) + 1) % TIMES.length;
    s.setReminderTime(TIMES[i]);
    const [h, m] = TIMES[i].split(':').map(Number);
    scheduleDailyReminder(h, m).catch(() => {});
  };
  return <NavRow icon="reminder" label={t('settings.reminder')} value={s.reminderTime} onPress={next} />;
}

/** Row + modal to change the whole app's language. */
function LanguageRow() {
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const language = useSettingsStore((st) => st.language);
  const setLanguage = useSettingsStore((st) => st.setLanguage);
  const [open, setOpen] = useState(false);
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === language) ?? SUPPORTED_LANGUAGES[0];

  return (
    <>
      <NavRow icon="translate" label={t('settings.appLanguage')} value={current.native} onPress={() => setOpen(true)} />
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(6,12,20,0.5)', justifyContent: 'flex-end' }}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: theme.background, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingBottom: insets.bottom + 16 }}>
            <View style={{ alignItems: 'center', paddingTop: 10 }}>
              <View style={{ width: 40, height: 5, borderRadius: 999, backgroundColor: theme.border }} />
            </View>
            <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '900', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 }}>
              {t('settings.chooseLanguage')}
            </Text>
            <View style={{ paddingHorizontal: 20, gap: 8, paddingTop: 4 }}>
              {SUPPORTED_LANGUAGES.map((l) => {
                const selected = l.code === language;
                return (
                  <AnimatedPressable
                    key={l.code}
                    onPress={() => {
                      setLanguage(l.code);
                      setOpen(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingVertical: 13,
                      paddingHorizontal: 14,
                      borderRadius: 16,
                      backgroundColor: selected ? `${theme.primary}14` : theme.surfaceElevated,
                      borderWidth: 1.5,
                      borderColor: selected ? theme.primary : theme.border,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '800' }}>{l.native}</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{l.label}</Text>
                    </View>
                    {selected && (
                      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="check" size={15} color={theme.primaryText} />
                      </View>
                    )}
                  </AnimatedPressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
