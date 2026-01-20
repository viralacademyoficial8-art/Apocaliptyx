import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin, getSupabaseClient } from '@/lib/supabase-server';

// DELETE - Delete current user's account
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { confirmText } = body;

    // Validate confirmation
    if (confirmText !== 'ELIMINAR') {
      return NextResponse.json(
        { error: 'Escribe ELIMINAR para confirmar' },
        { status: 400 }
      );
    }

    // Get user from database
    const { data: user, error: userError } = await getSupabaseClient()
      .from('users')
      .select('id, username')
      .ilike('email', session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const userId = user.id;

    // Delete user's related data in order (to avoid foreign key issues)
    // Note: Some tables might not exist, so we ignore errors for those

    // Delete notifications
    await getSupabaseClient()
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    // Delete forum comments
    await getSupabaseClient()
      .from('forum_comments')
      .delete()
      .eq('user_id', userId);

    // Delete forum posts
    await getSupabaseClient()
      .from('forum_posts')
      .delete()
      .eq('user_id', userId);

    // Delete followers/following relationships
    await getSupabaseClient()
      .from('followers')
      .delete()
      .or(`follower_id.eq.${userId},following_id.eq.${userId}`);

    // Delete scenarios created by user
    await getSupabaseClient()
      .from('scenarios')
      .delete()
      .eq('creator_id', userId);

    // Delete user's participations
    await getSupabaseClient()
      .from('scenario_participations')
      .delete()
      .eq('user_id', userId);

    // Delete user's collectibles
    await getSupabaseClient()
      .from('user_collectibles')
      .delete()
      .eq('user_id', userId);

    // Delete user's achievements
    await getSupabaseClient()
      .from('user_achievements')
      .delete()
      .eq('user_id', userId);

    // Finally, delete the user record from users table
    const { error: deleteUserError } = await getSupabaseClient()
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteUserError) {
      console.error('Error deleting user from database:', deleteUserError);
      return NextResponse.json(
        { error: 'Error al eliminar el usuario de la base de datos' },
        { status: 500 }
      );
    }

    // Delete user from Supabase Auth
    try {
      const { error: authDeleteError } = await getSupabaseAdmin().auth.admin.deleteUser(userId);
      if (authDeleteError) {
        console.error('Error deleting user from auth:', authDeleteError);
        // User is already deleted from database, so we don't fail here
      }
    } catch (authError) {
      console.error('Error deleting from Supabase Auth:', authError);
      // Continue anyway since DB record is deleted
    }

    console.log('Account deleted successfully for user:', user.username);

    return NextResponse.json({
      success: true,
      message: 'Cuenta eliminada correctamente'
    });
  } catch (error) {
    console.error('Error in delete-account:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
