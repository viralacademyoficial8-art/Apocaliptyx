export const dynamic = 'force-dynamic';

// src/app/api/stats/public/route.ts

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const supabase = () => getSupabaseAdmin();

export const revalidate = 60; // Revalidar cada 60 segundos

export async function GET() {
  try {
    // Obtener conteo de usuarios desde la tabla 'users'
    const { count: usersCount, error: usersError } = await supabase()
      .from("users")
      .select("*", { count: "exact", head: true });

    if (usersError) {
      console.error("Error fetching users:", usersError);
    }

    // Obtener conteo de escenarios desde la tabla 'scenarios'
    const { count: scenariosCount, error: scenariosError } = await supabase()
      .from("scenarios")
      .select("*", { count: "exact", head: true });

    if (scenariosError) {
      console.error("Error fetching scenarios:", scenariosError);
    }

    // Obtener suma total de AP Coins (total_pool de scenarios)
    const { data: poolData, error: poolError } = await supabase()
      .from("scenarios")
      .select("total_pool");

    let totalPool = 0;
    if (!poolError && poolData) {
      totalPool = poolData.reduce((sum, s) => sum + (s.total_pool || 0), 0);
    }

    // Obtener conteo de predicciones (scenario_predictions si existe)
    let predictionsCount = 0;
    const { count: predCount, error: predError } = await supabase()
      .from("scenario_predictions")
      .select("*", { count: "exact", head: true });

    if (!predError && predCount) {
      predictionsCount = predCount;
    } else {
      // Fallback: contar posts del foro como actividad
      const { count: postsCount } = await supabase()
      .from("forum_posts")
        .select("*", { count: "exact", head: true });
      predictionsCount = postsCount || 0;
    }

    // Formatear números
    const formatNumber = (num: number): string => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
      }
      return num.toString();
    };

    const stats = {
      users: {
        value: formatNumber(usersCount || 0),
        raw: usersCount || 0,
      },
      totalPool: {
        value: formatNumber(totalPool),
        raw: totalPool,
      },
      scenarios: {
        value: formatNumber(scenariosCount || 0),
        raw: scenariosCount || 0,
      },
      predictions: {
        value: formatNumber(predictionsCount),
        raw: predictionsCount,
      },
    };

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching public stats:", error);
    
    // Devolver valores por defecto en caso de error
    return NextResponse.json({
      users: { value: "0", raw: 0 },
      totalPool: { value: "0", raw: 0 },
      scenarios: { value: "0", raw: 0 },
      predictions: { value: "0", raw: 0 },
    });
  }
}