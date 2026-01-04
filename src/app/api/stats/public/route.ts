// src/app/api/stats/public/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 60; // Revalidar cada 60 segundos

export async function GET() {
  try {
    // Obtener conteo de usuarios
    const usersCount = await prisma.user.count();

    // Obtener total de AP Coins en circulación (suma de todos los usuarios)
    const totalCoins = await prisma.user.aggregate({
      _sum: {
        apCoins: true,
      },
    });

    // Obtener conteo de escenarios desde Supabase
    const { count: scenariosCount } = await supabase
      .from("scenarios")
      .select("*", { count: "exact", head: true });

    // Obtener total de predicciones (participaciones en escenarios)
    const { count: predictionsCount } = await supabase
      .from("scenario_participants")
      .select("*", { count: "exact", head: true });

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
        value: formatNumber(usersCount),
        raw: usersCount,
      },
      totalPool: {
        value: formatNumber(totalCoins._sum.apCoins || 0),
        raw: totalCoins._sum.apCoins || 0,
      },
      scenarios: {
        value: formatNumber(scenariosCount || 0),
        raw: scenariosCount || 0,
      },
      predictions: {
        value: formatNumber(predictionsCount || 0),
        raw: predictionsCount || 0,
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