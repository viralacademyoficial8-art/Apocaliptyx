import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const supabase = () => getSupabaseAdmin();

interface CookiePreferencesRow {
  id: string;
  user_id: string;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  consent_given_at: string;
  updated_at: string;
}

// GET /api/cookies/preferences - Get user's cookie preferences
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: prefsRaw, error } = await supabase()
      .from('user_cookie_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found, which is ok
      console.error('Error fetching cookie preferences:', error);
      return NextResponse.json(
        { error: 'Error al obtener preferencias' },
        { status: 500 }
      );
    }

    if (!prefsRaw) {
      // No preferences saved yet
      return NextResponse.json({
        hasPreferences: false,
        preferences: null,
      });
    }

    const prefs = prefsRaw as CookiePreferencesRow;

    return NextResponse.json({
      hasPreferences: true,
      preferences: {
        necessary: prefs.necessary,
        analytics: prefs.analytics,
        marketing: prefs.marketing,
        preferences: prefs.preferences,
      },
      consentGivenAt: prefs.consent_given_at,
      updatedAt: prefs.updated_at,
    });
  } catch (error) {
    console.error('Error in GET /api/cookies/preferences:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/cookies/preferences - Save user's cookie preferences
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { necessary, analytics, marketing, preferences } = body;

    // Get IP and user agent for audit purposes
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Use the upsert function
    const { data, error } = await (supabase().rpc as any)('upsert_cookie_preferences', {
      p_user_id: session.user.id,
      p_necessary: necessary ?? true,
      p_analytics: analytics ?? false,
      p_marketing: marketing ?? false,
      p_preferences: preferences ?? false,
      p_ip_address: ip,
      p_user_agent: userAgent,
    });

    if (error) {
      console.error('Error saving cookie preferences:', error);

      // Fallback: direct insert/update
      const { error: upsertError } = await supabase()
        .from('user_cookie_preferences')
        .upsert({
          user_id: session.user.id,
          necessary: necessary ?? true,
          analytics: analytics ?? false,
          marketing: marketing ?? false,
          preferences: preferences ?? false,
          ip_address: ip,
          user_agent: userAgent,
        } as never, {
          onConflict: 'user_id',
        });

      if (upsertError) {
        console.error('Fallback upsert error:', upsertError);
        return NextResponse.json(
          { error: 'Error al guardar preferencias' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Preferencias guardadas correctamente',
      preferences: {
        necessary: necessary ?? true,
        analytics: analytics ?? false,
        marketing: marketing ?? false,
        preferences: preferences ?? false,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/cookies/preferences:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
