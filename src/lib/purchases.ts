import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesOffering } from 'react-native-purchases';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

export const ENTITLEMENT_PREMIUM = 'premium';
export const ENTITLEMENT_FAMILY = 'family';

let configured = false;

/** Must run once, after the user is authenticated, before any other Purchases call. */
export function configurePurchases(appUserId: string) {
  const apiKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) {
    console.warn('[lahja] RevenueCat API key missing — Go Premium will be disabled until configured.');
    return;
  }
  if (configured) return;
  Purchases.configure({ apiKey, appUserID: appUserId });
  configured = true;
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(packageId: string): Promise<CustomerInfo | null> {
  if (!configured) throw new Error('RevenueCat not configured');
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages.find((p) => p.identifier === packageId);
  if (!pkg) throw new Error(`Package "${packageId}" not found in current offering`);
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  return Purchases.restorePurchases();
}

export function tierFromCustomerInfo(info: CustomerInfo): 'free' | 'premium' | 'family' {
  if (info.entitlements.active[ENTITLEMENT_FAMILY]) return 'family';
  if (info.entitlements.active[ENTITLEMENT_PREMIUM]) return 'premium';
  return 'free';
}
