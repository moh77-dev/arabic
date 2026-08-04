import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/lib/ThemeProvider';
import { useT } from '@/lib/i18n';
import { notify } from '@/lib/platformAlert';
import { purchasePackage, restorePurchases, tierFromCustomerInfo } from '@/lib/purchases';
import { useUserStore } from '@/stores/useUserStore';

const FEATURES = [
  'Unlimited AI conversations & tutor',
  'Advanced pronunciation analysis',
  'All premium AI characters & stories',
  'Offline lesson downloads',
  'Every dialect, fully unlocked',
];

const PLANS = [
  { id: 'lahja_premium_monthly', label: 'Monthly', price: '$9.99/mo', tag: null },
  { id: 'lahja_premium_annual', label: 'Annual', price: '$59.99/yr', tag: 'Best value — save 50%' },
  { id: 'lahja_family_annual', label: 'Family (up to 6)', price: '$99.99/yr', tag: null },
];

export default function Paywall() {
  const theme = useTheme();
  const t = useT();
  const [selected, setSelected] = useState(PLANS[1].id);
  const [loading, setLoading] = useState(false);
  const setSubscription = useUserStore((s) => s.setSubscription);

  const purchase = async () => {
    setLoading(true);
    try {
      const info = await purchasePackage(selected);
      if (info) {
        const tier = tierFromCustomerInfo(info);
        setSubscription(tier, null);
        notify('Welcome to Premium!', 'Unlimited AI, every dialect unlocked. Enjoy!');
        router.back();
      }
    } catch {
      notify('Purchases unavailable', 'RevenueCat is not configured in this build yet. See .env.example.');
    } finally {
      setLoading(false);
    }
  };

  const restore = async () => {
    setLoading(true);
    try {
      const info = await restorePurchases();
      if (info) {
        setSubscription(tierFromCustomerInfo(info), null);
        notify('Restored', 'Your purchases have been restored.');
      }
    } catch {
      notify('Nothing to restore', 'No RevenueCat purchases were found for this account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenContainer>
        <Text style={{ fontSize: 40, textAlign: 'center' }}>🚀</Text>
        <Text style={{ fontSize: 28, fontWeight: '900', color: theme.textPrimary, textAlign: 'center', marginTop: 12 }}>
          Lisan Premium
        </Text>
        <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 6 }}>
          Unlock the full power of your private AI tutor.
        </Text>

        <View style={{ marginTop: 24, gap: 8 }}>
          {FEATURES.map((f) => (
            <View key={f} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Text style={{ color: theme.primary }}>✓</Text>
              <Text style={{ color: theme.textPrimary, flex: 1 }}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 24, gap: 10 }}>
          {PLANS.map((p) => (
            <AnimatedPressable key={p.id} onPress={() => setSelected(p.id)}>
              <Card style={{ borderColor: selected === p.id ? theme.primary : theme.border, borderWidth: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{p.label}</Text>
                    {p.tag ? <Text style={{ color: theme.accentGold, fontSize: 12, fontWeight: '700' }}>{p.tag}</Text> : null}
                  </View>
                  <Text style={{ color: theme.textPrimary, fontWeight: '900' }}>{p.price}</Text>
                </View>
              </Card>
            </AnimatedPressable>
          ))}
        </View>

        <View style={{ marginTop: 24 }}>
          <Button label="Continue" onPress={purchase} loading={loading} variant="gold" />
        </View>
        <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
          <AnimatedPressable onPress={restore} withHaptic={false}>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{t('paywall.restore')}</Text>
          </AnimatedPressable>
          <AnimatedPressable onPress={() => router.back()} withHaptic={false}>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{t('paywall.notNow')}</Text>
          </AnimatedPressable>
        </View>
      </ScreenContainer>
    </>
  );
}
