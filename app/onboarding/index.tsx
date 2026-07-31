import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { DIALECT_LIST } from '@/content/dialectMeta';
import { useTheme } from '@/lib/ThemeProvider';
import { labelToLang, useT } from '@/lib/i18n';
import { scheduleDailyReminder } from '@/lib/notifications';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUserStore } from '@/stores/useUserStore';
import type { DialectId, DifficultyLevel, LearningGoal, SpeechConfidence } from '@/types';

const LANGUAGES = ['English', 'French', 'Spanish', 'German', 'Turkish', 'Urdu', 'Other'];
const GOALS: { id: LearningGoal; emoji: string }[] = [
  { id: 'travel', emoji: '✈️' },
  { id: 'family', emoji: '👪' },
  { id: 'religion', emoji: '🕌' },
  { id: 'business', emoji: '💼' },
  { id: 'school', emoji: '🎓' },
  { id: 'fun', emoji: '🎉' },
];
const DIFFICULTIES: DifficultyLevel[] = ['easy', 'moderate', 'challenging', 'intense'];
const GOAL_MINUTES: Record<DifficultyLevel, number> = { easy: 5, moderate: 10, challenging: 15, intense: 25 };
const REMINDER_TIMES = ['07:00', '12:00', '17:00', '19:00', '21:00'];
const CONFIDENCE: { id: SpeechConfidence; emoji: string }[] = [
  { id: 'beginner', emoji: '🌱' },
  { id: 'shy', emoji: '😳' },
  { id: 'comfortable', emoji: '🙂' },
  { id: 'confident', emoji: '😎' },
];

type Step =
  | 'welcome'
  | 'nativeLanguage'
  | 'experience'
  | 'goals'
  | 'dialect'
  | 'difficulty'
  | 'reminder'
  | 'confidence'
  | 'generating';

const STEP_ORDER: Step[] = ['welcome', 'nativeLanguage', 'experience', 'goals', 'dialect', 'difficulty', 'reminder', 'confidence', 'generating'];

