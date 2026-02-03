export const dynamic = 'force-dynamic';

// src/app/api/admin/scenarios/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { notificationsService } from "@/services/notifications.service";

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

    // Parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const category = searchParams.get("category") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Construir query
    let query = supabase()
      .from("scenarios")
      .select(`
        *,
        creator:users!scenarios_creator_id_fkey(id, username, display_name, avatar_url)
      `, { count: "exact" });

    // Filtro de búsqueda
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filtro de estado
    if (status !== "all") {
      query = query.eq("status", status.toUpperCase());
    }

    // Filtro de categoría
    if (category !== "all") {
      query = query.eq("category", category);
    }

    // Paginación y orden
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: scenarios, count, error } = await query;

    if (error) {
      console.error("Error fetching scenarios:", error);
      return NextResponse.json({ error: "Error al obtener escenarios" }, { status: 500 });
    }

    // Obtener conteo de reportes por escenario
    const scenarioIds = scenarios?.map(s => s.id) || [];
    const { data: reportsData } = await supabase()
      .from("scenario_reports")
      .select("scenario_id")
      .in("scenario_id", scenarioIds);

    const reportCounts: Record<string, number> = {};
    reportsData?.forEach(r => {
      reportCounts[r.scenario_id] = (reportCounts[r.scenario_id] || 0) + 1;
    });

    // Formatear escenarios para el frontend
    const formattedScenarios = scenarios?.map((scenario) => ({
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      category: scenario.category,
      status: scenario.status?.toLowerCase() || "active",
      result: scenario.result,
      imageUrl: scenario.image_url,
      creatorId: scenario.creator_id,
      creatorUsername: scenario.creator?.username || "Unknown",
      creatorDisplayName: scenario.creator?.display_name || "Unknown",
      creatorAvatar: scenario.creator?.avatar_url,
      totalPool: scenario.total_p || 0,
      yesVotes: scenario.yes_p || 0,
      noVotes: scenario.no_p || 0,
      reports: reportCounts[scenario.id] || 0,
      deadline: scenario.deadline,
      createdAt: scenario.created_at,
      updatedAt: scenario.updated_at,
    }));

    return NextResponse.json({
      scenarios: formattedScenarios,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error in admin scenarios API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Actualizar escenario (aprobar, rechazar, resolver, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: adminData } = await supabase()
      .from("users")
      .select("role")
      .eq("email", session.user.email)
      .single();

    if (adminData?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { scenarioId, action, result } = body;

    if (!scenarioId || !action) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case "approve":
        updateData = { status: "ACTIVE" };
        break;
      case "reject":
        updateData = { status: "REJECTED" };
        break;
      case "resolve":
        updateData = { status: "RESOLVED", result: result?.toUpperCase() };
        break;
      case "cancel":
        updateData = { status: "CANCELLED" };
        break;
      case "pause":
        updateData = { status: "PAUSED" };
        break;
      case "activate":
        updateData = { status: "ACTIVE" };
        break;
      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }

    updateData.updated_at = new Date().toISOString();

    // Get scenario info before updating
    const { data: scenarioData } = await supabase()
      .from("scenarios")
      .select("title, creator_id")
      .eq("id", scenarioId)
      .single();

    const { error } = await supabase()
      .from("scenarios")
      .update(updateData)
      .eq("id", scenarioId);

    if (error) {
      console.error("Error updating scenario:", error);
      return NextResponse.json({ error: "Error al actualizar escenario" }, { status: 500 });
    }

    // Send notifications when scenario is resolved
    if (action === "resolve" && result && scenarioData) {
      try {
        // Get all predictions for this scenario
        const { data: predictions } = await supabase()
          .from("predictions")
          .select("user_id, prediction, amount")
          .eq("scenario_id", scenarioId);

        if (predictions && predictions.length > 0) {
          const winningPrediction = result.toUpperCase();

          // Send notifications to all participants
          for (const pred of predictions) {
            const won = pred.prediction === winningPrediction;
            const amount = pred.amount || 0;

            if (won) {
              await notificationsService.notifyPredictionWon(
                pred.user_id,
                scenarioData.title,
                amount * 2, // Approximate winnings
                scenarioId
              );
            } else {
              await notificationsService.notifyPredictionLost(
                pred.user_id,
                scenarioData.title,
                amount,
                scenarioId
              );
            }
          }
        }

        // Notify the creator about resolution
        if (scenarioData.creator_id) {
          await notificationsService.notifyScenarioResolved(
            scenarioData.creator_id,
            scenarioData.title,
            result.toUpperCase() === 'YES' ? 'Sí se cumplió' : 'No se cumplió',
            scenarioId
          );
        }

        // Create feed activity for resolution
        await supabase()
          .from("feed_activities")
          .insert({
            type: 'scenario_resolved',
            title: result.toUpperCase() === 'YES' ? '¡Escenario cumplido!' : 'Escenario no cumplido',
            description: scenarioData.title,
            icon: result.toUpperCase() === 'YES' ? '✅' : '❌',
            user_id: scenarioData.creator_id,
            scenario_id: scenarioId,
            scenario_title: scenarioData.title,
          });
      } catch (notifError) {
        console.error("Error sending resolution notifications:", notifError);
        // Don't fail the request, notifications are secondary
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in admin scenarios PATCH:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Eliminar escenario
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: adminData } = await supabase()
      .from("users")
      .select("role")
      .eq("email", session.user.email)
      .single();

    if (adminData?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get("id");

    if (!scenarioId) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const { error } = await supabase()
      .from("scenarios")
      .delete()
      .eq("id", scenarioId);

    if (error) {
      console.error("Error deleting scenario:", error);
      return NextResponse.json({ error: "Error al eliminar escenario" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in admin scenarios DELETE:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}