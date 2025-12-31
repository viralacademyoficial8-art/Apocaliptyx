// src/services/notifications.service.ts

import { getSupabaseClient } from '@/lib/supabase';

// Tipos de notificación
export type NotificationType = 
  | 'prediction_won'
  | 'prediction_lost'
  | 'scenario_resolved'
  | 'scenario_stolen'
  | 'scenario_recovered'
  | 'new_follower'
  | 'achievement_unlocked'
  | 'welcome'
  | 'purchase'
  | 'bonus'
  | 'daily_login'
  | 'level_up'
  | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  image_url?: string | null;
  link_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  imageUrl?: string;
  linkUrl?: string;
}

export const notificationsService = {
  // ============================================
  // OBTENER NOTIFICACIONES
  // ============================================

  // Obtener notificaciones del usuario
  async getByUserId(userId: string, limit = 20): Promise<Notification[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return (data as Notification[]) || [];
  },

  // Obtener notificaciones no leídas
  async getUnread(userId: string): Promise<Notification[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
    return (data as Notification[]) || [];
  },

  // Contar notificaciones no leídas
  async countUnread(userId: string): Promise<number> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error counting notifications:', error);
      return 0;
    }
    return data?.length || 0;
  },

  // ============================================
  // MARCAR COMO LEÍDA
  // ============================================

  // Marcar como leída
  async markAsRead(notificationId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true } as never)
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
    return true;
  },

  // Marcar todas como leídas
  async markAllAsRead(userId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true } as never)
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
    return true;
  },

  // ============================================
  // ELIMINAR
  // ============================================

  // Eliminar notificación
  async delete(notificationId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
    return true;
  },

  // Eliminar todas las notificaciones de un usuario
  async deleteAll(userId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting all notifications:', error);
      return false;
    }
    return true;
  },

  // ============================================
  // CREAR NOTIFICACIONES
  // ============================================

  // Crear notificación genérica
  async create(input: CreateNotificationInput): Promise<Notification | null> {
    const supabase = getSupabaseClient();
    
    const insertData = {
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      image_url: input.imageUrl || null,
      link_url: input.linkUrl || null,
      is_read: false,
    };
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }
    return data as Notification;
  },

  // ============================================
  // NOTIFICACIONES ESPECÍFICAS (HELPERS)
  // ============================================

  // Bienvenida al registrarse
  async notifyWelcome(userId: string, username: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'welcome',
      title: '¡Bienvenido a Apocaliptics! 🎉',
      message: `Hola @${username}, has recibido 1,000 AP Coins de regalo. ¡Comienza a predecir el futuro!`,
      linkUrl: '/dashboard',
    });
  },

  // Nuevo seguidor
  async notifyNewFollower(userId: string, followerUsername: string, followerAvatar?: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'new_follower',
      title: 'Nuevo seguidor',
      message: `@${followerUsername} comenzó a seguirte.`,
      imageUrl: followerAvatar,
      linkUrl: `/perfil/${followerUsername}`,
    });
  },

  // Escenario robado (para el que pierde el escenario)
  async notifyScenarioStolen(
    userId: string, 
    scenarioTitle: string, 
    thiefUsername: string,
    scenarioId: string
  ): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'scenario_stolen',
      title: '¡Te robaron un escenario! 😱',
      message: `@${thiefUsername} robó tu escenario "${scenarioTitle}".`,
      linkUrl: `/escenario/${scenarioId}`,
    });
  },

  // Escenario recuperado
  async notifyScenarioRecovered(
    userId: string, 
    scenarioTitle: string,
    scenarioId: string
  ): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'scenario_recovered',
      title: '¡Escenario recuperado! 🛡️',
      message: `Has recuperado el escenario "${scenarioTitle}".`,
      linkUrl: `/escenario/${scenarioId}`,
    });
  },

  // Predicción ganada
  async notifyPredictionWon(
    userId: string, 
    scenarioTitle: string, 
    coinsWon: number,
    scenarioId: string
  ): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'prediction_won',
      title: '¡Predicción Ganada! 🏆',
      message: `Tu predicción "${scenarioTitle}" se cumplió. Ganaste ${coinsWon.toLocaleString()} AP Coins.`,
      linkUrl: `/escenario/${scenarioId}`,
    });
  },

  // Predicción perdida
  async notifyPredictionLost(
    userId: string, 
    scenarioTitle: string,
    scenarioId: string
  ): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'prediction_lost',
      title: 'Predicción Fallida 😔',
      message: `Tu predicción "${scenarioTitle}" no se cumplió. ¡Mejor suerte la próxima!`,
      linkUrl: `/escenario/${scenarioId}`,
    });
  },

  // Escenario resuelto
  async notifyScenarioResolved(
    userId: string, 
    scenarioTitle: string, 
    result: 'won' | 'lost',
    scenarioId: string
  ): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'scenario_resolved',
      title: 'Escenario Resuelto',
      message: `El escenario "${scenarioTitle}" ha sido resuelto. ${result === 'won' ? '¡Ganaste!' : 'No tuviste suerte esta vez.'}`,
      linkUrl: `/escenario/${scenarioId}`,
    });
  },

  // Bonus diario
  async notifyDailyBonus(userId: string, coinsReceived: number): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'daily_login',
      title: '¡Bonus Diario! 🎁',
      message: `Has recibido ${coinsReceived} AP Coins por iniciar sesión hoy.`,
      linkUrl: '/dashboard',
    });
  },

  // Compra realizada
  async notifyPurchase(
    userId: string, 
    itemName: string, 
    coinsSpent: number
  ): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'purchase',
      title: 'Compra Realizada 🛒',
      message: `Has comprado "${itemName}" por ${coinsSpent.toLocaleString()} AP Coins.`,
      linkUrl: '/tienda',
    });
  },

  // Subir de nivel
  async notifyLevelUp(userId: string, newLevel: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'level_up',
      title: '¡Subiste de Nivel! ⭐',
      message: `¡Felicidades! Has alcanzado el nivel "${newLevel}".`,
      linkUrl: '/perfil',
    });
  },

  // Logro desbloqueado
  async notifyAchievement(userId: string, achievementName: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'achievement_unlocked',
      title: '¡Logro Desbloqueado! 🏅',
      message: `Has desbloqueado el logro "${achievementName}".`,
      linkUrl: '/perfil/logros',
    });
  },

  // Notificación del sistema
  async notifySystem(userId: string, title: string, message: string, linkUrl?: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'system',
      title,
      message,
      linkUrl,
    });
  },
};