export default function Onboarding() {
  const theme = useTheme();
  const t = useT();
  const updateOnboardingProfile = useUserStore((s) => s.updateOnboardingProfile);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const setActiveDialect = useSettingsStore((s) => s.setActiveDialect);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  const [stepIndex, setStepIndex] = useState(0);
  const step = STEP_ORDER[stepIndex];

  const [nativeLanguage, setNativeLanguage] = useState<string | null>(null);
  const [experience, setExperience] = useState<'none' | 'a_little' | 'intermediate' | 'fluent_other_dialect' | null>(null);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [dialect, setDialect] = useState<string | null>('algerian_eloued');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [reminderTime, setReminderTime] = useState<string>('19:00');
  const [confidence, setConfidence] = useState<SpeechConfidence | null>(null);

  // Applying the language the moment they pick it makes the rest of onboarding switch instantly.
  const pickNativeLanguage = (label: string) => {
    setNativeLanguage(label);
    setLanguage(labelToLang(label));
  };

  const progress = stepIndex / (STEP_ORDER.length - 1);

  const canGoNext = useMemo(() => {
    switch (step) {
      case 'welcome':
        return true;
      case 'nativeLanguage':
        return !!nativeLanguage;
      case 'experience':
        return !!experience;
      case 'goals':
        return goals.length > 0;
      case 'dialect':
        return !!dialect;
      case 'difficulty':
        return !!difficulty;
      case 'reminder':
        return !!reminderTime;
      case 'confidence':
        return !!confidence;
      default:
        return false;
    }
  }, [step, nativeLanguage, experience, goals, dialect, difficulty, reminderTime, confidence]);

  const goNext = async () => {
    if (stepIndex === STEP_ORDER.length - 2) {
      // Last question answered -> finalize.
      updateOnboardingProfile({
        nativeLanguage: nativeLanguage!,
        arabicExperience: experience!,
        goals,
        favoriteDialect: dialect as any,
        difficulty: difficulty!,
        dailyGoalMinutes: GOAL_MINUTES[difficulty!],
        reminderTime,
        speechConfidence: confidence!,
      });
      // Make the dialect they picked the one they actually start learning.
      if (dialect) setActiveDialect(dialect as DialectId);
      setStepIndex((i) => i + 1);
      scheduleDailyReminder(...(reminderTime.split(':').map(Number) as [number, number])).catch(() => {});
      setTimeout(() => {
        completeOnboarding();
        router.replace('/(auth)/sign-up');
      }, 2200);
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1));
  };

  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {step !== 'welcome' && step !== 'generating' && (
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <View style={{ height: 8, borderRadius: 999, backgroundColor: theme.border, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: theme.primary, borderRadius: 999 }} />
          </View>
        </View>
      )}

      <Animated.View key={step} entering={FadeInRight.duration(250)} exiting={FadeOutLeft.duration(150)} style={{ flex: 1 }}>
        {step === 'welcome' && <WelcomeStep />}
        {step === 'nativeLanguage' && <ChoiceStep title={t('onb.nativeLanguage')} options={LANGUAGES} selected={nativeLanguage} onSelect={pickNativeLanguage} />}
        {step === 'experience' && (
          <ChoiceStep
            title={t('onb.experience')}
            options={[
              { id: 'none', label: t('onb.exp.none') },
              { id: 'a_little', label: t('onb.exp.a_little') },
              { id: 'intermediate', label: t('onb.exp.intermediate') },
              { id: 'fluent_other_dialect', label: t('onb.exp.fluent_other_dialect') },
            ]}
            selected={experience}
            onSelect={(v) => setExperience(v as any)}
          />
        )}
        {step === 'goals' && (
          <ScreenContainer scroll edges={[]} gradient>
            <StepHeader title={t('onb.goalsTitle')} subtitle={t('onb.goalsSub')} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
              {GOALS.map((g) => (
                <Chip
                  key={g.id}
                  label={t(`onb.goal.${g.id}`)}
                  emoji={g.emoji}
                  selected={goals.includes(g.id)}
                  onPress={() => setGoals((prev) => (prev.includes(g.id) ? prev.filter((x) => x !== g.id) : [...prev, g.id]))}
                />
              ))}
            </View>
          </ScreenContainer>
        )}
        {step === 'dialect' && (
          <ScreenContainer scroll edges={[]} gradient>
            <StepHeader title={t('onb.dialectTitle')} subtitle={t('onb.dialectSub')} />
            <View style={{ gap: 10, marginTop: 24 }}>
              {DIALECT_LIST.map((d) => (
                <AnimatedPressable
                  key={d.id}
                  onPress={() => setDialect(d.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: dialect === d.id ? theme.primary : theme.border,
                    backgroundColor: dialect === d.id ? `${theme.primary}15` : theme.surfaceElevated,
                  }}
                >
                  <Text style={{ fontSize: 26 }}>{d.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{d.name}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }} numberOfLines={2}>{d.blurb}</Text>
                  </View>
                </AnimatedPressable>
              ))}
            </View>
          </ScreenContainer>
        )}
        {step === 'difficulty' && (
          <ScreenContainer scroll edges={[]} gradient>
            <StepHeader title={t('onb.difficultyTitle')} />
            <View style={{ gap: 10, marginTop: 24 }}>
              {DIFFICULTIES.map((d) => (
                <AnimatedPressable
                  key={d}
                  onPress={() => setDifficulty(d)}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: difficulty === d ? theme.primary : theme.border,
                    backgroundColor: difficulty === d ? `${theme.primary}15` : theme.surfaceElevated,
                  }}
                >
                  <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: 16 }}>{t(`onb.diff.${d}`)}</Text>
                  <Text style={{ color: theme.textSecondary }}>{t(`onb.diff.${d}.sub`)}</Text>
                </AnimatedPressable>
              ))}
            </View>
          </ScreenContainer>
        )}
        {step === 'reminder' && (
          <ScreenContainer scroll edges={[]} gradient>
            <StepHeader title={t('onb.reminderTitle')} subtitle={t('onb.reminderSub')} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
              {REMINDER_TIMES.map((t) => (
                <Chip key={t} label={t} selected={reminderTime === t} onPress={() => setReminderTime(t)} />
              ))}
            </View>
          </ScreenContainer>
        )}
        {step === 'confidence' && (
          <ScreenContainer scroll edges={[]} gradient>
            <StepHeader title={t('onb.confidenceTitle')} />
            <View style={{ gap: 10, marginTop: 24 }}>
              {CONFIDENCE.map((c) => (
                <AnimatedPressable
                  key={c.id}
                  onPress={() => setConfidence(c.id)}
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'center',
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: confidence === c.id ? theme.primary : theme.border,
                    backgroundColor: confidence === c.id ? `${theme.primary}15` : theme.surfaceElevated,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{c.emoji}</Text>
                  <Text style={{ color: theme.textPrimary, fontWeight: '700', flex: 1 }}>{t(`onb.conf.${c.id}`)}</Text>
                </AnimatedPressable>
              ))}
            </View>
          </ScreenContainer>
        )}
        {step === 'generating' && <GeneratingStep dialectName={DIALECT_LIST.find((d) => d.id === dialect)?.name ?? 'Arabic'} />}
      </Animated.View>

      {step !== 'welcome' && step !== 'generating' && (
        <View style={{ flexDirection: 'row', gap: 12, padding: 20 }}>
          <Button label={t('common.back')} variant="secondary" onPress={goBack} fullWidth={false} />
          <View style={{ flex: 1 }}>
            <Button label={stepIndex === STEP_ORDER.length - 2 ? t('common.finish') : t('common.continue')} onPress={goNext} disabled={!canGoNext} />
          </View>
        </View>
      )}
      {step === 'welcome' && (
        <View style={{ padding: 20 }}>
          <Button label={t('common.getStarted')} onPress={goNext} />
        </View>
      )}
    </SafeAreaView>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const theme = useTheme();
  return (
    <View>
      <Text style={{ fontSize: 26, fontWeight: '900', color: theme.textPrimary }}>{title}</Text>
      {subtitle ? <Text style={{ fontSize: 15, color: theme.textSecondary, marginTop: 6 }}>{subtitle}</Text> : null}
    </View>
  );
}

