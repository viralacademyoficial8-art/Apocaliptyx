// src/services/chat.service.ts

import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  created_at: string;
  // Joined data
  other_user?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    is_verified: boolean;
    is_premium: boolean;
  };
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // Joined data
  sender?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

class ChatService {
  private realtimeChannel: RealtimeChannel | null = null;

  // Obtener o crear conversación entre dos usuarios
  async getOrCreateConversation(userId1: string, userId2: string): Promise<Conversation | null> {
    // Ordenar IDs para consistencia
    const [p1, p2] = [userId1, userId2].sort();

    // Buscar conversación existente
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant_1.eq.${p1},participant_2.eq.${p2}),and(participant_1.eq.${p2},participant_2.eq.${p1})`)
      .single();

    if (existing) {
      return existing;
    }

    // Crear nueva conversación
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant_1: p1,
        participant_2: p2,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data;
  }

  // Obtener conversaciones de un usuario
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    // Enriquecer con datos del otro usuario y último mensaje
    const enrichedConversations = await Promise.all(
      data.map(async (conv) => {
        const otherUserId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;

        // Obtener datos del otro usuario
        const { data: otherUser } = await supabase
          .from('users')
          .select('id, username, display_name, avatar_url, is_verified, is_premium')
          .eq('id', otherUserId)
          .single();

        // Obtener último mensaje
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Contar mensajes no leídos
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', userId);

        return {
          ...conv,
          other_user: otherUser,
          last_message: lastMessage,
          unread_count: count || 0,
        };
      })
    );

    return enrichedConversations;
  }

  // Obtener mensajes de una conversación
  async getMessages(conversationId: string, limit = 50): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, username, display_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  }

  // Enviar mensaje
  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
        is_read: false,
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, username, display_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    // Actualizar last_message_at en la conversación
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  }

  // Marcar mensajes como leídos
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);
  }

  // Suscribirse a nuevos mensajes en tiempo real
  subscribeToMessages(
    conversationId: string,
    onNewMessage: (message: Message) => void
  ): () => void {
    this.realtimeChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Obtener mensaje con datos del sender
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users!messages_sender_id_fkey(id, username, display_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            onNewMessage(data);
          }
        }
      )
      .subscribe();

    // Retornar función para desuscribirse
    return () => {
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel);
        this.realtimeChannel = null;
      }
    };
  }

  // Suscribirse a nuevas conversaciones/mensajes para el usuario
  subscribeToUserConversations(
    userId: string,
    onUpdate: () => void
  ): () => void {
    const channel = supabase
      .channel(`user_conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Obtener conteo total de mensajes no leídos
  async getUnreadCount(userId: string): Promise<number> {
    // Obtener todas las conversaciones del usuario
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`);

    if (!conversations || conversations.length === 0) return 0;

    const conversationIds = conversations.map(c => c.id);

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .eq('is_read', false)
      .neq('sender_id', userId);

    return count || 0;
  }

  // Eliminar conversación
  async deleteConversation(conversationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    return !error;
  }
}

export const chatService = new ChatService();