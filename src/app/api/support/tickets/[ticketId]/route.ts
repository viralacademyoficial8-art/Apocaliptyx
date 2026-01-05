// src/app/api/support/tickets/[ticketId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const supabase = () => getSupabaseAdmin();

// GET - Obtener un ticket específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await auth();
    const { ticketId } = await params;

    const { data: ticket, error } = await supabase()
      .from("support_tickets")
      .select(`
        *,
        user:users!support_tickets_user_id_fkey(id, username, name, image),
        assigned:users!support_tickets_assigned_to_fkey(id, username, name, image)
      `)
      .eq("id", ticketId)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Verificar permisos
    let isAdmin = false;
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      isAdmin = ["ADMIN", "SUPER_ADMIN", "STAFF", "MODERATOR"].includes(user?.role || "");
    }

    if (!isAdmin && ticket.user_id !== session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Get ticket error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PATCH - Actualizar ticket (status, priority, assigned_to)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await auth();
    const { ticketId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar si es admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, username: true },
    });

    const isAdmin = ["ADMIN", "SUPER_ADMIN", "STAFF", "MODERATOR"].includes(user?.role || "");

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { status, priority, assigned_to } = body;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
      if (status === "resolved" || status === "closed") {
        updateData.resolved_at = new Date().toISOString();
      }
    }

    if (priority) {
      updateData.priority = priority;
    }

    if (assigned_to !== undefined) {
      updateData.assigned_to = assigned_to;
    }

    const { data: ticket, error } = await supabase()
      .from("support_tickets")
      .update(updateData)
      .eq("id", ticketId)
      .select()
      .single();

    if (error) {
      console.error("Error updating ticket:", error);
      return NextResponse.json({ error: "Error updating ticket" }, { status: 500 });
    }

    // Agregar mensaje de sistema si cambió el status
    if (status) {
      const statusMessages: Record<string, string> = {
        in_progress: `El ticket ha sido tomado por ${user?.username || "un agente"}.`,
        resolved: "El ticket ha sido marcado como resuelto.",
        closed: "El ticket ha sido cerrado.",
        open: "El ticket ha sido reabierto.",
      };

      if (statusMessages[status]) {
        await supabase().from("support_messages").insert({
          ticket_id: ticketId,
          sender_type: "system",
          content: statusMessages[status],
        });
      }
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Update ticket error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}