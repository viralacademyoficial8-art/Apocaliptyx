export const dynamic = 'force-dynamic';

// src/app/api/admin/reports/route.ts

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
    const status = searchParams.get("status") || "all";
    const type = searchParams.get("type") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Obtener reportes de escenarios
    let scenarioReportsQuery = supabase()
      .from("scenario_reports")
      .select(`
        *,
        reporter:users!scenario_reports_reporter_id_fkey(id, username, display_name),
        scenario:scenarios!scenario_reports_scenario_id_fkey(id, title)
      `, { count: "exact" });

    if (status !== "all") {
      scenarioReportsQuery = scenarioReportsQuery.eq("status", status);
    }

    const { data: scenarioReports, count: scenarioCount } = await scenarioReportsQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Obtener reportes de usuarios
    let userReportsQuery = supabase()
      .from("user_reports")
      .select(`
        *,
        reporter:users!user_reports_reporter_id_fkey(id, username, display_name),
        reported:users!user_reports_reported_id_fkey(id, username, display_name)
      `, { count: "exact" });

    if (status !== "all") {
      userReportsQuery = userReportsQuery.eq("status", status);
    }

    const { data: userReports, count: userCount } = await userReportsQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Combinar y formatear reportes
    const allReports: Array<{
      id: string;
      type: string;
      targetId: string;
      targetTitle: string;
      reason: string;
      description: string;
      reporterId: string;
      reporterUsername: string;
      status: string;
      priority: string;
      createdAt: string;
      resolvedAt?: string;
      resolvedBy?: string;
    }> = [];

    // Agregar reportes de escenarios
    scenarioReports?.forEach((report) => {
      if (type === "all" || type === "scenario") {
        allReports.push({
          id: report.id,
          type: "scenario",
          targetId: report.scenario_id,
          targetTitle: report.scenario?.title || "Escenario eliminado",
          reason: report.reason,
          description: report.description || "",
          reporterId: report.reporter_id,
          reporterUsername: report.reporter?.username || "Unknown",
          status: report.status || "pending",
          priority: getPriority(report.reason),
          createdAt: report.created_at,
          resolvedAt: report.resolved_at,
          resolvedBy: report.resolved_by,
        });
      }
    });

    // Agregar reportes de usuarios
    userReports?.forEach((report) => {
      if (type === "all" || type === "user") {
        allReports.push({
          id: report.id,
          type: "user",
          targetId: report.reported_id,
          targetTitle: report.reported?.username || "Usuario eliminado",
          reason: report.reason,
          description: report.description || "",
          reporterId: report.reporter_id,
          reporterUsername: report.reporter?.username || "Unknown",
          status: report.status || "pending",
          priority: getPriority(report.reason),
          createdAt: report.created_at,
          resolvedAt: report.resolved_at,
          resolvedBy: report.resolved_by,
        });
      }
    });

    // Ordenar por fecha
    allReports.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      reports: allReports.slice(0, limit),
      total: (scenarioCount || 0) + (userCount || 0),
      page,
      limit,
      totalPages: Math.ceil(((scenarioCount || 0) + (userCount || 0)) / limit),
    });
  } catch (error) {
    console.error("Error in admin reports API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Actualizar estado de reporte
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: adminData } = await supabase()
      .from("users")
      .select("id, role")
      .eq("email", session.user.email)
      .single();

    if (adminData?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { reportId, reportType, action } = body;

    if (!reportId || !reportType || !action) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const table = reportType === "scenario" ? "scenario_reports" : "user_reports";
    
    let updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    switch (action) {
      case "reviewing":
        updateData.status = "reviewing";
        break;
      case "resolve":
        updateData.status = "resolved";
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = adminData.id;
        break;
      case "dismiss":
        updateData.status = "dismissed";
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = adminData.id;
        break;
      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }

    const { error } = await supabase()
      .from(table)
      .update(updateData)
      .eq("id", reportId);

    if (error) {
      console.error("Error updating report:", error);
      return NextResponse.json({ error: "Error al actualizar reporte" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in admin reports PATCH:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

function getPriority(reason: string): string {
  const highPriority = ["harassment", "hate_speech", "violence", "illegal", "spam"];
  const mediumPriority = ["inappropriate", "misleading", "duplicate"];
  
  if (highPriority.includes(reason)) return "high";
  if (mediumPriority.includes(reason)) return "medium";
  return "low";
}