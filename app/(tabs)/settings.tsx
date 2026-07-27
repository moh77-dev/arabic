import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { DIALECTS } from '@/content/dialectMeta';
import { useTheme } from '@/lib/ThemeProvider';
import { scheduleDailyReminder } from '@/lib/notifications';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function Settings() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
          <Text style={{ color: theme.textPrimary, fontSize: 26, fontWeight: '900', letterSpacing: -0.4 }}>Settings</Text>
        </View>

        <SectionLabel text="LEARNING" />
        <Group>
          <NavRow icon="flag" label="Dialect" value={`${meta.flag} ${meta.name}`} onPress={() => router.push('/(tabs)/learn')} />
          <NavRow icon="goal" label="Daily goal" value={`${s.reminderTime ? '' : ''}10 min`} onPress={() => {}} />
          <ReminderRow />
        </Group>

        <SectionLabel text="APP" />
        <Group>
          <ToggleRow
            icon="notifications"
            label="Notifications"
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
            label="Theme"
            value={s.themePreference}
            onPress={cycleTheme}
          />
          <ToggleRow icon="accessibility" label="Reduce motion" value={s.reduceMotion} onValueChange={s.setReduceMotion} />
          <ToggleRow icon="accessibility" label="Large text" value={s.largeText} onValueChange={s.setLargeText} last />
        </Group>

        <SectionLabel text="SOUND" />
        <Group>
          <ToggleRow icon="sound" label="Sound effects" value={s.soundEffectsEnabled} onValueChange={s.toggleSound} />
          <ToggleRow icon="mic" label="Haptics" value={s.hapticsEnabled} onValueChange={s.toggleHaptics} last />
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
              <Text style={{ color: theme.mode === 'dark' ? '#e7d4a8' : '#5c3f12', fontWeight: '900', fontSize: 15 }}>Lahja Premium</Text>
              <Text style={{ color: theme.mode === 'dark' ? '#c9a253' : '#9a7521', fontSize: 12 }}>All dialects & AI unlocked</Text>
            </View>
            <Button label="Manage" onPress={() => router.push('/paywall')} size="md" fullWidth={false} />
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
  const TIMES = ['07:00', '12:00', '17:00', '19:00', '21:00'];
  const next = () => {
    const i = (TIMES.indexOf(s.reminderTime) + 1) % TIMES.length;
    s.setReminderTime(TIMES[i]);
    const [h, m] = TIMES[i].split(':').map(Number);
    scheduleDailyReminder(h, m).catch(() => {});
  };
  return <NavRow icon="reminder" label="Reminder" value={s.reminderTime} onPress={next} last />;
}
