// src/lib/notifications.ts

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: { action: string; title: string }[];
}

// Send a local notification
export async function sendLocalNotification(payload: NotificationPayload): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return false;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-96x96.png',
      tag: payload.tag || 'default',
      data: payload.data,
    });

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

// Subscribe to push notifications
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined') return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      return subscription;
    }

    // Create new subscription
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    
    if (!vapidPublicKey) {
      console.warn('VAPID public key not configured');
      return null;
    }

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey,
    });

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return false;
  }
}

// Notification types for Apocaliptyx
export const NotificationTypes = {
  SCENARIO_RESOLVED: 'scenario_resolved',
  SCENARIO_STOLEN: 'scenario_stolen',
  PREDICTION_WON: 'prediction_won',
  PREDICTION_LOST: 'prediction_lost',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  LEVEL_UP: 'level_up',
  NEW_FOLLOWER: 'new_follower',
  DAILY_BONUS: 'daily_bonus',
} as const;

// Create notification payload based on type
export function createNotificationPayload(
  type: keyof typeof NotificationTypes,
  data: Record<string, unknown>
): NotificationPayload {
  switch (type) {
    case 'SCENARIO_RESOLVED':
      return {
        title: '🎯 Escenario Resuelto',
        body: `El escenario "${data.title}" ha sido resuelto`,
        tag: 'scenario',
        data: { url: `/escenario/${data.id}` },
      };
    
    case 'SCENARIO_STOLEN':
      return {
        title: '😱 ¡Te robaron!',
        body: `${data.thief} robó tu escenario "${data.title}"`,
        tag: 'steal',
        data: { url: `/escenario/${data.id}` },
      };
    
    case 'PREDICTION_WON':
      return {
        title: '🎉 ¡Ganaste!',
        body: `Ganaste ${(data.amount as number)?.toLocaleString() || 0} AP en "${data.title}"`,
        tag: 'prediction',
        data: { url: '/perfil?tab=history' },
      };
    
    case 'PREDICTION_LOST':
      return {
        title: '😔 Predicción perdida',
        body: `Perdiste tu apuesta en "${data.title}"`,
        tag: 'prediction',
        data: { url: '/perfil?tab=history' },
      };
    
    case 'ACHIEVEMENT_UNLOCKED':
      return {
        title: '🏆 ¡Logro Desbloqueado!',
        body: `Has desbloqueado "${data.name}"`,
        tag: 'achievement',
        data: { url: '/perfil?tab=achievements' },
      };
    
    case 'LEVEL_UP':
      return {
        title: '⬆️ ¡Subiste de Nivel!',
        body: `Ahora eres nivel ${data.level}`,
        tag: 'level',
        data: { url: '/perfil' },
      };
    
    case 'NEW_FOLLOWER':
      return {
        title: '👤 Nuevo Seguidor',
        body: `${data.username} empezó a seguirte`,
        tag: 'social',
        data: { url: `/perfil/${data.username}` },
      };
    
    case 'DAILY_BONUS':
      return {
        title: '🎁 Bonus Diario',
        body: '¡Reclama tu bonus diario de AP Coins!',
        tag: 'bonus',
        data: { url: '/' },
      };
    
    default:
      return {
        title: 'Apocaliptyx',
        body: 'Tienes una nueva notificación',
        data: { url: '/' },
      };
  }
}