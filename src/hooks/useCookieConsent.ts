'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

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
  const { data: session, status } = useSession();
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasSyncedRef = useRef(false);

  // Sync preferences to database for logged-in users
  const syncToDatabase = useCallback(async (prefs: CookiePreferences) => {
    if (!session?.user?.id || isSyncing) return;

    setIsSyncing(true);
    try {
      await fetch('/api/cookies/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
    } catch (error) {
      console.error('Error syncing cookie preferences:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [session?.user?.id, isSyncing]);

  // Load preferences from database for logged-in users
  const loadFromDatabase = useCallback(async () => {
    if (!session?.user?.id) return null;

    try {
      const response = await fetch('/api/cookies/preferences');
      const data = await response.json();

      if (data.hasPreferences && data.preferences) {
        return data.preferences as CookiePreferences;
      }
    } catch (error) {
      console.error('Error loading cookie preferences from database:', error);
    }
    return null;
  }, [session?.user?.id]);

  // Load consent state from localStorage (and database for logged-in users)
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);

      // First check localStorage
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

      let localPrefs: CookiePreferences | null = null;

      if (consent === 'true' && savedPreferences) {
        try {
          localPrefs = { ...defaultPreferences, ...JSON.parse(savedPreferences), necessary: true };
        } catch {
          localPrefs = null;
        }
      }

      // If user is logged in, try to load from database
      if (status === 'authenticated' && session?.user?.id && !hasSyncedRef.current) {
        hasSyncedRef.current = true;
        const dbPrefs = await loadFromDatabase();

        if (dbPrefs) {
          // Database preferences take priority
          setHasConsent(true);
          setPreferences(dbPrefs);
          setShowBanner(false);

          // Update localStorage to match database
          localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
          localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(dbPrefs));
        } else if (localPrefs) {
          // If we have local preferences but not in DB, sync to DB
          setHasConsent(true);
          setPreferences(localPrefs);
          setShowBanner(false);
          syncToDatabase(localPrefs);
        } else {
          // No preferences anywhere, show banner
          setHasConsent(null);
          setShowBanner(true);
        }
      } else if (status === 'unauthenticated' || status === 'loading') {
        // For non-logged-in users, use localStorage only
        if (consent === 'true' && localPrefs) {
          setHasConsent(true);
          setPreferences(localPrefs);
          setShowBanner(false);
        } else if (consent === 'false') {
          setHasConsent(false);
          setShowBanner(false);
          setPreferences(defaultPreferences);
        } else if (status !== 'loading') {
          // Only show banner if we're done loading auth state
          setHasConsent(null);
          setShowBanner(true);
        }
      }

      setIsLoading(false);
    };

    loadPreferences();
  }, [status, session?.user?.id, loadFromDatabase, syncToDatabase]);

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

    // Sync to database if logged in
    if (session?.user?.id) {
      syncToDatabase(allAccepted);
    }

    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: allAccepted }));
  }, [session?.user?.id, syncToDatabase]);

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

    // Sync to database if logged in
    if (session?.user?.id) {
      syncToDatabase(necessaryOnly);
    }

    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: necessaryOnly }));
  }, [session?.user?.id, syncToDatabase]);

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

    // Sync to database if logged in
    if (session?.user?.id) {
      syncToDatabase(updated);
    }

    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: updated }));
  }, [preferences, session?.user?.id, syncToDatabase]);

  // Reset consent (for testing or user request)
  const resetConsent = useCallback(async () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
    setHasConsent(null);
    setPreferences(defaultPreferences);
    setShowBanner(true);
    hasSyncedRef.current = false;

    // Also reset in database if logged in
    if (session?.user?.id) {
      syncToDatabase(defaultPreferences);
    }
  }, [session?.user?.id, syncToDatabase]);

  // Open settings modal
  const openSettings = useCallback(() => {
    setShowBanner(true);
  }, []);

  return {
    hasConsent,
    preferences,
    showBanner,
    isLoading,
    isSyncing,
    isLoggedIn: !!session?.user?.id,
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
