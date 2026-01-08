'use client';

import { useState, useEffect, useCallback } from 'react';

export type CookiePreferences = {
  necessary: boolean; // Siempre true - cookies esenciales
  analytics: boolean; // Google Analytics, etc.
  marketing: boolean; // Cookies de publicidad/marketing
  preferences: boolean; // Cookies de preferencias del usuario
};

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

export function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [showBanner, setShowBanner] = useState(false);

  // Load consent state from localStorage
  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (consent === 'true') {
      setHasConsent(true);
      setShowBanner(false);
      if (savedPreferences) {
        try {
          const parsed = JSON.parse(savedPreferences);
          setPreferences({ ...defaultPreferences, ...parsed, necessary: true });
        } catch {
          setPreferences(defaultPreferences);
        }
      }
    } else if (consent === 'false') {
      setHasConsent(false);
      setShowBanner(false);
      setPreferences(defaultPreferences);
    } else {
      // No consent decision yet
      setHasConsent(null);
      setShowBanner(true);
    }
  }, []);

  // Accept all cookies
  const acceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(allAccepted));
    setHasConsent(true);
    setPreferences(allAccepted);
    setShowBanner(false);

    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: allAccepted }));
  }, []);

  // Accept only necessary cookies
  const acceptNecessary = useCallback(() => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(necessaryOnly));
    setHasConsent(true);
    setPreferences(necessaryOnly);
    setShowBanner(false);

    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: necessaryOnly }));
  }, []);

  // Save custom preferences
  const savePreferences = useCallback((newPreferences: Partial<CookiePreferences>) => {
    const updated: CookiePreferences = {
      ...preferences,
      ...newPreferences,
      necessary: true, // Always keep necessary cookies
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(updated));
    setHasConsent(true);
    setPreferences(updated);
    setShowBanner(false);

    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: updated }));
  }, [preferences]);

  // Reset consent (for testing or user request)
  const resetConsent = useCallback(() => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
    setHasConsent(null);
    setPreferences(defaultPreferences);
    setShowBanner(true);
  }, []);

  // Open settings modal
  const openSettings = useCallback(() => {
    setShowBanner(true);
  }, []);

  return {
    hasConsent,
    preferences,
    showBanner,
    acceptAll,
    acceptNecessary,
    savePreferences,
    resetConsent,
    openSettings,
    setShowBanner,
  };
}

// Helper function to check if a specific cookie type is allowed
export function isCookieAllowed(type: keyof CookiePreferences): boolean {
  if (typeof window === 'undefined') return false;

  const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (!savedPreferences) return type === 'necessary';

  try {
    const preferences = JSON.parse(savedPreferences);
    return type === 'necessary' ? true : !!preferences[type];
  } catch {
    return type === 'necessary';
  }
}
