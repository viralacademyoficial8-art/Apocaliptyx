import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  scenarioStolen: boolean;
  scenarioWon: boolean;
  scenarioLost: boolean;
  newFollower: boolean;
  comments: boolean;
  weeklyDigest: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  scenarioStolen: true,
  scenarioWon: true,
  scenarioLost: true,
  newFollower: true,
  comments: true,
  weeklyDigest: false,
};

// GET - Load notification settings for current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, notification_settings')
      .ilike('email', session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Return settings or defaults
    const settings = user.notification_settings || DEFAULT_SETTINGS;

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return NextResponse.json(
      { error: 'Error al cargar configuración' },
      { status: 500 }
    );
  }
}

// PUT - Save notification settings for current user
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    const body = await request.json();
    const settings: NotificationSettings = {
      emailNotifications: Boolean(body.emailNotifications),
      pushNotifications: Boolean(body.pushNotifications),
      scenarioStolen: Boolean(body.scenarioStolen),
      scenarioWon: Boolean(body.scenarioWon),
      scenarioLost: Boolean(body.scenarioLost),
      newFollower: Boolean(body.newFollower),
      comments: Boolean(body.comments),
      weeklyDigest: Boolean(body.weeklyDigest),
    };

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .ilike('email', session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Update notification settings
    const { error: updateError } = await supabase
      .from('users')
      .update({ notification_settings: settings })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating notification settings:', updateError);

      // If the column doesn't exist, return a helpful error
      if (updateError.message?.includes('notification_settings')) {
        return NextResponse.json(
          {
            error: 'La columna notification_settings no existe en la base de datos',
            sqlHint: "ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}'::jsonb;"
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Error al guardar configuración' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Preferencias guardadas correctamente',
      settings
    });
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return NextResponse.json(
      { error: 'Error al guardar configuración' },
      { status: 500 }
    );
  }
}
