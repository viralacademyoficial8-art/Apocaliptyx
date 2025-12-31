// src/services/notifications.service.ts

import { getSupabaseClient } from '@/lib/supabase';

// Tipos de notificación
export type NotificationType = 
  | 'prediction_won'
  | 'prediction_lost'
  | 'scenario_resolved'
  | 'new_follower'
  | 'achievement_unlocked'
  | 'welcome'
  | 'purchase'
  | 'bonus'
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

export const notificationsService = {
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
};