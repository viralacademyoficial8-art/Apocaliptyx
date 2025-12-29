// src/app/api/email/send/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendPredictionWonEmail,
  sendPurchaseReceiptEmail,
} from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, data } = body;

    if (!type || !to) {
      return NextResponse.json(
        { error: 'Missing required fields: type, to' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(to, data.username);
        break;

      case 'reset-password':
        result = await sendResetPasswordEmail(to, data.username, data.resetLink);
        break;

      case 'prediction-won':
        result = await sendPredictionWonEmail(to, data);
        break;

      case 'purchase-receipt':
        result = await sendPurchaseReceiptEmail(to, data);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}