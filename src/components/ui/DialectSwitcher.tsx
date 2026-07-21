import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import { DIALECT_LIST, DIALECTS } from '@/content/dialectMeta';
import { useTheme } from '@/lib/ThemeProvider';
import { useSettingsStore } from '@/stores/useSettingsStore';

/**
 * Horizontal switcher for every dialect the learner is actively studying, with a way to add
 * more from the full catalog. Progress is tracked per-lesson-id (which already encodes the
 * dialect), so switching here never loses anything in the dialects you're not currently viewing.
 */
export function DialectSwitcher() {
  const theme = useTheme();
  const enrolled = useSettingsStore((s) => s.enrolledDialects);
  const active = useSettingsStore((s) => s.activeDialect);
  const setActiveDialect = useSettingsStore((s) => s.setActiveDialect);
  const unenrollDialect = useSettingsStore((s) => s.unenrollDialect);
  const [pickerOpen, setPickerOpen] = useState(false);

  const available = DIALECT_LIST.filter((d) => !enrolled.includes(d.id));

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8, paddingRight: 8 }}>
          {enrolled.map((id) => {
            const meta = DIALECTS[id];
            const isActive = id === active;
            return (
              <AnimatedPressable
                key={id}
                onPress={() => setActiveDialect(id)}
                onLongPress={() => enrolled.length > 1 && unenrollDialect(id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: isActive ? theme.primary : theme.glassTint,
                  borderWidth: 1,
                  borderColor: isActive ? theme.primary : theme.glassBorder,
                }}
              >
                <Text style={{ fontSize: 16 }}>{meta.flag}</Text>
                <Text style={{ color: isActive ? theme.primaryText : theme.textPrimary, fontWeight: '700', fontSize: 13 }}>
                  {meta.name}
                </Text>
              </AnimatedPressable>
            );
          })}
          <AnimatedPressable
            onPress={() => setPickerOpen((v) => !v)}
            withHaptic={false}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 999,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: theme.textSecondary,
            }}
          >
            <Text style={{ color: theme.textSecondary, fontWeight: '700', fontSize: 13 }}>{pickerOpen ? '✕' : '+ Add dialect'}</Text>
          </AnimatedPressable>
        </View>
      </ScrollView>

      {pickerOpen && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {available.map((d) => (
            <AnimatedPressable
              key={d.id}
              onPress={() => {
                setActiveDialect(d.id);
                setPickerOpen(false);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: theme.surfaceElevated,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={{ fontSize: 14 }}>{d.flag}</Text>
              <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 12 }}>{d.name}</Text>
            </AnimatedPressable>
          ))}
          {available.length === 0 && (
            <Text style={{ color: theme.textSecondary, fontSize: 12, padding: 8 }}>
              You're already learning every dialect Lahja offers!
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
