import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { AVATAR_EMOJI } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { DialectPicker } from '@/components/ui/DialectPicker';
import { Icon } from '@/components/ui/Icon';
import { TextField } from '@/components/ui/TextField';
import { useTheme } from '@/lib/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useUserStore } from '@/stores/useUserStore';

export default function EditProfile() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const displayName = useUserStore((s) => s.displayName);
  const setDisplayName = useUserStore((s) => s.setDisplayName);

  const activeAvatar = useGamificationStore((s) => s.activeAvatar);
  const setActiveAvatar = useGamificationStore((s) => s.setActiveAvatar);
  const unlockAvatar = useGamificationStore((s) => s.unlockAvatar);
  const titles = useGamificationStore((s) => s.titles);
  const activeTitle = useGamificationStore((s) => s.activeTitle);
  const setActiveTitle = useGamificationStore((s) => s.setActiveTitle);

  const [name, setName] = useState(displayName ?? '');

  const pickAvatar = (id: string) => {
    unlockAvatar(id);
    setActiveAvatar(id);
    haptic.select();
  };

  const save = () => {
    setDisplayName(name.trim() || 'Learner');
    haptic.success();
    router.back();
  };

  const Label = ({ children }: { children: string }) => (
    <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 26 }}>{children}</Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={theme.backdropGradient} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <AnimatedPressable onPress={() => router.back()} withHaptic={false}>
            <Icon name="chevronLeft" size={24} color={theme.textPrimary} />
          </AnimatedPressable>
          <Text style={{ color: theme.textPrimary, fontSize: 22, fontWeight: '900' }}>Edit profile</Text>
        </View>

        {/* Name */}
        <Label>DISPLAY NAME</Label>
        <View style={{ marginTop: 12 }}>
          <TextField value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" maxLength={24} />
        </View>

        {/* Avatar */}
        <Label>AVATAR</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
          {Object.entries(AVATAR_EMOJI).map(([id, emoji]) => {
            const selected = id === activeAvatar;
            return (
              <AnimatedPressable
                key={id}
                onPress={() => pickAvatar(id)}
                withHaptic={false}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.surfaceElevated,
                  borderWidth: selected ? 3 : 1,
                  borderColor: selected ? theme.primary : theme.border,
                }}
              >
                <Text style={{ fontSize: 28 }}>{emoji}</Text>
              </AnimatedPressable>
            );
          })}
        </View>

        {/* Dialect */}
        <Label>DIALECT YOU'RE LEARNING</Label>
        <View style={{ marginTop: 12 }}>
          <DialectPicker />
        </View>

        {/* Title */}
        <Label>TITLE</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {['No title', ...titles].map((t) => {
            const value = t === 'No title' ? null : t;
            const selected = activeTitle === value;
            return (
              <AnimatedPressable
                key={t}
                onPress={() => {
                  setActiveTitle(value);
                  haptic.select();
                }}
                style={{
                  borderRadius: 999,
                  borderWidth: 1.5,
                  borderColor: selected ? theme.primary : theme.border,
                  backgroundColor: selected ? `${theme.primary}14` : theme.surfaceElevated,
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                }}
              >
                <Text style={{ color: selected ? theme.primary : theme.textPrimary, fontWeight: '700', fontSize: 13 }}>{t}</Text>
              </AnimatedPressable>
            );
          })}
        </View>

        <View style={{ marginTop: 32 }}>
          <Button label="Save" onPress={save} />
        </View>
      </ScrollView>
    </View>
  );
}
