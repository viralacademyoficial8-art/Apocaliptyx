// src/app/api/admin/scenarios/route.ts

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

    const { error } = await supabase()
      .from("scenarios")
      .update(updateData)
      .eq("id", scenarioId);

    if (error) {
      console.error("Error updating scenario:", error);
      return NextResponse.json({ error: "Error al actualizar escenario" }, { status: 500 });
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