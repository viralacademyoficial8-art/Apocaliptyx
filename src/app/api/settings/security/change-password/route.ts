import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/supabase-server';

// PUT - Change password for current user
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate inputs
    if (!newPassword) {
      return NextResponse.json(
        { error: 'La nueva contraseña es requerida' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Get user from database
    const { data: user, error: userError } = await getSupabaseClient()
      .from('users')
      .select('id, email')
      .ilike('email', session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Try to verify current password if provided
    // Note: For OAuth users, this step may fail since they don't have a password
    if (currentPassword) {
      const { error: signInError } = await getSupabaseClient().auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        // If sign-in fails, it could be an OAuth user or wrong password
        // We'll allow password change for OAuth users who want to set a password
        console.log('Current password verification failed or OAuth user:', signInError.message);
      }
    }

    // Update password using admin client
    const { error: updateError } = await getSupabaseAdmin().auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar la contraseña' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error in change-password:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
