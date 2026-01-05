// src/app/api/admin/stats/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const supabase = () => getSupabaseAdmin();

export async function GET() {
  try {
    // Verificar que sea admin
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar rol de admin
    const { data: userData } = await supabase()
      .from("users")
      .select("role")
      .eq("email", session.user.email)
      .single();

    if (userData?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Obtener fecha de hoy y hace 7 días
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Total de usuarios
    const { count: totalUsers } = await supabase()
      .from("users")
      .select("*", { count: "exact", head: true });

    // Usuarios activos (online o vistos en últimas 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const { count: activeUsers } = await supabase()
      .from("users")
      .select("*", { count: "exact", head: true })
      .or(`is_online.eq.true,last_seen.gte.${yesterday.toISOString()}`);

    // Nuevos usuarios hoy
    const { count: newUsersToday } = await supabase()
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Nuevos usuarios esta semana
    const { count: newUsersThisWeek } = await supabase()
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString());

    // Total de escenarios
    const { count: totalScenarios } = await supabase()
      .from("scenarios")
      .select("*", { count: "exact", head: true });

    // Escenarios activos
    const { count: activeScenarios } = await supabase()
      .from("scenarios")
      .select("*", { count: "exact", head: true })
      .eq("status", "ACTIVE");

    // Escenarios completados
    const { count: completedScenarios } = await supabase()
      .from("scenarios")
      .select("*", { count: "exact", head: true })
      .eq("status", "RESOLVED");

    // Total de transacciones
    const { count: totalTransactions } = await supabase()
      .from("transactions")
      .select("*", { count: "exact", head: true });

    // Volumen total (suma de transacciones positivas)
    const { data: volumeData } = await supabase()
      .from("transactions")
      .select("amount")
      .gt("amount", 0);
    
    const totalVolume = volumeData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    // Reportes pendientes
    const { count: pendingReports } = await supabase()
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // Usuarios baneados
    const { count: bannedUsers } = await supabase()
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_banned", true);

    // Posts del foro
    const { count: totalPosts } = await supabase()
      .from("forum_posts")
      .select("*", { count: "exact", head: true });

    const stats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newUsersToday: newUsersToday || 0,
      newUsersThisWeek: newUsersThisWeek || 0,
      totalScenarios: totalScenarios || 0,
      activeScenarios: activeScenarios || 0,
      completedScenarios: completedScenarios || 0,
      totalTransactions: totalTransactions || 0,
      totalVolume: totalVolume,
      pendingReports: pendingReports || 0,
      bannedUsers: bannedUsers || 0,
      totalPosts: totalPosts || 0,
      // Estos se pueden calcular después con más datos
      revenueToday: 0,
      revenueThisWeek: 0,
      revenueThisMonth: 0,
      avgSessionTime: "N/A",
      retentionRate: 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}