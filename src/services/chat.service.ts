// src/services/chat.service.ts
// Sistema de Chat Completo con Grupos, Favoritos, Reacciones y más

import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============================================
// TIPOS E INTERFACES
// ============================================

export type ConversationType = 'direct' | 'group';
export type ChatFilter = 'all' | 'unread' | 'favorites' | 'groups' | 'archived';

export interface Conversation {
  id: string;
  type: ConversationType;
  participant_1: string | null;
  participant_2: string | null;
  last_message_at: string;
  created_at: string;
  // Campos de grupo
  group_name?: string;
  group_avatar?: string;
  group_description?: string;
  created_by?: string;
  // Estado del usuario en esta conversación
  is_favorite?: boolean;
  is_archived?: boolean;
  is_muted?: boolean;
  // Datos adicionales
  other_user?: UserInfo;
  last_message?: Message;
  unread_count?: number;
  members?: GroupMember[];
  typing_users?: string[];
}

export interface UserInfo {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_verified?: boolean;
  is_premium?: boolean;
}

export interface GroupMember {
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  user?: UserInfo;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  is_deleted?: boolean;
  deleted_at?: string;
  created_at: string;
  // Archivos
  file_url?: string;
  file_type?: string;
  file_name?: string;
  // Respuestas
  reply_to_id?: string;
  reply_to?: Message;
  // Datos del sender
  sender?: UserInfo;
  // Reacciones
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: UserInfo;
}

export interface TypingUser {
  user_id: string;
  username: string;
  avatar_url?: string;
}

// ============================================
// CLASE PRINCIPAL DEL SERVICIO
// ============================================

class ChatService {
  private realtimeChannel: RealtimeChannel | null = null;
  private typingChannel: RealtimeChannel | null = null;
  private typingTimeout: NodeJS.Timeout | null = null;

  // ============================================
  // CONVERSACIONES DIRECTAS
  // ============================================

  async getOrCreateConversation(userId1: string, userId2: string): Promise<Conversation | null> {
    // Buscar conversación directa existente
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('type', 'direct')
      .or(`participant_1.eq.${userId1},participant_1.eq.${userId2}`)
      .or(`participant_2.eq.${userId1},participant_2.eq.${userId2}`);

    const conversation = existing?.find(conv =>
      (conv.participant_1 === userId1 && conv.participant_2 === userId2) ||
      (conv.participant_1 === userId2 && conv.participant_2 === userId1)
    );

    if (conversation) return conversation;

    // Crear nueva conversación
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        type: 'direct',
        participant_1: userId1,
        participant_2: userId2,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data;
  }

  // ============================================
  // OBTENER CONVERSACIONES CON FILTROS
  // ============================================

