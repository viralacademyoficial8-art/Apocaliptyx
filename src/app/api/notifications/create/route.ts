// src/app/api/notifications/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, imageUrl, linkUrl } = body;

    // Validaciones
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    
    const insertData = {
      user_id: userId,
      type,
      title,
      message,
      image_url: imageUrl || null,
      link_url: linkUrl || null,
      is_read: false,
    };
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in notification API:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}