// src/services/notifications.service.ts

import { getSupabaseClient } from '@/lib/supabase';
import { sendNotificationEmail } from '@/lib/email';

// ============================================
// TIPOS DE NOTIFICACIÓN (32 tipos)
// ============================================

export type NotificationType =
  // Usuario (7)
  | 'welcome'
  | 'new_follower'
  | 'daily_login'
  | 'login_streak'
  | 'level_up'
  | 'account_verified'
  | 'premium_activated'
  // Escenarios (8)
  | 'scenario_created'
  | 'scenario_stolen'
  | 'scenario_recovered'
  | 'prediction_won'
  | 'prediction_lost'
  | 'scenario_resolved'
  | 'scenario_expiring'
  | 'scenario_vote'
  // Tienda (5)
  | 'purchase'
  | 'item_used'
  | 'gift_received'
  | 'coins_received'
  | 'promo_code'
  // Logros (4)
  | 'achievement_unlocked'
  | 'medal_earned'
  | 'ranking_position'
  | 'win_streak'
  // Social (4)
  | 'comment_received'
  | 'like_received'
  | 'mention'
  | 'comment_reply'
  // Comunidades (4)
  | 'community_post'
  | 'community_like'
  | 'community_comment'
  | 'community_reply'
  // Reels y Streaming (3)
  | 'reel_like'
  | 'stream_like'
  | 'stream_started'
  // Chat (2)
  | 'message_received'
  | 'message_reaction'
  // Coleccionables (1)
  | 'collectible_purchased'
  // Comunidades extra (5)
  | 'community_new_member'
  | 'community_join_request'
  | 'community_request_approved'
  | 'community_request_rejected'
  | 'community_ownership_transferred'
  // Torneos (2)
  | 'tournament_joined'
  | 'tournament_registration'
  // Sistema (4)
  | 'system_announcement'
  | 'maintenance'
  | 'account_warning'
  | 'account_restored';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  image_url?: string | null;
  link_url?: string | null;
  data?: {
    scenario_id?: string;
    post_id?: string;
    user_id?: string;
    community_id?: string;
    conversation_id?: string;
    [key: string]: unknown;
  } | null;
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
  data?: {
    scenario_id?: string;
    user_id?: string;
    community_id?: string;
    conversation_id?: string;
    [key: string]: unknown;
  };
}