  async getConversations(userId: string, filter: ChatFilter = 'all'): Promise<Conversation[]> {
    // Obtener preferencias del usuario para las conversaciones
    const { data: userPrefs } = await supabase
      .from('conversation_preferences')
      .select('*')
      .eq('user_id', userId);

    const prefsMap = new Map(userPrefs?.map(p => [p.conversation_id, p]) || []);

    // Obtener conversaciones directas
    let query = supabase
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    const { data: directConvs, error } = await query;

    if (error || !directConvs) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    // Obtener conversaciones de grupo donde el usuario es miembro
    const { data: groupMemberships } = await supabase
      .from('group_members')
      .select('conversation_id')
      .eq('user_id', userId);

    let groupConvs: any[] = [];
    if (groupMemberships && groupMemberships.length > 0) {
      const groupIds = groupMemberships.map(g => g.conversation_id);
      const { data: groups } = await supabase
        .from('conversations')
        .select('*')
        .in('id', groupIds)
        .eq('type', 'group')
        .order('last_message_at', { ascending: false });

      groupConvs = groups || [];
    }

    // Combinar y ordenar
    const allConvs = [...directConvs, ...groupConvs].sort(
      (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );

    // Enriquecer conversaciones
    const enrichedConversations = await Promise.all(
      allConvs.map(async (conv) => {
        const prefs = prefsMap.get(conv.id) || {};

        // Aplicar filtros
        if (filter === 'favorites' && !prefs.is_favorite) return null;
        if (filter === 'archived' && !prefs.is_archived) return null;
        if (filter === 'groups' && conv.type !== 'group') return null;

        // Obtener datos adicionales
        let enriched: Conversation = {
          ...conv,
          is_favorite: prefs.is_favorite || false,
          is_archived: prefs.is_archived || false,
          is_muted: prefs.is_muted || false,
        };

        if (conv.type === 'direct') {
          const otherUserId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;
          const { data: otherUser } = await supabase
            .from('users')
            .select('id, username, display_name, avatar_url, is_verified, is_premium')
            .eq('id', otherUserId)
            .single();
          enriched.other_user = otherUser || undefined;
        } else {
          // Obtener miembros del grupo
          const { data: members } = await supabase
            .from('group_members')
            .select(`
              user_id, role, joined_at,
              user:users(id, username, display_name, avatar_url)
            `)
            .eq('conversation_id', conv.id);
          enriched.members = members?.map(m => ({
            ...m,
            user: m.user as unknown as UserInfo
          })) || [];
        }

        // Último mensaje
        const { data: lastMessages } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1);
        enriched.last_message = lastMessages?.[0] || undefined;

        // Contar no leídos
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', userId);
        enriched.unread_count = count || 0;

        // Filtrar no leídos
        if (filter === 'unread' && enriched.unread_count === 0) return null;

        // Excluir archivados del filtro 'all'
        if (filter === 'all' && prefs.is_archived) return null;

        return enriched;
      })
    );

    return enrichedConversations.filter(Boolean) as Conversation[];
  }

  // ============================================
  // GRUPOS
  // ============================================

  async createGroup(
    creatorId: string,
    name: string,
    memberIds: string[],
    description?: string,
    avatarUrl?: string
  ): Promise<Conversation | null> {
    // Crear conversación de tipo grupo
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({
        type: 'group',
        group_name: name,
        group_description: description || null,
        group_avatar: avatarUrl || null,
        created_by: creatorId,
      })
      .select()
      .single();

    if (convError || !conv) {
      console.error('Error creating group:', convError);
      return null;
    }

    // Agregar creador como admin
    const members = [
      { conversation_id: conv.id, user_id: creatorId, role: 'admin' },
      ...memberIds.map(id => ({ conversation_id: conv.id, user_id: id, role: 'member' }))
    ];

    const { error: membersError } = await supabase
      .from('group_members')
      .insert(members);

    if (membersError) {
      console.error('Error adding group members:', membersError);
      // Eliminar el grupo si falla agregar miembros
      await supabase.from('conversations').delete().eq('id', conv.id);
      return null;
    }

    // Enviar mensaje de sistema
    await this.sendSystemMessage(conv.id, `🎉 ${name} fue creado`);

    return conv;
  }

  async addGroupMember(conversationId: string, userId: string, addedBy: string): Promise<boolean> {
    // Verificar que quien agrega es admin o moderador
    const { data: adder } = await supabase
      .from('group_members')
      .select('role')
      .eq('conversation_id', conversationId)
      .eq('user_id', addedBy)
      .single();

    if (!adder || (adder.role !== 'admin' && adder.role !== 'moderator')) {
      return false;
    }

    const { error } = await supabase
      .from('group_members')
      .insert({ conversation_id: conversationId, user_id: userId, role: 'member' });

    if (error) {
      console.error('Error adding member:', error);
      return false;
    }

    // Obtener info del usuario para el mensaje
    const { data: userInfo } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', userId)
      .single();

    await this.sendSystemMessage(conversationId, `👋 ${userInfo?.display_name || 'Usuario'} se unió al grupo`);
    return true;
  }

