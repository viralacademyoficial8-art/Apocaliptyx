// src/app/api/admin/newsletter/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const supabase = () => getSupabaseAdmin();

// Check if user is admin
async function isAdmin(email: string): Promise<boolean> {
  const { data } = await supabase()
    .from('users')
    .select('role')
    .eq('email', email)
    .single();

  return data?.role && ['SUPER_ADMIN', 'ADMIN', 'STAFF'].includes(data.role);
}

// PATCH - Update subscriber status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active debe ser un booleano' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      is_active,
      updated_at: new Date().toISOString(),
    };

    // If deactivating, set unsubscribed_at
    if (!is_active) {
      updateData.unsubscribed_at = new Date().toISOString();
    } else {
      updateData.unsubscribed_at = null;
    }

    const { error } = await supabase()
      .from('newsletter_subscribers')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in PATCH /api/admin/newsletter/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remove subscriber
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { id } = await params;

    const { error } = await supabase()
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in DELETE /api/admin/newsletter/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
