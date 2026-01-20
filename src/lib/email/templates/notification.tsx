// src/lib/email/templates/notification.tsx

import { NotificationType } from '@/services/notifications.service';

// Mapeo de iconos por tipo de notificación
const NOTIFICATION_ICONS: Record<string, string> = {
  // Usuario
  welcome: '🎉',
  new_follower: '👤',
  daily_login: '🎁',
  login_streak: '🔥',
  level_up: '⬆️',
  account_verified: '✓',
  premium_activated: '👑',
  // Escenarios
  scenario_created: '📝',
  scenario_stolen: '😱',
  scenario_recovered: '🛡️',
  prediction_won: '🏆',
  prediction_lost: '😔',
  scenario_resolved: '📊',
  scenario_expiring: '⏰',
  scenario_vote: '🎯',
  // Tienda
  purchase: '🛒',
  item_used: '✨',
  gift_received: '🎁',
  coins_received: '💰',
  promo_code: '🎟️',
  // Logros
  achievement_unlocked: '🏅',
  medal_earned: '🥇',
  ranking_position: '📈',
  win_streak: '🔥',
  // Social
  comment_received: '💬',
  like_received: '❤️',
  mention: '📢',
  comment_reply: '💬',
  // Comunidades
  community_post: '📣',
  community_like: '❤️',
  community_comment: '💬',
  community_reply: '↩️',
  community_new_member: '👥',
  community_join_request: '🙋',
  community_request_approved: '✅',
  community_request_rejected: '❌',
  community_ownership_transferred: '👑',
  // Reels y Streaming
  reel_like: '❤️',
  stream_like: '❤️',
  stream_started: '🔴',
  // Chat
  message_received: '💬',
  message_reaction: '😊',
  // Coleccionables
  collectible_purchased: '🎨',
  // Torneos
  tournament_joined: '🏆',
  tournament_registration: '📋',
  // Sistema
  system_announcement: '📢',
  maintenance: '🔧',
  account_warning: '⚠️',
  account_restored: '✅',
};

// Colores por categoría
const NOTIFICATION_COLORS: Record<string, { primary: string; gradient: string }> = {
  // Escenarios - Rojo
  scenario_stolen: { primary: '#ef4444', gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' },
  scenario_recovered: { primary: '#22c55e', gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' },
  prediction_won: { primary: '#22c55e', gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' },
  prediction_lost: { primary: '#6b7280', gradient: 'linear-gradient(135deg, #4b5563 0%, #6b7280 100%)' },
  // Social - Púrpura
  new_follower: { primary: '#a855f7', gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' },
  comment_received: { primary: '#3b82f6', gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' },
  like_received: { primary: '#ef4444', gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' },
  // Tienda - Amarillo
  purchase: { primary: '#eab308', gradient: 'linear-gradient(135deg, #ca8a04 0%, #eab308 100%)' },
  coins_received: { primary: '#eab308', gradient: 'linear-gradient(135deg, #ca8a04 0%, #eab308 100%)' },
  // Default - Púrpura
  default: { primary: '#a855f7', gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' },
};

export interface NotificationEmailData {
  type: NotificationType;
  title: string;
  message: string;
  username: string;
  linkUrl?: string;
  imageUrl?: string;
}

export function getNotificationEmailHtml(data: NotificationEmailData) {
  const icon = NOTIFICATION_ICONS[data.type] || '🔔';
  const colors = NOTIFICATION_COLORS[data.type] || NOTIFICATION_COLORS.default;
  const actionUrl = data.linkUrl
    ? `https://apocaliptyx.vercel.app${data.linkUrl}`
    : 'https://apocaliptyx.vercel.app/notificaciones';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #ef4444; font-size: 28px; margin: 0;">
        🔮 APOCALIPTYX
      </h1>
    </div>

    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, #1f1f1f 0%, #171717 100%); border-radius: 16px; padding: 32px; border: 1px solid #374151;">

      <!-- Notification Icon -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 64px; height: 64px; line-height: 64px; font-size: 32px; background: ${colors.gradient}; border-radius: 50%;">
          ${icon}
        </div>
      </div>

      <!-- Title -->
      <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 16px 0; text-align: center;">
        ${data.title}
      </h2>

      <!-- Message -->
      <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
        ${data.message}
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 16px;">
        <a href="${actionUrl}"
           style="display: inline-block; background: ${colors.primary}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Ver detalles →
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
        Hola ${data.username}, recibiste esta notificación porque tienes las notificaciones por email activadas.
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
        <a href="https://apocaliptyx.vercel.app/configuracion" style="color: #9ca3af;">Gestionar preferencias de notificación</a>
      </p>
      <p style="color: #4b5563; font-size: 11px; margin: 16px 0 0 0;">
        © ${new Date().getFullYear()} Apocaliptyx. Todos los derechos reservados.
      </p>
    </div>

  </div>
</body>
</html>
  `;
}

export function getNotificationEmailText(data: NotificationEmailData) {
  const actionUrl = data.linkUrl
    ? `https://apocaliptyx.vercel.app${data.linkUrl}`
    : 'https://apocaliptyx.vercel.app/notificaciones';

  return `
${data.title}

${data.message}

Ver detalles: ${actionUrl}

---
Hola ${data.username}, recibiste esta notificación porque tienes las notificaciones por email activadas.
Gestionar preferencias: https://apocaliptyx.vercel.app/configuracion

© ${new Date().getFullYear()} Apocaliptyx
  `.trim();
}
