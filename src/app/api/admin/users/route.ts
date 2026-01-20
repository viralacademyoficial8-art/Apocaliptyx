export const dynamic = 'force-dynamic';

// src/app/api/admin/users/route.ts

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
    const role = searchParams.get("role") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Construir query
    let query = supabase()
      .from("users")
      .select("*", { count: "exact" });

    // Filtro de búsqueda
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,display_name.ilike.%${search}%`);
    }

    // Filtro de estado
    if (status === "active") {
      query = query.eq("is_banned", false);
    } else if (status === "banned") {
      query = query.eq("is_banned", true);
    }

    // Filtro de rol
    if (role !== "all") {
      query = query.eq("role", role.toUpperCase());
    }

    // Paginación y orden
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: users, count, error } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
    }

    // Formatear usuarios para el frontend
    const formattedUsers = users?.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      email: user.email,
      avatarUrl: user.avatar_url,
      role: user.role?.toLowerCase() || "user",
      status: user.is_banned ? "banned" : "active",
      prophetLevel: getLevelName(user.level || 1),
      apCoins: user.ap_coins || 0,
      level: user.level || 1,
      xp: user.experience || 0,
      isVerified: user.is_verified || false,
      isPremium: user.is_premium || false,
      totalPredictions: user.total_predictions || 0,
      correctPredictions: user.correct_predictions || 0,
      winRate: user.total_predictions > 0 
        ? ((user.correct_predictions / user.total_predictions) * 100).toFixed(1)
        : "0.0",
      totalEarnings: user.total_earnings || 0,
      isOnline: user.is_online || false,
      lastSeen: user.last_seen,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));

    return NextResponse.json({
      users: formattedUsers,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error in admin users API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Actualizar usuario (ban, rol, etc.)
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
    const { userId, action, value } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case "ban":
        updateData = { is_banned: true };
        break;
      case "unban":
        updateData = { is_banned: false };
        break;
      case "setRole":
        updateData = { role: value?.toUpperCase() };
        break;
      case "verify":
        updateData = { is_verified: true };
        break;
      case "unverify":
        updateData = { is_verified: false };
        break;
      case "setPremium":
        updateData = { is_premium: value };
        break;
      case "setCoins":
        updateData = { ap_coins: parseInt(value) };
        break;
      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase()
      .from("users")
      .update(updateData)
      .eq("id", userId);

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in admin users PATCH:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

function getLevelName(level: number): string {
  if (level >= 50) return "Nostradamus Supremo";
  if (level >= 40) return "Oráculo Legendario";
  if (level >= 30) return "Vidente Maestro";
  if (level >= 20) return "Profeta";
  if (level >= 10) return "Adivino";
  if (level >= 5) return "Aprendiz";
  return "Novato";
}