export const notificationsService = {
  // ============================================
  // OBTENER NOTIFICACIONES
  // ============================================

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
  // CREAR NOTIFICACIÓN BASE
  // ============================================

  async create(input: CreateNotificationInput): Promise<Notification | null> {
    const supabase = getSupabaseClient();

    const insertData = {
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      image_url: input.imageUrl || null,
      link_url: input.linkUrl || null,
      data: input.data || null,
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

    // ========================================
    // ENVIAR EMAIL SI EL USUARIO LO TIENE HABILITADO
    // ========================================
    try {
      // Obtener datos del usuario: email, username y preferencias de notificación
      const { data: userDataRaw } = await supabase
        .from('users')
        .select('email, username, display_name, notification_settings')
        .eq('id', input.userId)
        .single();

      const userData = userDataRaw as {
        email?: string;
        username?: string;
        display_name?: string;
        notification_settings?: Record<string, boolean>;
      } | null;

      if (userData?.email) {
        // Verificar si el usuario tiene habilitadas las notificaciones por email
        // notification_settings es un JSONB con la estructura de ConfigNotifications
        const settings = userData.notification_settings as {
          emailNotifications?: boolean;
          // Configuraciones específicas por tipo
          scenarioStolen?: boolean;
          scenarioWon?: boolean;
          scenarioLost?: boolean;
          newFollower?: boolean;
          comments?: boolean;
        } | null;

        // Por defecto, enviar emails si no hay configuración (opt-in por defecto)
        const emailEnabled = settings?.emailNotifications !== false;

        // Verificar configuración específica por tipo de notificación
        let typeEnabled = true;
        if (settings) {
          switch (input.type) {
            case 'scenario_stolen':
              typeEnabled = settings.scenarioStolen !== false;
              break;
            case 'prediction_won':
              typeEnabled = settings.scenarioWon !== false;
              break;
            case 'prediction_lost':
              typeEnabled = settings.scenarioLost !== false;
              break;
            case 'new_follower':
              typeEnabled = settings.newFollower !== false;
              break;
            case 'comment_received':
            case 'comment_reply':
              typeEnabled = settings.comments !== false;
              break;
          }
        }

        // Enviar email si ambas condiciones se cumplen
        if (emailEnabled && typeEnabled) {
          await sendNotificationEmail(userData.email, {
            type: input.type,
            title: input.title,
            message: input.message,
            username: userData.display_name || userData.username || 'Usuario',
            linkUrl: input.linkUrl,
            imageUrl: input.imageUrl,
          });
        }
      }
    } catch (emailError) {
      // No fallar la notificación si el email falla
      console.error('Error sending notification email:', emailError);
    }

    return data as Notification;
  },

  // ============================================
  // 👤 BLOQUE 1: USUARIO (7 notificaciones)
  // ============================================

  // 1. Bienvenida al registrarse
  async notifyWelcome(userId: string, username: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'welcome',
      title: '¡Bienvenido a Apocaliptyx! 🎉',
      message: `Hola @${username}, has recibido 1,000 AP Coins de regalo. ¡Comienza a predecir el futuro!`,
      linkUrl: '/dashboard',
    });
  },

  // 2. Nuevo seguidor
  async notifyNewFollower(userId: string, followerUsername: string, followerAvatar?: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'new_follower',
      title: 'Nuevo seguidor 👤',
      message: `@${followerUsername} comenzó a seguirte.`,
      imageUrl: followerAvatar,
      linkUrl: `/perfil/${followerUsername}`,
    });
  },

  // 3. Login diario (bonus)
  async notifyDailyLogin(userId: string, coinsReceived: number, currentStreak: number): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'daily_login',
      title: '¡Bonus Diario! 🎁',
      message: `Has recibido ${coinsReceived.toLocaleString()} AP Coins por iniciar sesión. Racha actual: ${currentStreak} días.`,
      linkUrl: '/dashboard',
    });
  },

  // 4. Racha de login
  async notifyLoginStreak(userId: string, streakDays: number, bonusCoins: number): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'login_streak',
      title: `¡Racha de ${streakDays} días! 🔥`,
      message: `¡Increíble! Has iniciado sesión ${streakDays} días seguidos. Bonus especial: +${bonusCoins.toLocaleString()} AP Coins.`,
      linkUrl: '/dashboard',
    });
  },

  // 5. Subir de nivel
  async notifyLevelUp(userId: string, newLevel: string, newLevelNumber: number): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'level_up',
      title: '¡Subiste de Nivel! ⬆️',
      message: `¡Felicidades! Has alcanzado el nivel ${newLevelNumber}: "${newLevel}". Sigue así, profeta.`,
      linkUrl: '/perfil',
    });
  },

  // 6. Cuenta verificada
  async notifyAccountVerified(userId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'account_verified',
      title: '¡Cuenta Verificada! ✓',
      message: 'Tu cuenta ha sido verificada exitosamente. Ahora tienes acceso a funciones exclusivas.',
      linkUrl: '/perfil',
    });
  },

  // 7. Premium activado
  async notifyPremiumActivated(userId: string, durationDays: number): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'premium_activated',
      title: '¡Eres Premium! 👑',
      message: `Tu suscripción Premium está activa por ${durationDays} días. Disfruta de beneficios exclusivos.`,
      linkUrl: '/perfil',
    });
  },

  // ============================================
  // 🎯 BLOQUE 2: ESCENARIOS (8 notificaciones)
  // ============================================

  // 8. Escenario creado
  async notifyScenarioCreated(userId: string, scenarioTitle: string, scenarioId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'scenario_created',
      title: '¡Escenario Creado! 📝',
      message: `Tu escenario "${scenarioTitle}" ha sido publicado. ¡Espera las predicciones!`,
      linkUrl: `/escenario/${scenarioId}`,
      data: { scenario_id: scenarioId },
    });
  },

  // 9. Escenario robado
  async notifyScenarioStolen(userId: string, scenarioTitle: string, thiefUsername: string, scenarioId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'scenario_stolen',
      title: '¡Te robaron un escenario! 😱',
      message: `@${thiefUsername} robó tu escenario "${scenarioTitle}". ¡Usa un escudo para protegerte!`,
      linkUrl: `/escenario/${scenarioId}`,
      data: { scenario_id: scenarioId },
    });
  },

  // 10. Escenario recuperado
  async notifyScenarioRecovered(userId: string, scenarioTitle: string, scenarioId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'scenario_recovered',
      title: '¡Escenario Recuperado! 🛡️',
      message: `Has recuperado el escenario "${scenarioTitle}". ¡Protégelo!`,
      linkUrl: `/escenario/${scenarioId}`,
      data: { scenario_id: scenarioId },
    });
  },

  // 11. Predicción ganada
  async notifyPredictionWon(userId: string, scenarioTitle: string, coinsWon: number, scenarioId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'prediction_won',
      title: '¡Predicción Correcta! 🏆',
      message: `Tu predicción en "${scenarioTitle}" fue correcta. Ganaste ${coinsWon.toLocaleString()} AP Coins.`,
      linkUrl: `/escenario/${scenarioId}`,
      data: { scenario_id: scenarioId },
    });
  },

  // 12. Predicción perdida
  async notifyPredictionLost(userId: string, scenarioTitle: string, coinsLost: number, scenarioId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'prediction_lost',
      title: 'Predicción Incorrecta 😔',
      message: `Tu predicción en "${scenarioTitle}" no se cumplió. Perdiste ${coinsLost.toLocaleString()} AP Coins. ¡Sigue intentando!`,
      linkUrl: `/escenario/${scenarioId}`,
      data: { scenario_id: scenarioId },
    });
  },

  // 13. Escenario resuelto
  async notifyScenarioResolved(userId: string, scenarioTitle: string, result: string, scenarioId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'scenario_resolved',
      title: 'Escenario Resuelto 📊',
      message: `El escenario "${scenarioTitle}" ha sido resuelto. Resultado: ${result}.`,
      linkUrl: `/escenario/${scenarioId}`,
      data: { scenario_id: scenarioId },
    });
  },

  // 14. Escenario expirando pronto
  async notifyScenarioExpiring(userId: string, scenarioTitle: string, hoursLeft: number, scenarioId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'scenario_expiring',
      title: '⏰ Escenario por Expirar',
      message: `Tu escenario "${scenarioTitle}" expira en ${hoursLeft} horas. ¡Asegúrate de resolverlo!`,
      linkUrl: `/escenario/${scenarioId}`,
      data: { scenario_id: scenarioId },
    });
  },

  // 15. Alguien votó en tu escenario
  async notifyScenarioVote(userId: string, voterUsername: string, scenarioTitle: string, vote: 'yes' | 'no', scenarioId: string): Promise<Notification | null> {
    const voteText = vote === 'yes' ? 'Sí' : 'No';
    return this.create({
      userId,
      type: 'scenario_vote',
      title: 'Nueva Predicción 🎯',
      message: `@${voterUsername} predijo "${voteText}" en tu escenario "${scenarioTitle}".`,
      linkUrl: `/escenario/${scenarioId}`,
      data: { scenario_id: scenarioId },
    });
  },

  // ============================================
  // 🛒 BLOQUE 3: TIENDA (5 notificaciones)
  // ============================================

  // 16. Compra realizada
  async notifyPurchase(userId: string, itemName: string, coinsSpent: number): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'purchase',
      title: 'Compra Realizada 🛒',
      message: `Has comprado "${itemName}" por ${coinsSpent.toLocaleString()} AP Coins.`,
      linkUrl: '/inventario',
    });
  },

  // 17. Ítem usado
  async notifyItemUsed(userId: string, itemName: string, targetName?: string): Promise<Notification | null> {
    const targetText = targetName ? ` en "${targetName}"` : '';
    return this.create({
      userId,
      type: 'item_used',
      title: 'Ítem Utilizado ✨',
      message: `Has usado "${itemName}"${targetText}.`,
      linkUrl: '/inventario',
    });
  },

  // 18. Regalo recibido
  async notifyGiftReceived(userId: string, senderUsername: string, itemName: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'gift_received',
      title: '¡Recibiste un Regalo! 🎁',
      message: `@${senderUsername} te envió "${itemName}". ¡Revisa tu inventario!`,
      linkUrl: '/inventario',
    });
  },

  // 19. AP Coins recibidos
  async notifyCoinsReceived(userId: string, senderUsername: string, amount: number, reason?: string): Promise<Notification | null> {
    const reasonText = reason ? ` por: ${reason}` : '';
    return this.create({
      userId,
      type: 'coins_received',
      title: '¡Recibiste AP Coins! 💰',
      message: `@${senderUsername} te envió ${amount.toLocaleString()} AP Coins${reasonText}.`,
      linkUrl: '/dashboard',
    });
  },

  // 20. Código promocional canjeado
  async notifyPromoCode(userId: string, codeName: string, reward: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'promo_code',
      title: '¡Código Canjeado! 🎟️',
      message: `El código "${codeName}" fue canjeado exitosamente. Recibiste: ${reward}.`,
      linkUrl: '/dashboard',
    });
  },

  // ============================================
  // 🏆 BLOQUE 4: LOGROS (4 notificaciones)
  // ============================================

  // 21. Logro desbloqueado
  async notifyAchievementUnlocked(userId: string, achievementName: string, achievementIcon: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'achievement_unlocked',
      title: '¡Logro Desbloqueado! 🏅',
      message: `Has desbloqueado el logro "${achievementName}" ${achievementIcon}`,
      linkUrl: '/perfil/logros',
    });
  },

  // 22. Medalla obtenida
  async notifyMedalEarned(userId: string, medalType: 'gold' | 'silver' | 'bronze', categoryName: string): Promise<Notification | null> {
    const medals = { gold: '🥇 Oro', silver: '🥈 Plata', bronze: '🥉 Bronce' };
    return this.create({
      userId,
      type: 'medal_earned',
      title: `¡Medalla de ${medals[medalType]}!`,
      message: `Has obtenido la medalla de ${medals[medalType]} en la categoría "${categoryName}".`,
      linkUrl: '/perfil/logros',
    });
  },

  // 23. Posición en ranking
  async notifyRankingPosition(userId: string, position: number, previousPosition: number): Promise<Notification | null> {
    const improved = position < previousPosition;
    const emoji = position <= 3 ? '🏆' : position <= 10 ? '⭐' : '📈';
    return this.create({
      userId,
      type: 'ranking_position',
      title: `${emoji} ¡Top ${position} en el Ranking!`,
      message: improved 
        ? `¡Subiste al puesto #${position}! Antes estabas en #${previousPosition}.`
        : `Te mantienes en el puesto #${position} del ranking global.`,
      linkUrl: '/leaderboard',
    });
  },

  // 24. Racha de victorias
  async notifyWinStreak(userId: string, streakCount: number, bonusCoins: number): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'win_streak',
      title: `¡Racha de ${streakCount} Victorias! 🔥`,
      message: `¡Increíble! ${streakCount} predicciones correctas seguidas. Bonus: +${bonusCoins.toLocaleString()} AP Coins.`,
      linkUrl: '/perfil/historial',
    });
  },

  // ============================================
  // 💬 BLOQUE 5: SOCIAL (4 notificaciones)
  // ============================================

  // 25. Comentario recibido
  async notifyCommentReceived(userId: string, commenterUsername: string, postTitle: string, postId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'comment_received',
      title: 'Nuevo Comentario 💬',
      message: `@${commenterUsername} comentó en tu publicación "${postTitle}".`,
      linkUrl: `/foro/post/${postId}`,
    });
  },

  // 26. Like recibido
  async notifyLikeReceived(userId: string, likerUsername: string, postTitle: string, postId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'like_received',
      title: 'Nuevo Like ❤️',
      message: `A @${likerUsername} le gustó tu publicación "${postTitle}".`,
      linkUrl: `/foro/post/${postId}`,
    });
  },

  // 27. Mención
  async notifyMention(userId: string, mentionerUsername: string, context: string, linkUrl: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'mention',
      title: 'Te Mencionaron 📢',
      message: `@${mentionerUsername} te mencionó en ${context}.`,
      linkUrl,
    });
  },

  // 28. Respuesta a comentario
  async notifyCommentReply(userId: string, replierUsername: string, postId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'comment_reply',
      title: 'Nueva Respuesta 💬',
      message: `@${replierUsername} respondió a tu comentario.`,
      linkUrl: `/foro/post/${postId}`,
    });
  },

  // ============================================
  // 🔔 BLOQUE 6: SISTEMA (4 notificaciones)
  // ============================================

  // 29. Anuncio del sistema
  async notifySystemAnnouncement(userId: string, title: string, message: string, linkUrl?: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'system_announcement',
      title: `📢 ${title}`,
      message,
      linkUrl: linkUrl || '/anuncios',
    });
  },

  // 30. Mantenimiento programado
  async notifyMaintenance(userId: string, startTime: string, duration: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'maintenance',
      title: '🔧 Mantenimiento Programado',
      message: `Habrá mantenimiento el ${startTime}. Duración estimada: ${duration}. Guarda tu progreso.`,
      linkUrl: '/anuncios',
    });
  },

  // 31. Advertencia de cuenta
  async notifyAccountWarning(userId: string, reason: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'account_warning',
      title: '⚠️ Advertencia de Cuenta',
      message: `Tu cuenta ha recibido una advertencia: ${reason}. Por favor, revisa las reglas de la comunidad.`,
      linkUrl: '/terminos',
    });
  },

  // 32. Cuenta restaurada
  async notifyAccountRestored(userId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'account_restored',
      title: '✅ Cuenta Restaurada',
      message: 'Tu cuenta ha sido restaurada y ya puedes usar todas las funciones normalmente.',
      linkUrl: '/dashboard',
    });
  },

  // ============================================
  // 🎬 BLOQUE 7: REELS Y STREAMING (2 notificaciones)
  // ============================================

  // 33. Like en un Reel
  async notifyReelLike(userId: string, likerUsername: string, likerAvatar: string | undefined, reelId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'reel_like',
      title: '❤️ Nuevo like en tu Reel',
      message: `A @${likerUsername} le gustó tu Reel.`,
      imageUrl: likerAvatar,
      linkUrl: `/reels/${reelId}`,
    });
  },

  // 34. Like en un Stream
  async notifyStreamLike(userId: string, likerUsername: string, likerAvatar: string | undefined, streamId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'stream_like',
      title: '❤️ Nuevo like en tu Stream',
      message: `A @${likerUsername} le gustó tu Stream en vivo.`,
      imageUrl: likerAvatar,
      linkUrl: `/streaming/${streamId}`,
    });
  },

  // 35. Notificar inicio de Stream en vivo a seguidores
  async notifyStreamStarted(
    followerIds: string[],
    streamerUsername: string,
    streamerAvatar: string | undefined,
    streamTitle: string,
    streamId: string
  ): Promise<number> {
    let successCount = 0;

    for (const followerId of followerIds) {
      const result = await this.create({
        userId: followerId,
        type: 'stream_started',
        title: '🔴 ¡En vivo ahora!',
        message: `@${streamerUsername} está transmitiendo: "${streamTitle}"`,
        imageUrl: streamerAvatar,
        linkUrl: `/streaming/live/${streamId}`,
      });
      if (result) successCount++;
    }

    return successCount;
  },

  // ============================================
  // 💬 BLOQUE 8: CHAT (2 notificaciones)
  // ============================================

  // 35. Mensaje recibido (ya existe en chat.service, este es para completitud)
  async notifyMessageReceived(userId: string, senderUsername: string, senderAvatar: string | undefined, conversationId: string, preview: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'message_received',
      title: `💬 Mensaje de @${senderUsername}`,
      message: preview.length > 50 ? preview.substring(0, 50) + '...' : preview,
      imageUrl: senderAvatar,
      linkUrl: `/mensajes?conv=${conversationId}`,
    });
  },

  // 36. Reacción a un mensaje
  async notifyMessageReaction(userId: string, reactorUsername: string, reactorAvatar: string | undefined, emoji: string, conversationId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'message_reaction',
      title: `${emoji} Reacción a tu mensaje`,
      message: `@${reactorUsername} reaccionó con ${emoji} a tu mensaje.`,
      imageUrl: reactorAvatar,
      linkUrl: `/mensajes?conv=${conversationId}`,
    });
  },

  // ============================================
  // 🎨 BLOQUE 9: COLECCIONABLES (1 notificación)
  // ============================================

  // 37. Compra de coleccionable
  async notifyCollectiblePurchased(userId: string, collectibleName: string, serialNumber: number, cost: number): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'collectible_purchased',
      title: '🎨 ¡Nuevo Coleccionable!',
      message: `Has adquirido "${collectibleName}" #${serialNumber} por ${cost.toLocaleString()} AP Coins.`,
      linkUrl: '/inventario/coleccionables',
    });
  },

  // ============================================
  // 👥 BLOQUE 10: COMUNIDADES EXTRA (1 notificación)
  // ============================================

  // 38. Nuevo miembro en comunidad (para admins)
  async notifyCommunityNewMember(userId: string, memberUsername: string, memberAvatar: string | undefined, communityName: string, communityId: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'community_new_member',
      title: '👥 Nuevo miembro',
      message: `@${memberUsername} se unió a tu comunidad "${communityName}".`,
      imageUrl: memberAvatar,
      linkUrl: `/comunidades/${communityId}`,
    });
  },

  // ============================================
  // 🏆 BLOQUE 11: TORNEOS (2 notificaciones)
  // ============================================

  // 39. Te uniste a un torneo
  async notifyTournamentJoined(userId: string, tournamentName: string, tournamentId: string, entryFee?: number): Promise<Notification | null> {
    const feeText = entryFee && entryFee > 0 ? ` Entry fee: ${entryFee.toLocaleString()} AP.` : '';
    return this.create({
      userId,
      type: 'tournament_joined',
      title: '🏆 ¡Inscrito en Torneo!',
      message: `Te has inscrito exitosamente en "${tournamentName}".${feeText}`,
      linkUrl: `/torneos/${tournamentId}`,
    });
  },

  // 40. Confirmación de registro en torneo
  async notifyTournamentRegistration(userId: string, tournamentName: string, tournamentId: string, startDate: string): Promise<Notification | null> {
    return this.create({
      userId,
      type: 'tournament_registration',
      title: '📋 Registro Confirmado',
      message: `Tu registro en "${tournamentName}" ha sido confirmado. Inicia: ${startDate}.`,
      linkUrl: `/torneos/${tournamentId}`,
    });
  },

  // ============================================
  // 📣 FUNCIONES MASIVAS (para admin)
  // ============================================

  // Enviar notificación a múltiples usuarios
  async notifyMultipleUsers(userIds: string[], type: NotificationType, title: string, message: string, linkUrl?: string): Promise<number> {
    let successCount = 0;
    
    for (const userId of userIds) {
      const result = await this.create({
        userId,
        type,
        title,
        message,
        linkUrl,
      });
      if (result) successCount++;
    }
    
    return successCount;
  },

  // Enviar anuncio a todos los usuarios (requiere lista de IDs)
  async broadcastAnnouncement(userIds: string[], title: string, message: string, linkUrl?: string): Promise<number> {
    return this.notifyMultipleUsers(userIds, 'system_announcement', `📢 ${title}`, message, linkUrl);
  },
};