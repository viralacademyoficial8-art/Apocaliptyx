// =====================================================
// API: Review Appeal
// Endpoint para que admins revisen apelaciones
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { appealsService } from '@/services/appeals.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appealId, reviewerId, status, notes, newResult } = body;

    if (!appealId || !reviewerId || !status || !notes) {
      return NextResponse.json(
        { success: false, error: 'appealId, reviewerId, status and notes are required' },
        { status: 400 }
      );
    }

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json(
        { success: false, error: 'status must be approved or rejected' },
        { status: 400 }
      );
    }

    if (status === 'approved' && !newResult) {
      return NextResponse.json(
        { success: false, error: 'newResult is required when approving' },
        { status: 400 }
      );
    }

    const result = await appealsService.review({
      appealId,
      reviewerId,
      status,
      notes,
      newResult,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Appeal ${status}`,
    });
  } catch (error) {
    console.error('Error reviewing appeal:', error);
    return NextResponse.json(
      { success: false, error: 'Error reviewing appeal' },
      { status: 500 }
    );
  }
}
