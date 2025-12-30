// src/lib/onesignal.ts

import OneSignal from 'react-onesignal';

let initialized = false;

export async function initOneSignal() {
  if (initialized) return;
  if (typeof window === 'undefined') return;

  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || 'e8d7db97-26b0-4832-bc24-713132671228';
  
  if (!appId) {
    console.warn('OneSignal App ID not found');
    return;
  }

  try {
    await OneSignal.init({
      appId,
      allowLocalhostAsSecureOrigin: true,
    });

    initialized = true;
    console.log('OneSignal initialized successfully');
  } catch (error) {
    console.error('Error initializing OneSignal:', error);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const permission = await OneSignal.Notifications.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting permission:', error);
    return false;
  }
}

export async function isSubscribed(): Promise<boolean> {
  try {
    const optedIn = OneSignal.User.PushSubscription.optedIn;
    return optedIn ?? false;
  } catch {
    return false;
  }
}

export async function getPlayerId(): Promise<string | null> {
  try {
    const id = OneSignal.User.PushSubscription.id;
    return id ?? null;
  } catch {
    return null;
  }
}

export async function setExternalUserId(userId: string) {
  try {
    await OneSignal.login(userId);
  } catch (error) {
    console.error('Error setting external user ID:', error);
  }
}

export async function removeExternalUserId() {
  try {
    await OneSignal.logout();
  } catch (error) {
    console.error('Error removing external user ID:', error);
  }
}

export async function addTags(tags: Record<string, string>) {
  try {
    await OneSignal.User.addTags(tags);
  } catch (error) {
    console.error('Error adding tags:', error);
  }
}