  async removeGroupMember(conversationId: string, userId: string, removedBy: string): Promise<boolean> {
    // Verificar permisos
    const { data: remover } = await supabase
      .from('group_members')
      .select('role')
      .eq('conversation_id', conversationId)
      .eq('user_id', removedBy)
      .single();

    if (!remover || remover.role !== 'admin') {
      return false;
    }

    const { data: userInfo } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', userId)
      .single();

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) return false;

    await this.sendSystemMessage(conversationId, `👋 ${userInfo?.display_name || 'Usuario'} salió del grupo`);
    return true;
  }

  async leaveGroup(conversationId: string, userId: string): Promise<boolean> {
    const { data: userInfo } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', userId)
      .single();

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) return false;

    await this.sendSystemMessage(conversationId, `👋 ${userInfo?.display_name || 'Usuario'} salió del grupo`);
    return true;
  }

  async updateGroup(
    conversationId: string,
    userId: string,
    updates: { name?: string; description?: string; avatar?: string }
  ): Promise<boolean> {
    // Verificar que es admin
    const { data: member } = await supabase
      .from('group_members')
      .select('role')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (!member || member.role !== 'admin') return false;

    const updateData: any = {};
    if (updates.name) updateData.group_name = updates.name;
    if (updates.description !== undefined) updateData.group_description = updates.description;
    if (updates.avatar !== undefined) updateData.group_avatar = updates.avatar;

    const { error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId);

    return !error;
  }

  // ============================================
  // PREFERENCIAS DE CONVERSACIÓN
  // ============================================

  async toggleFavorite(conversationId: string, userId: string): Promise<boolean> {
    // Verificar si existe preferencia
    const { data: existing } = await supabase
      .from('conversation_preferences')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('conversation_preferences')
        .update({ is_favorite: !existing.is_favorite })
        .eq('id', existing.id);
      return !error;
    } else {
      const { error } = await supabase
        .from('conversation_preferences')
        .insert({ conversation_id: conversationId, user_id: userId, is_favorite: true });
      return !error;
    }
  }

  async toggleArchive(conversationId: string, userId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('conversation_preferences')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('conversation_preferences')
        .update({ is_archived: !existing.is_archived })
        .eq('id', existing.id);
      return !error;
    } else {
      const { error } = await supabase
        .from('conversation_preferences')
        .insert({ conversation_id: conversationId, user_id: userId, is_archived: true });
      return !error;
    }
  }

  async toggleMute(conversationId: string, userId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('conversation_preferences')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('conversation_preferences')
        .update({ is_muted: !existing.is_muted })
        .eq('id', existing.id);
      return !error;
    } else {
      const { error } = await supabase
        .from('conversation_preferences')
        .insert({ conversation_id: conversationId, user_id: userId, is_muted: true });
      return !error;
    }
  }

  // ============================================
  // MENSAJES
  // ============================================

  async getMessages(conversationId: string, limit = 50): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, username, display_name, avatar_url),
        reply_to:messages!messages_reply_to_id_fkey(id, content, sender_id, sender:users!messages_sender_id_fkey(username, display_name))
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    // Obtener reacciones
    const messageIds = data?.map(m => m.id) || [];
    if (messageIds.length > 0) {
      const { data: reactions } = await supabase
        .from('message_reactions')
        .select(`
          *,
          user:users(id, username, display_name, avatar_url)
        `)
        .in('message_id', messageIds);

      // Agregar reacciones a cada mensaje
      const reactionsMap = new Map<string, MessageReaction[]>();
      reactions?.forEach(r => {
        const existing = reactionsMap.get(r.message_id) || [];
        existing.push({
          ...r,
          user: r.user as unknown as UserInfo
        });
        reactionsMap.set(r.message_id, existing);
      });

      data?.forEach(m => {
        m.reactions = reactionsMap.get(m.id) || [];
      });
    }

    return data || [];
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    options?: {
      file?: { url: string; type: string; name: string };
      replyToId?: string;
    }
  ): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
        is_read: false,
        file_url: options?.file?.url || null,
        file_type: options?.file?.type || null,
        file_name: options?.file?.name || null,
        reply_to_id: options?.replyToId || null,
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

    // Actualizar last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Enviar notificaciones (excepto a usuarios que silenciaron el chat)
    await this.sendMessageNotifications(conversationId, senderId, content, options?.file);

    return data;
  }

  async sendSystemMessage(conversationId: string, content: string): Promise<void> {
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: null,
        content,
        is_read: true,
        is_system: true,
      });

    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);
  }

  private async sendMessageNotifications(
    conversationId: string,
    senderId: string,
    content: string,
    file?: { url: string; type: string; name: string }
  ): Promise<void> {
    try {
      const { data: conv } = await supabase
        .from('conversations')
        .select('type, participant_1, participant_2, group_name')
        .eq('id', conversationId)
        .single();

      if (!conv) return;

      const { data: senderInfo } = await supabase
        .from('users')
        .select('username, avatar_url')
        .eq('id', senderId)
        .single();

      let recipientIds: string[] = [];

      if (conv.type === 'direct') {
        const receiverId = conv.participant_1 === senderId ? conv.participant_2 : conv.participant_1;
        if (receiverId) recipientIds = [receiverId];
      } else {
        // Grupo: obtener todos los miembros excepto el sender
        const { data: members } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('conversation_id', conversationId)
          .neq('user_id', senderId);
        recipientIds = members?.map(m => m.user_id) || [];
      }

      // Filtrar usuarios que tienen silenciado el chat
      const { data: mutedPrefs } = await supabase
        .from('conversation_preferences')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .eq('is_muted', true)
        .in('user_id', recipientIds);

      const mutedUserIds = new Set(mutedPrefs?.map(p => p.user_id) || []);
      recipientIds = recipientIds.filter(id => !mutedUserIds.has(id));

      const messagePreview = content.length > 50 ? content.substring(0, 50) + '...' : content;
      const title = conv.type === 'group'
        ? `💬 ${conv.group_name}`
        : `💬 Mensaje de @${senderInfo?.username}`;

      // Insertar notificaciones
      const notifications = recipientIds.map(userId => ({
        user_id: userId,
        type: 'message_received',
        title,
        message: file ? '📎 Archivo adjunto' : messagePreview,
        image_url: senderInfo?.avatar_url,
        link_url: `/mensajes?conv=${conversationId}`,
        is_read: false,
      }));

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }
    } catch (error) {
      console.error('Error sending message notifications:', error);
    }
  }

  // ============================================
  // REACCIONES
  // ============================================

  async addReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
    // Verificar si ya existe esta reacción del usuario
    const { data: existing } = await supabase
      .from('message_reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
      .single();

    if (existing) {
      // Eliminar reacción existente (toggle)
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('id', existing.id);
      return !error;
    }

    const { error } = await supabase
      .from('message_reactions')
      .insert({ message_id: messageId, user_id: userId, emoji });

    return !error;
  }

  async getReactions(messageId: string): Promise<MessageReaction[]> {
    const { data } = await supabase
      .from('message_reactions')
      .select(`
        *,
        user:users(id, username, display_name, avatar_url)
      `)
      .eq('message_id', messageId);

    return data?.map(r => ({
      ...r,
      user: r.user as unknown as UserInfo
    })) || [];
  }

  // ============================================
  // TYPING INDICATOR
  // ============================================

  startTyping(conversationId: string, userId: string, username: string): void {
    const channel = supabase.channel(`typing:${conversationId}`);

    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: userId, username, is_typing: true }
    });

    // Auto-stop después de 3 segundos
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.stopTyping(conversationId, userId, username);
    }, 3000);
  }

  stopTyping(conversationId: string, userId: string, username: string): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }

    const channel = supabase.channel(`typing:${conversationId}`);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: userId, username, is_typing: false }
    });
  }

  subscribeToTyping(
    conversationId: string,
    onTypingChange: (typingUsers: TypingUser[]) => void
  ): () => void {
    const typingUsers = new Map<string, TypingUser>();
    const timeouts = new Map<string, NodeJS.Timeout>();

    this.typingChannel = supabase
      .channel(`typing:${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, username, is_typing } = payload.payload;

        if (is_typing) {
          typingUsers.set(user_id, { user_id, username });

          // Auto-remove después de 4 segundos si no hay actualización
          const existing = timeouts.get(user_id);
          if (existing) clearTimeout(existing);
          timeouts.set(user_id, setTimeout(() => {
            typingUsers.delete(user_id);
            onTypingChange(Array.from(typingUsers.values()));
          }, 4000));
        } else {
          typingUsers.delete(user_id);
          const existing = timeouts.get(user_id);
          if (existing) clearTimeout(existing);
        }

        onTypingChange(Array.from(typingUsers.values()));
      })
      .subscribe();

    return () => {
      if (this.typingChannel) {
        supabase.removeChannel(this.typingChannel);
        this.typingChannel = null;
      }
      timeouts.forEach(t => clearTimeout(t));
    };
  }

  // ============================================
  // UTILIDADES
  // ============================================

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);
  }

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

    return () => {
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel);
        this.realtimeChannel = null;
      }
    };
  }

  subscribeToUserConversations(userId: string, onUpdate: () => void): () => void {
    const channel = supabase
      .channel(`user_conversations:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => onUpdate()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`);

    if (!conversations?.length) return 0;

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversations.map(c => c.id))
      .eq('is_read', false)
      .neq('sender_id', userId);

    return count || 0;
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);
    return !error;
  }

  async uploadFile(file: File, senderId: string): Promise<{ url: string; type: string; name: string } | null> {
    if (file.size > 10 * 1024 * 1024) {
      console.error('File too large');
      return null;
    }

    let fileType = 'document';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type.startsWith('audio/')) fileType = 'audio';

    const fileExt = file.name.split('.').pop();
    const fileName = `${senderId}-${Date.now()}.${fileExt}`;

    try {
      const { error } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      const { data: urlData } = supabase.storage.from('chat-files').getPublicUrl(fileName);

      return { url: urlData.publicUrl, type: fileType, name: file.name };
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const { data: message } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (!message) return { success: false, error: 'Mensaje no encontrado' };
    if (message.sender_id !== userId) return { success: false, error: 'No puedes eliminar este mensaje' };

    const timeDiff = Date.now() - new Date(message.created_at).getTime();
    const timeLimit = 5 * 60 * 1000; // 5 minutos

    if (timeDiff > timeLimit) {
      return { success: false, error: 'Solo puedes eliminar mensajes dentro de los primeros 5 minutos' };
    }

    const { error } = await supabase
      .from('messages')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        content: 'Este mensaje fue eliminado',
        file_url: null, file_type: null, file_name: null,
      })
      .eq('id', messageId);

    return error ? { success: false, error: 'Error al eliminar' } : { success: true };
  }

  canDeleteMessage(message: Message, userId: string): { canDelete: boolean; timeLeft?: number } {
    if (message.sender_id !== userId || message.is_deleted) return { canDelete: false };

    const timeDiff = Date.now() - new Date(message.created_at).getTime();
    const timeLimit = 5 * 60 * 1000;

    if (timeDiff > timeLimit) return { canDelete: false };

    return { canDelete: true, timeLeft: Math.ceil((timeLimit - timeDiff) / 1000) };
  }

  // ============================================
  // BUSCAR EN CONVERSACIÓN
  // ============================================

  async searchMessages(conversationId: string, query: string): Promise<Message[]> {
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, username, display_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    return data || [];
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  async getChatStats(userId: string): Promise<{
    totalConversations: number;
    unreadMessages: number;
    favoriteChats: number;
    groupChats: number;
  }> {
    const conversations = await this.getConversations(userId, 'all');
    const favorites = conversations.filter(c => c.is_favorite).length;
    const groups = conversations.filter(c => c.type === 'group').length;
    const unread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

    return {
      totalConversations: conversations.length,
      unreadMessages: unread,
      favoriteChats: favorites,
      groupChats: groups,
    };
  }
}

export const chatService = new ChatService();
