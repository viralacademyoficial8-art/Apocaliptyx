// src/services/pushNotifications.service.ts

import { getSupabaseBrowser } from '@/lib/supabase-client';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

class PushNotificationsService {
  private swRegistration: ServiceWorkerRegistration | null = null;

  // Verificar si el navegador soporta push notifications
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // Obtener el estado actual del permiso
  getPermissionState(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  // Registrar el Service Worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.log('Push notifications no soportadas');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', registration);
      this.swRegistration = registration;
      return registration;
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      return null;
    }
  }

  // Solicitar permiso de notificaciones
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('Permiso de notificaciones:', permission);
    return permission;
  }

  // Suscribirse a push notifications
  async subscribe(userId: string): Promise<boolean> {
    try {
      // 1. Registrar Service Worker si no está registrado
      if (!this.swRegistration) {
        this.swRegistration = await this.registerServiceWorker();
      }

      if (!this.swRegistration) {
        console.error('No se pudo registrar el Service Worker');
        return false;
      }

      // 2. Solicitar permiso
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.log('Permiso denegado');
        return false;
      }

      // 3. Obtener o crear suscripción push
      let subscription = await this.swRegistration.pushManager.getSubscription();

      if (!subscription) {
        // Convertir VAPID key a Uint8Array
        const applicationServerKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as BufferSource,
        });
      }

      console.log('Suscripción push:', subscription);

      // 4. Guardar suscripción en la base de datos
      const subscriptionJSON = subscription.toJSON();
      
      const { error } = await getSupabaseBrowser()
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscriptionJSON.endpoint,
          p256dh: subscriptionJSON.keys?.p256dh,
          auth: subscriptionJSON.keys?.auth,
        }, {
          onConflict: 'user_id,endpoint',
        });

      if (error) {
        console.error('Error guardando suscripción:', error);
        return false;
      }

      console.log('Suscripción guardada exitosamente');
      return true;
    } catch (error) {
      console.error('Error en subscribe:', error);
      return false;
    }
  }

  // Desuscribirse de push notifications
  async unsubscribe(userId: string): Promise<boolean> {
    try {
      if (!this.swRegistration) {
        this.swRegistration = await navigator.serviceWorker.ready;
      }

      const subscription = await this.swRegistration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Eliminar de la base de datos
        await getSupabaseBrowser()
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId)
          .eq('endpoint', subscription.endpoint);
      }

      return true;
    } catch (error) {
      console.error('Error en unsubscribe:', error);
      return false;
    }
  }

  // Verificar si el usuario está suscrito
  async isSubscribed(userId: string): Promise<boolean> {
    try {
      const { data } = await getSupabaseBrowser()
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      return (data && data.length > 0) || false;
    } catch (error) {
      return false;
    }
  }

  // Convertir VAPID key de base64 a Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Mostrar notificación local (para pruebas)
  showLocalNotification(title: string, options?: NotificationOptions): void {
    if (this.getPermissionState() === 'granted' && this.swRegistration) {
      this.swRegistration.showNotification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        ...options,
      });
    }
  }
}

export const pushNotificationsService = new PushNotificationsService();