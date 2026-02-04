// =====================================================
// API: Appeals
// Endpoints para gestionar apelaciones
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { appealsService } from '@/services/appeals.service';
import { createClient } from '@supabase/supabase-js';

// GET - Obtener apelaciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const userId = searchParams.get('userId');

    // Si se especifica userId, obtener solo las del usuario
    if (userId) {
      const appeals = await appealsService.getUserAppeals(userId);
      return NextResponse.json({ success: true, appeals });
    }

    // Si no, obtener todas (admin)
    const appeals = await appealsService.getAllAppeals(status);
    return NextResponse.json({ success: true, appeals });
  } catch (error) {
    console.error('Error fetching appeals:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching appeals' },
      { status: 500 }
    );
  }
}

// POST - Crear apelación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenarioId, userId, reason, evidenceUrls } = body;

    if (!scenarioId || !userId || !reason) {
      return NextResponse.json(
        { success: false, error: 'scenarioId, userId and reason are required' },
        { status: 400 }
      );
    }

    const result = await appealsService.create({
      scenarioId,
      userId,
      reason,
      evidenceUrls,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      appeal: result.appeal,
    });
  } catch (error) {
    console.error('Error creating appeal:', error);
    return NextResponse.json(
      { success: false, error: 'Error creating appeal' },
      { status: 500 }
    );
  }
}
