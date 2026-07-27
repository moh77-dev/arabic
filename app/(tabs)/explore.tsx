import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useTheme } from '@/lib/ThemeProvider';

export default function Explore() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer style={{ paddingTop: insets.top + 8 }}>
      <Text style={{ color: theme.textPrimary, fontSize: 30, fontWeight: '900', letterSpacing: -0.5 }}>Explore</Text>
      <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 4, marginBottom: 22 }}>
        Tools and games to practice beyond your lessons.
      </Text>

      <View style={{ gap: 14 }}>
        <BigCard
          icon="translate"
          tint={theme.accentDiamond}
          title="Translator"
          subtitle="English to your dialect, with audio"
          onPress={() => router.push('/translator')}
        />
        <BigCard
          icon="trophy"
          tint={theme.accentGold}
          title="Dialect Challenge"
          subtitle="Guess where each phrase is from"
          onPress={() => router.push('/challenge')}
        />
        <BigCard
          icon="play"
          tint="#a24b6e"
          title="Watch & speak"
          subtitle="Listen to a native speaker, then say it back"
          onPress={() => router.push('/drill')}
        />
        <BigCard
          icon="souk"
          tint="#c9860a"
          title="Interactive stories"
          subtitle="Branching scenes — order food, take a taxi, meet family"
          onPress={() => router.push('/story')}
        />
      </View>
    </ScreenContainer>
  );
}

function BigCard({
  icon,
  tint,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  tint: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <AnimatedPressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: theme.surfaceElevated,
        borderRadius: 24,
        padding: 20,
        shadowColor: tint,
        shadowOpacity: theme.mode === 'dark' ? 0.35 : 0.16,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 7 },
      }}
    >
      <LinearGradient
        colors={[tint, `${tint}cc`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: 56, height: 56, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name={icon} size={27} color="#ffffff" />
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 16 }}>{title}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>{subtitle}</Text>
      </View>
      <Icon name="chevronRight" size={24} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}
