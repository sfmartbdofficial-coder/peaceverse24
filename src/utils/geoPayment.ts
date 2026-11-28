import { useEffect, useState, useCallback } from 'react';

export type PaymentRegion = 'BD' | 'INTL';

export interface GeoPaymentInfo {
  region: PaymentRegion;
  countryCode: string;
  countryName: string;
  currency: 'BDT' | 'USD';
  source: 'server' | 'timezone' | 'override';
}

const GEO_OVERRIDE_KEY = 'peaceverse_payment_region_override';

export function getSavedRegionOverride(): PaymentRegion | null {
  try {
    const val = localStorage.getItem(GEO_OVERRIDE_KEY);
    if (val === 'BD' || val === 'INTL') return val;
  } catch {}
  return null;
}

export function setSavedRegionOverride(region: PaymentRegion | null): void {
  try {
    if (!region) {
      localStorage.removeItem(GEO_OVERRIDE_KEY);
    } else {
      localStorage.setItem(GEO_OVERRIDE_KEY, region);
    }
  } catch {}
}

export function detectRegionFromTimezoneFallback(): GeoPaymentInfo {
  const override = getSavedRegionOverride();
  if (override) {
    return override === 'BD'
      ? { region: 'BD', countryCode: 'BD', countryName: 'Bangladesh', currency: 'BDT', source: 'override' }
      : { region: 'INTL', countryCode: 'US', countryName: 'International', currency: 'USD', source: 'override' };
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = (navigator.language || '').toLowerCase();
    if (tz.includes('Dhaka') || lang === 'bn-bd') {
      return {
        region: 'BD',
        countryCode: 'BD',
        countryName: 'Bangladesh',
        currency: 'BDT',
        source: 'timezone',
      };
    }
  } catch {}

  return {
    region: 'INTL',
    countryCode: 'GLOBAL',
    countryName: 'International',
    currency: 'USD',
    source: 'timezone',
  };
}

export async function detectGeoPaymentRegion(): Promise<GeoPaymentInfo> {
  const override = getSavedRegionOverride();
  if (override) {
    return detectRegionFromTimezoneFallback();
  }

  try {
    const res = await fetch('/api/geo', { cache: 'no-store' });
    if (res.ok) {
      const json: any = await res.json().catch(() => null);
      if (json && json.ok && typeof json.countryCode === 'string') {
        const cc = json.countryCode.toUpperCase();
        const isBD = cc === 'BD' || Boolean(json.isBangladesh);
        if (cc !== 'UNKNOWN') {
          return {
            region: isBD ? 'BD' : 'INTL',
            countryCode: cc,
            countryName: isBD ? 'Bangladesh' : json.countryName || cc,
            currency: isBD ? 'BDT' : 'USD',
            source: 'server',
          };
        }
      }
    }
  } catch {}

  return detectRegionFromTimezoneFallback();
}

export interface BuyMethodOption {
  id: 'bkash' | 'nagad' | 'google_play' | 'apple_pay' | 'visa_mastercard';
  label: string;
  labelBn: string;
  region: PaymentRegion;
  badge: string;
}

export const BUY_PAYMENT_METHODS: BuyMethodOption[] = [
  { id: 'bkash', label: 'bKash', labelBn: 'বিকাশ', region: 'BD', badge: 'BDT ৳' },
  { id: 'nagad', label: 'Nagad', labelBn: 'নগদ', region: 'BD', badge: 'BDT ৳' },
  { id: 'google_play', label: 'Google Play Billing', labelBn: 'Google Play', region: 'INTL', badge: 'USD $' },
  { id: 'apple_pay', label: 'Apple Pay', labelBn: 'Apple Pay', region: 'INTL', badge: 'USD $' },
  { id: 'visa_mastercard', label: 'Visa / Mastercard', labelBn: 'Visa / Mastercard', region: 'INTL', badge: 'USD $' },
];

export function getPaymentMethodsForRegion(region: PaymentRegion): BuyMethodOption[] {
  return BUY_PAYMENT_METHODS.filter((m) => m.region === region);
}

export function useGeoPayment() {
  const [info, setInfo] = useState<GeoPaymentInfo>(() =>
    detectRegionFromTimezoneFallback()
  );

  useEffect(() => {
    let active = true;
    detectGeoPaymentRegion().then((detected) => {
      if (active) setInfo(detected);
    });
    return () => {
      active = false;
    };
  }, []);

  const setManualRegion = useCallback((region: PaymentRegion) => {
    setSavedRegionOverride(region);
    setInfo(
      region === 'BD'
        ? {
            region: 'BD',
            countryCode: 'BD',
            countryName: 'Bangladesh',
            currency: 'BDT',
            source: 'override',
          }
        : {
            region: 'INTL',
            countryCode: 'GLOBAL',
            countryName: 'International',
            currency: 'USD',
            source: 'override',
          }
    );
  }, []);

  return {
    ...info,
    setManualRegion,
  };
}