function ChoiceStep({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: (string | { id: string; label: string })[];
  selected: string | null;
  onSelect: (v: string) => void;
}) {
  const theme = useTheme();
  const normalized = options.map((o) => (typeof o === 'string' ? { id: o, label: o } : o));
  return (
    <ScreenContainer scroll edges={[]} gradient>
      <StepHeader title={title} />
      <View style={{ gap: 10, marginTop: 24 }}>
        {normalized.map((o) => (
          <AnimatedPressable
            key={o.id}
            onPress={() => onSelect(o.id)}
            style={{
              padding: 16,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: selected === o.id ? theme.primary : theme.border,
              backgroundColor: selected === o.id ? `${theme.primary}15` : theme.surfaceElevated,
            }}
          >
            <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{o.label}</Text>
          </AnimatedPressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

function WelcomeStep() {
  const theme = useTheme();
  const t = useT();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 72, marginBottom: 20 }}>🏜️</Text>
      <Text style={{ fontSize: 34, fontWeight: '900', color: theme.textPrimary, textAlign: 'center' }}>Lisan</Text>
      <Text style={{ fontSize: 18, color: theme.textSecondary, textAlign: 'center', marginTop: 8 }}>
        {t('onb.welcomeTagline')}
      </Text>
      <Text style={{ fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginTop: 20, lineHeight: 22 }}>
        {t('onb.welcomeBody')}
      </Text>
    </View>
  );
}

function GeneratingStep({ dialectName }: { dialectName: string }) {
  const theme = useTheme();
  const t = useT();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 56, marginBottom: 20 }}>✨</Text>
      <Text style={{ fontSize: 22, fontWeight: '900', color: theme.textPrimary, textAlign: 'center' }}>
        {t('onb.generating', { dialect: dialectName })}
      </Text>
      <Text style={{ fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginTop: 8 }}>
        {t('onb.generatingSub')}
      </Text>
    </View>
  );
}
