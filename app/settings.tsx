import { Stack } from 'expo-router';
import React from 'react';
import { Switch, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/lib/ThemeProvider';
import { scheduleDailyReminder } from '@/lib/notifications';
import { useSettingsStore } from '@/stores/useSettingsStore';

const REMINDER_TIMES = ['07:00', '12:00', '17:00', '19:00', '21:00'];

export default function Settings() {
  const theme = useTheme();
  const s = useSettingsStore();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Settings', headerStyle: { backgroundColor: theme.background }, headerTintColor: theme.textPrimary }} />
      <ScreenContainer edges={[]}>
        <SectionLabel text="Appearance" />
        <Card>
          <Row label="Theme">
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['system', 'light', 'dark'] as const).map((t) => (
                <Chip key={t} label={t} selected={s.themePreference === t} onPress={() => s.setThemePreference(t)} />
              ))}
            </View>
          </Row>
        </Card>

        <SectionLabel text="Notifications" />
        <Card>
          <Row label="Daily reminders">
            <Switch
              value={s.notificationsEnabled}
              onValueChange={(v) => {
                s.toggleNotifications();
                if (v) {
                  const [h, m] = s.reminderTime.split(':').map(Number);
                  scheduleDailyReminder(h, m).catch(() => {});
                }
              }}
            />
          </Row>
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 8 }}>Reminder time</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {REMINDER_TIMES.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  selected={s.reminderTime === t}
                  onPress={() => {
                    s.setReminderTime(t);
                    const [h, m] = t.split(':').map(Number);
                    scheduleDailyReminder(h, m).catch(() => {});
                  }}
                />
              ))}
            </View>
          </View>
        </Card>

        <SectionLabel text="Sound & Haptics" />
        <Card>
          <Row label="Sound effects">
            <Switch value={s.soundEffectsEnabled} onValueChange={s.toggleSound} />
          </Row>
          <Row label="Haptic feedback">
            <Switch value={s.hapticsEnabled} onValueChange={s.toggleHaptics} />
          </Row>
        </Card>

        <SectionLabel text="Accessibility" />
        <Card>
          <Row label="Reduce motion">
            <Switch value={s.reduceMotion} onValueChange={s.setReduceMotion} />
          </Row>
          <Row label="Large text">
            <Switch value={s.largeText} onValueChange={s.setLargeText} />
          </Row>
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 8 }}>Color blindness mode</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(['none', 'protanopia', 'deuteranopia', 'tritanopia'] as const).map((m) => (
                <Chip key={m} label={m} selected={s.colorBlindMode === m} onPress={() => s.setColorBlindMode(m)} />
              ))}
            </View>
          </View>
        </Card>
      </ScreenContainer>
    </>
  );
}

function SectionLabel({ text }: { text: string }) {
  const theme = useTheme();
  return <Text style={{ color: theme.textSecondary, fontWeight: '800', fontSize: 12, marginTop: 20, marginBottom: 8, textTransform: 'uppercase' }}>{text}</Text>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
      <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{label}</Text>
      {children}
    </View>
  );
}
