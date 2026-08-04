import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from './AnimatedPressable';
import { Icon } from './Icon';
import { DIALECT_LIST, DIALECTS, isSelectableDialect } from '@/content/dialectMeta';
import { useTheme } from '@/lib/ThemeProvider';
import { fonts } from '@/lib/fonts';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { DialectId } from '@/types';

/**
 * A professional dialect selector: a compact "bar" showing the active dialect (flag + name), which
 * opens a full dropdown sheet listing every dialect with its country flag. Dialects you're already
 * learning are grouped up top; the rest sit under "All dialects". Picking one makes it active (and
 * enrolls it); a check marks the current selection. Replaces the old chip-strip switcher.
 */
export function DialectPicker() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const enrolled = useSettingsStore((s) => s.enrolledDialects);
  const active = useSettingsStore((s) => s.activeDialect);
  const setActiveDialect = useSettingsStore((s) => s.setActiveDialect);
  const unenrollDialect = useSettingsStore((s) => s.unenrollDialect);
  const [open, setOpen] = useState(false);

  const activeMeta = DIALECTS[active] ?? DIALECTS.msa;
  // Only ever show dialects that still exist AND are selectable — retired ones (e.g. the old
  // "Algiers Arabic") stay in the data for cross-dialect lookups but never appear in the picker.
  const validEnrolled = useMemo(
    () => enrolled.filter((id) => DIALECTS[id] && isSelectableDialect(id)),
    [enrolled],
  );
  const others = useMemo(
    () => DIALECT_LIST.filter((d) => !validEnrolled.includes(d.id)),
    [validEnrolled],
  );

  const pick = (id: DialectId) => {
    setActiveDialect(id);
    setOpen(false);
  };

  return (
    <>
      {/* The bar */}
      <AnimatedPressable
        onPress={() => setOpen(true)}
        withHaptic={false}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: theme.surfaceElevated,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.border,
          paddingVertical: 12,
          paddingHorizontal: 14,
        }}
      >
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${theme.primary}14`, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 22 }}>{activeMeta.flag}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }}>LEARNING</Text>
          <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '800' }}>{activeMeta.name}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>Switch</Text>
          <Icon name="chevronDown" size={18} color={theme.textSecondary} />
        </View>
      </AnimatedPressable>

      {/* The dropdown sheet */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(6,12,20,0.5)', justifyContent: 'flex-end' }}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.background,
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              paddingBottom: insets.bottom + 16,
              maxHeight: '82%',
            }}
          >
            {/* Grabber + header */}
            <View style={{ alignItems: 'center', paddingTop: 10 }}>
              <View style={{ width: 40, height: 5, borderRadius: 999, backgroundColor: theme.border }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 }}>
              <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '900' }}>Choose a dialect</Text>
              <AnimatedPressable onPress={() => setOpen(false)} withHaptic={false} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="close" size={18} color={theme.textSecondary} />
              </AnimatedPressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8 }} showsVerticalScrollIndicator={false}>
              {validEnrolled.length > 0 && (
                <>
                  <SectionLabel theme={theme}>YOUR DIALECTS</SectionLabel>
                  <View style={{ gap: 8, marginBottom: 18 }}>
                    {validEnrolled.map((id) => (
                      <DialectRow
                        key={id}
                        id={id}
                        theme={theme}
                        selected={id === active}
                        onPress={() => pick(id)}
                        onRemove={validEnrolled.length > 1 ? () => unenrollDialect(id) : undefined}
                      />
                    ))}
                  </View>
                </>
              )}

              {others.length > 0 && (
                <>
                  <SectionLabel theme={theme}>ALL DIALECTS</SectionLabel>
                  <View style={{ gap: 8 }}>
                    {others.map((d) => (
                      <DialectRow key={d.id} id={d.id} theme={theme} selected={false} onPress={() => pick(d.id)} />
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function SectionLabel({ children, theme }: { children: React.ReactNode; theme: ReturnType<typeof useTheme> }) {
  return (
    <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.3, marginBottom: 10 }}>{children}</Text>
  );
}

function DialectRow({
  id,
  theme,
  selected,
  onPress,
  onRemove,
}: {
  id: DialectId;
  theme: ReturnType<typeof useTheme>;
  selected: boolean;
  onPress: () => void;
  onRemove?: () => void;
}) {
  const meta = DIALECTS[id];
  if (!meta) return null;
  return (
    <AnimatedPressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: selected ? `${theme.primary}14` : theme.surfaceElevated,
        borderWidth: 1.5,
        borderColor: selected ? theme.primary : theme.border,
      }}
    >
      <Text style={{ fontSize: 26 }}>{meta.flag}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '800' }}>{meta.name}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12 }} numberOfLines={1}>
          <Text style={{ fontFamily: fonts.arabicBody }}>{meta.nativeName}</Text> · {meta.region}
        </Text>
      </View>
      {onRemove && !selected && (
        <AnimatedPressable onPress={onRemove} withHaptic={false} hitSlop={8} style={{ padding: 4 }}>
          <Icon name="close" size={16} color={theme.textSecondary} />
        </AnimatedPressable>
      )}
      {selected ? (
        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={15} color={theme.primaryText} />
        </View>
      ) : (
        <Icon name="chevronRight" size={18} color={theme.textSecondary} />
      )}
    </AnimatedPressable>
  );
}
