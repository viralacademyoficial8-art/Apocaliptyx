// src/app/api/landing/stats/route.ts

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const revalidate = 60; // Revalidar cada 60 segundos

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    // Ejecutar todas las consultas en paralelo
    const [
      usersResult,
      scenariosResult,
      completedResult,
      topUsersResult,
      recentActivityResult
    ] = await Promise.all([
      // Total de usuarios registrados
      supabase.from('users').select('id', { count: 'exact', head: true }),

      // Total de escenarios creados
      supabase.from('scenarios').select('id', { count: 'exact', head: true }),

      // Escenarios completados (predicciones cumplidas)
      supabase.from('scenarios').select('id', { count: 'exact', head: true }).eq('status', 'completed'),

      // Top 5 usuarios por reputación
      supabase
        .from('users')
        .select('id, username, display_name, avatar_url, level, ap_coins, total_predictions, correct_predictions')
        .order('ap_coins', { ascending: false })
        .limit(5),

      // Actividad reciente (últimos 10 eventos)
      supabase
        .from('scenarios')
        .select('id, title, category, status, current_price, created_at, creator:users!scenarios_creator_id_fkey(username, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    const totalUsers = usersResult.count || 0;
    const totalScenarios = scenariosResult.count || 0;
    const completedScenarios = completedResult.count || 0;

    // Calcular win rate promedio solo si hay usuarios con predicciones
    let avgWinRate = 0;
    if (topUsersResult.data && topUsersResult.data.length > 0) {
      const usersWithPredictions = topUsersResult.data.filter(
        (u: { total_predictions?: number }) => (u.total_predictions || 0) > 0
      );
      if (usersWithPredictions.length > 0) {
        const totalWinRate = usersWithPredictions.reduce((acc: number, u: { correct_predictions?: number; total_predictions?: number }) => {
          const winRate = ((u.correct_predictions || 0) / (u.total_predictions || 1)) * 100;
          return acc + winRate;
        }, 0);
        avgWinRate = Math.round(totalWinRate / usersWithPredictions.length);
      }
    }

    // Formatear top users para el frontend
    const topProphets = (topUsersResult.data || []).map((user: {
      id: string;
      username: string;
      display_name: string;
      avatar_url: string | null;
      level: number;
      ap_coins: number;
      total_predictions?: number;
      correct_predictions?: number;
    }) => ({
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      level: user.level,
      apCoins: user.ap_coins,
      winRate: user.total_predictions
        ? Math.round(((user.correct_predictions || 0) / user.total_predictions) * 100)
        : 0
    }));

    // Formatear actividad reciente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentActivity = (recentActivityResult.data as any[] || []).map((scenario) => ({
      id: scenario.id,
      title: scenario.title,
      category: scenario.category,
      status: scenario.status,
      price: scenario.current_price || 20,
      createdAt: scenario.created_at,
      creator: Array.isArray(scenario.creator) ? scenario.creator[0] : scenario.creator
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalScenarios,
        completedScenarios,
        avgWinRate: avgWinRate || 85 // Fallback si no hay datos
      },
      topProphets,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching landing stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener estadísticas',
        // Datos fallback para que la landing siempre funcione
        stats: {
          totalUsers: 0,
          totalScenarios: 0,
          completedScenarios: 0,
          avgWinRate: 85
        },
        topProphets: [],
        recentActivity: []
      },
      { status: 500 }
    );
  }
}
