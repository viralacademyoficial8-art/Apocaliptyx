// src/app/api/push/send/route.ts

import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Configurar VAPID
webpush.setVapidDetails(
  'mailto:soporte@apocaliptics.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, message, url, icon, image } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'userId, title y message son requeridos' },
        { status: 400 }
      );
    }

    // Obtener suscripciones del usuario
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no tiene suscripciones push', sent: 0 },
        { status: 200 }
      );
    }

    const payload = JSON.stringify({
      title,
      body: message,
      icon: icon || '/icon-192x192.png',
      image,
      url: url || '/',
      tag: `notification-${Date.now()}`,
    });

    let sentCount = 0;
    const errors: string[] = [];

    // Enviar a todas las suscripciones del usuario
    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await webpush.sendNotification(pushSubscription, payload);
        sentCount++;
      } catch (pushError: any) {
        console.error('Error enviando push:', pushError);
        
        // Si la suscripción ya no es válida, eliminarla
        if (pushError.statusCode === 410 || pushError.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id);
        }
        
        errors.push(pushError.message);
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      total: subscriptions.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error en /api/push/send:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}