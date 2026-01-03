// src/services/presence.service.ts

import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type UserStatus = 'online' | 'away' | 'offline';

export interface UserPresence {
  userId: string;
  status: UserStatus;
  lastSeen: string;
}

class PresenceService {
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private activityTimeout: NodeJS.Timeout | null = null;
  private currentUserId: string | null = null;
  private isAway: boolean = false;
  private realtimeChannel: RealtimeChannel | null = null;

  // Iniciar tracking de presencia para el usuario actual
  async startTracking(userId: string): Promise<void> {
    this.currentUserId = userId;
    
    // Marcar como online inmediatamente
    await this.setOnline(userId);

    // Heartbeat cada 30 segundos para mantener el estado online
    this.heartbeatInterval = setInterval(() => {
      if (!this.isAway) {
        this.updateLastSeen(userId);
      }
    }, 30000);

    // Detectar inactividad (2 minutos sin actividad = away)
    this.setupActivityDetection();

    // Detectar cuando el usuario cierra la pestaña
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleBeforeUnload);
      window.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  // Detener tracking
  stopTracking(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
      this.activityTimeout = null;
    }

    if (this.currentUserId) {
      this.setOffline(this.currentUserId);
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
      window.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }

    this.currentUserId = null;
  }

  // Configurar detección de actividad
  private setupActivityDetection(): void {
    if (typeof window === 'undefined') return;

    const resetActivityTimer = () => {
      // Si estaba away, volver a online
      if (this.isAway && this.currentUserId) {
        this.isAway = false;
        this.setOnline(this.currentUserId);
      }

      // Reiniciar el timer de inactividad
      if (this.activityTimeout) {
        clearTimeout(this.activityTimeout);
      }

      // Después de 2 minutos de inactividad, marcar como away
      this.activityTimeout = setTimeout(() => {
        if (this.currentUserId) {
          this.isAway = true;
          this.setAway(this.currentUserId);
        }
      }, 2 * 60 * 1000); // 2 minutos
    };

    // Eventos que indican actividad
    ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach(event => {
      window.addEventListener(event, resetActivityTimer, { passive: true });
    });

    // Iniciar el timer
    resetActivityTimer();
  }

  // Handlers de eventos
  private handleBeforeUnload = (): void => {
    if (this.currentUserId) {
      // Usar sendBeacon para asegurar que se envía antes de cerrar
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${this.currentUserId}`;
      const data = JSON.stringify({ is_online: false, last_seen: new Date().toISOString() });
      
      navigator.sendBeacon(url, data);
    }
  };

  private handleVisibilityChange = (): void => {
    if (!this.currentUserId) return;

    if (document.hidden) {
      // Pestaña oculta - marcar como away después de un momento
      this.activityTimeout = setTimeout(() => {
        if (this.currentUserId) {
          this.isAway = true;
          this.setAway(this.currentUserId);
        }
      }, 30000); // 30 segundos
    } else {
      // Pestaña visible de nuevo - volver a online
      if (this.activityTimeout) {
        clearTimeout(this.activityTimeout);
      }
      this.isAway = false;
      this.setOnline(this.currentUserId);
    }
  };

  // Marcar usuario como online
  async setOnline(userId: string): Promise<void> {
    await supabase
      .from('users')
      .update({ 
        is_online: true, 
        last_seen: new Date().toISOString() 
      })
      .eq('id', userId);
  }

  // Marcar usuario como away (inactivo)
  async setAway(userId: string): Promise<void> {
    await supabase
      .from('users')
      .update({ 
        is_online: true, // Sigue "conectado" pero inactivo
        last_seen: new Date().toISOString() 
      })
      .eq('id', userId);
  }

  // Marcar usuario como offline
  async setOffline(userId: string): Promise<void> {
    await supabase
      .from('users')
      .update({ 
        is_online: false, 
        last_seen: new Date().toISOString() 
      })
      .eq('id', userId);
  }

  // Actualizar last_seen
  async updateLastSeen(userId: string): Promise<void> {
    await supabase
      .from('users')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', userId);
  }

  // Obtener estado de un usuario
  async getUserStatus(userId: string): Promise<UserPresence> {
    const { data } = await supabase
      .from('users')
      .select('id, is_online, last_seen')
      .eq('id', userId)
      .single();

    if (!data) {
      return { userId, status: 'offline', lastSeen: new Date().toISOString() };
    }

    const status = this.calculateStatus(data.is_online, data.last_seen);
    
    return {
      userId: data.id,
      status,
      lastSeen: data.last_seen,
    };
  }

  // Calcular estado basado en is_online y last_seen
  calculateStatus(isOnline: boolean, lastSeen: string): UserStatus {
    if (!isOnline) return 'offline';

    const lastSeenTime = new Date(lastSeen).getTime();
    const now = Date.now();
    const diff = now - lastSeenTime;

    // Si last_seen es hace más de 2 minutos, está away
    if (diff > 2 * 60 * 1000) {
      return 'away';
    }

    return 'online';
  }

  // Suscribirse a cambios de estado de un usuario
  subscribeToUserStatus(
    userId: string, 
    onStatusChange: (presence: UserPresence) => void
  ): () => void {
    const channel = supabase
      .channel(`presence:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const { is_online, last_seen } = payload.new as any;
          const status = this.calculateStatus(is_online, last_seen);
          onStatusChange({
            userId,
            status,
            lastSeen: last_seen,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Obtener texto de estado
  getStatusText(status: UserStatus, lastSeen?: string): string {
    switch (status) {
      case 'online':
        return 'En línea';
      case 'away':
        return 'Inactivo';
      case 'offline':
        if (lastSeen) {
          const diff = Date.now() - new Date(lastSeen).getTime();
          const minutes = Math.floor(diff / 60000);
          const hours = Math.floor(diff / 3600000);
          const days = Math.floor(diff / 86400000);

          if (minutes < 1) return 'Hace un momento';
          if (minutes < 60) return `Hace ${minutes} min`;
          if (hours < 24) return `Hace ${hours}h`;
          return `Hace ${days}d`;
        }
        return 'Desconectado';
      default:
        return 'Desconectado';
    }
  }

  // Obtener color de estado
  getStatusColor(status: UserStatus): string {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  }
}

export const presenceService = new PresenceService();