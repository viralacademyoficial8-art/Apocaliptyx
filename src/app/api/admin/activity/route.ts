export const dynamic = 'force-dynamic';

// src/app/api/admin/activity/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const supabase = () => getSupabaseAdmin();

export async function GET(request: NextRequest) {
  try {
    // Verificar que sea admin
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: userData } = await supabase()
      .from("users")
      .select("role")
      .eq("email", session.user.email)
      .single();

    if (userData?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const activities: Array<{
      id: string;
      type: string;
      description: string;
      userId?: string;
      username?: string;
      metadata?: Record<string, unknown>;
      createdAt: string;
    }> = [];

    // Obtener usuarios recientes
    const { data: recentUsers } = await supabase()
      .from("users")
      .select("id, username, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    recentUsers?.forEach((user) => {
      activities.push({
        id: `user_${user.id}`,
        type: "user_registered",
        description: "Nuevo usuario registrado",
        userId: user.id,
        username: user.username,
        createdAt: user.created_at,
      });
    });

    // Obtener escenarios recientes con creador
    const { data: recentScenarios } = await supabase()
      .from("scenarios")
      .select("id, title, created_at, total_p, creator_id")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentScenarios) {
      // Obtener usernames de los creadores
      const creatorIds = recentScenarios.map(s => s.creator_id).filter(Boolean);
      const { data: creators } = await supabase()
        .from("users")
        .select("id, username")
        .in("id", creatorIds);

      const creatorsMap = new Map(creators?.map(c => [c.id, c.username]) || []);

      recentScenarios.forEach((scenario) => {
        activities.push({
          id: `scenario_${scenario.id}`,
          type: "scenario_created",
          description: `Escenario creado: ${scenario.title?.substring(0, 30)}...`,
          username: creatorsMap.get(scenario.creator_id) || "Unknown",
          metadata: { pool: scenario.total_p },
          createdAt: scenario.created_at,
        });
      });
    }

    // Obtener transacciones recientes
    const { data: recentTransactions } = await supabase()
      .from("transactions")
      .select("id, type, amount, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentTransactions) {
      // Obtener usernames de los usuarios
      const userIds = recentTransactions.map(t => t.user_id).filter(Boolean);
      const { data: txUsers } = await supabase()
        .from("users")
        .select("id, username")
        .in("id", userIds);

      const usersMap = new Map(txUsers?.map(u => [u.id, u.username]) || []);

      recentTransactions.forEach((tx) => {
        let txType = "transaction";
        let description = "Transacción";

        switch (tx.type) {
          case "PURCHASE":
            txType = "purchase";
            description = "Compra de AP Coins";
            break;
          case "PREDICTION":
            txType = "prediction";
            description = "Predicción realizada";
            break;
          case "REWARD":
            txType = "reward";
            description = "Recompensa obtenida";
            break;
          case "BONUS":
            txType = "bonus";
            description = "Bonus recibido";
            break;
        }

        activities.push({
          id: `tx_${tx.id}`,
          type: txType,
          description,
          username: usersMap.get(tx.user_id) || "Unknown",
          metadata: { amount: tx.amount },
          createdAt: tx.created_at,
        });
      });
    }

    // Obtener posts del foro recientes
    const { data: recentPosts } = await supabase()
      .from("forum_posts")
      .select("id, title, created_at, author_id")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentPosts) {
      const authorIds = recentPosts.map(p => p.author_id).filter(Boolean);
      const { data: authors } = await supabase()
        .from("users")
        .select("id, username")
        .in("id", authorIds);

      const authorsMap = new Map(authors?.map(a => [a.id, a.username]) || []);

      recentPosts.forEach((post) => {
        activities.push({
          id: `post_${post.id}`,
          type: "post_created",
          description: `Post en foro: ${post.title?.substring(0, 30)}...`,
          username: authorsMap.get(post.author_id) || "Unknown",
          createdAt: post.created_at,
        });
      });
    }

    // Obtener reportes recientes
    const { data: recentReports } = await supabase()
      .from("scenario_reports")
      .select("id, reason, created_at, reporter_id")
      .order("created_at", { ascending: false })
      .limit(3);

    if (recentReports) {
      const reporterIds = recentReports.map(r => r.reporter_id).filter(Boolean);
      const { data: reporters } = await supabase()
        .from("users")
        .select("id, username")
        .in("id", reporterIds);

      const reportersMap = new Map(reporters?.map(r => [r.id, r.username]) || []);

      recentReports.forEach((report) => {
        activities.push({
          id: `report_${report.id}`,
          type: "report_submitted",
          description: `Reporte: ${report.reason}`,
          username: reportersMap.get(report.reporter_id) || "Unknown",
          createdAt: report.created_at,
        });
      });
    }

    // Ordenar por fecha y limitar
    activities.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      activities: activities.slice(0, limit),
    });
  } catch (error) {
    console.error("Error in admin activity API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}