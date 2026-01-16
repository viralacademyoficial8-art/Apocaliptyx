import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Configuración de umbrales para auto-feature
const THRESHOLDS = {
  // Para marcar como HOT (trending)
  hot: {
    minSteals: 3,           // Mínimo de robos
    minParticipants: 5,     // Mínimo de participantes
    minPool: 100,           // Pool mínimo
    maxAge: 7,              // Máximo días de antigüedad para ser "hot"
  },
  // Para marcar como FEATURED (destacado)
  featured: {
    minSteals: 5,           // Mínimo de robos
    minParticipants: 10,    // Mínimo de participantes
    minPool: 500,           // Pool mínimo
  },
  // Límites
  maxHot: 10,               // Máximo de escenarios hot
  maxFeatured: 6,           // Máximo de escenarios destacados
};

export async function POST(request: Request) {
  try {
    // Verificar API key para seguridad (opcional)
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.AUTO_FEATURE_API_KEY;

    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      // Si hay API key configurada, validarla
      // Por ahora permitimos sin API key para facilitar pruebas
    }

    // Obtener todos los escenarios activos
    const { data: scenarios, error } = await supabase
      .from('scenarios')
      .select('id, title, steal_count, participant_count, total_pool, created_at, is_featured, is_hot')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scenarios:', error);
      return NextResponse.json({ error: 'Error fetching scenarios' }, { status: 500 });
    }

    if (!scenarios || scenarios.length === 0) {
      return NextResponse.json({ message: 'No active scenarios found', updated: 0 });
    }

    const now = new Date();
    const updates: { id: string; is_hot: boolean; is_featured: boolean }[] = [];

    // Calcular scores para cada escenario
    const scoredScenarios = scenarios.map(scenario => {
      const ageInDays = (now.getTime() - new Date(scenario.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const steals = scenario.steal_count || 0;
      const participants = scenario.participant_count || 0;
      const pool = scenario.total_pool || 0;

      // Score para HOT (prioriza actividad reciente)
      const hotScore = ageInDays <= THRESHOLDS.hot.maxAge
        ? (steals * 3) + (participants * 2) + (pool / 100) - (ageInDays * 2)
        : 0;

      // Score para FEATURED (prioriza métricas absolutas)
      const featuredScore = (steals * 2) + (participants * 3) + (pool / 50);

      // Verificar si cumple umbrales mínimos
      const meetsHotThreshold =
        steals >= THRESHOLDS.hot.minSteals ||
        participants >= THRESHOLDS.hot.minParticipants ||
        pool >= THRESHOLDS.hot.minPool;

      const meetsFeaturedThreshold =
        steals >= THRESHOLDS.featured.minSteals ||
        participants >= THRESHOLDS.featured.minParticipants ||
        pool >= THRESHOLDS.featured.minPool;

      return {
        ...scenario,
        ageInDays,
        hotScore: meetsHotThreshold ? hotScore : 0,
        featuredScore: meetsFeaturedThreshold ? featuredScore : 0,
        meetsHotThreshold,
        meetsFeaturedThreshold,
      };
    });

    // Seleccionar los mejores para HOT
    const hotCandidates = scoredScenarios
      .filter(s => s.hotScore > 0)
      .sort((a, b) => b.hotScore - a.hotScore)
      .slice(0, THRESHOLDS.maxHot);

    // Seleccionar los mejores para FEATURED
    const featuredCandidates = scoredScenarios
      .filter(s => s.featuredScore > 0)
      .sort((a, b) => b.featuredScore - a.featuredScore)
      .slice(0, THRESHOLDS.maxFeatured);

    const hotIds = new Set(hotCandidates.map(s => s.id));
    const featuredIds = new Set(featuredCandidates.map(s => s.id));

    // Preparar actualizaciones
    for (const scenario of scenarios) {
      const shouldBeHot = hotIds.has(scenario.id);
      const shouldBeFeatured = featuredIds.has(scenario.id);

      // Solo actualizar si hay cambio
      if (scenario.is_hot !== shouldBeHot || scenario.is_featured !== shouldBeFeatured) {
        updates.push({
          id: scenario.id,
          is_hot: shouldBeHot,
          is_featured: shouldBeFeatured,
        });
      }
    }

    // Aplicar actualizaciones
    let updatedCount = 0;
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('scenarios')
        .update({
          is_hot: update.is_hot,
          is_featured: update.is_featured,
          updated_at: new Date().toISOString(),
        })
        .eq('id', update.id);

      if (!updateError) {
        updatedCount++;
      } else {
        console.error(`Error updating scenario ${update.id}:`, updateError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Auto-feature completed`,
      stats: {
        totalScenarios: scenarios.length,
        updatedCount,
        hotCount: hotCandidates.length,
        featuredCount: featuredCandidates.length,
        hotScenarios: hotCandidates.map(s => ({ id: s.id, title: s.title, score: s.hotScore })),
        featuredScenarios: featuredCandidates.map(s => ({ id: s.id, title: s.title, score: s.featuredScore })),
      },
    });

  } catch (error) {
    console.error('Auto-feature error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET para verificar el estado actual
export async function GET() {
  try {
    const { data: scenarios, error } = await supabase
      .from('scenarios')
      .select('id, title, steal_count, participant_count, total_pool, is_featured, is_hot')
      .eq('status', 'ACTIVE')
      .or('is_featured.eq.true,is_hot.eq.true');

    if (error) {
      return NextResponse.json({ error: 'Error fetching scenarios' }, { status: 500 });
    }

    return NextResponse.json({
      featured: scenarios?.filter(s => s.is_featured) || [],
      hot: scenarios?.filter(s => s.is_hot) || [],
      thresholds: THRESHOLDS,
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
