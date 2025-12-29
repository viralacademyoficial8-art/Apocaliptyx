// src/lib/onesignal.ts

import OneSignal from 'react-onesignal';

let initialized = false;

export async function initOneSignal() {
  if (initialized) return;
  if (typeof window === 'undefined') return;

  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  
  if (!appId) {
    console.warn('OneSignal App ID not found');
    return;
  }

  try {
    await OneSignal.init({
      appId,
      allowLocalhostAsSecureOrigin: true, // Para desarrollo
      notifyButton: {
        enable: false, // Usaremos nuestro propio botón
      },
      welcomeNotification: {
        title: '🔮 Apocaliptics',
        message: '¡Notificaciones activadas! Te avisaremos de predicciones importantes.',
      },
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
    return await OneSignal.User.PushSubscription.optedIn;
  } catch {
    return false;
  }
}

export async function getPlayerId(): Promise<string | null> {
  try {
    return await OneSignal.User.PushSubscription.id;
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

// Enviar notificación desde el servidor (usar en API routes)
export async function sendNotificationToUser(
  playerId: string,
  title: string,
  message: string,
  url?: string
) {
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      include_player_ids: [playerId],
      headings: { en: title },
      contents: { en: message },
      url: url || 'https://apocaliptyx.vercel.app',
    }),
  });

  return response.json();
}