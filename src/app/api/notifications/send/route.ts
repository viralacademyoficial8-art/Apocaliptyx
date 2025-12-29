// src/app/api/notifications/send/route.ts

import { NextRequest, NextResponse } from 'next/server';

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

interface NotificationPayload {
  type: 'all' | 'segment' | 'user';
  title: string;
  message: string;
  url?: string;
  // Para type: 'user'
  userId?: string;
  // Para type: 'segment'
  segment?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationPayload = await request.json();
    const { type, title, message, url, userId, segment } = body;

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      return NextResponse.json(
        { error: 'OneSignal not configured' },
        { status: 500 }
      );
    }

    let notificationBody: Record<string, unknown> = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title, es: title },
      contents: { en: message, es: message },
      url: url || 'https://apocaliptyx.vercel.app',
    };

    // Configurar destinatarios según el tipo
    switch (type) {
      case 'all':
        notificationBody.included_segments = ['All'];
        break;
      case 'segment':
        notificationBody.included_segments = [segment || 'All'];
        break;
      case 'user':
        if (!userId) {
          return NextResponse.json(
            { error: 'userId required for user notifications' },
            { status: 400 }
          );
        }
        notificationBody.include_external_user_ids = [userId];
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notificationBody),
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json(
        { error: 'Failed to send notification', details: data.errors },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}