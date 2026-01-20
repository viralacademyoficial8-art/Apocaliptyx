export const dynamic = 'force-dynamic';

// src/app/api/support/tickets/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const supabase = () => getSupabaseAdmin();

// GET - Obtener tickets del usuario o todos (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Verificar si es admin
    let isAdmin = false;
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      isAdmin = ["ADMIN", "SUPER_ADMIN", "STAFF", "MODERATOR"].includes(user?.role || "");
    }

    let query = supabase()
      .from("support_tickets")
      .select(`
        *,
        user:users!support_tickets_user_id_fkey(id, username, name, image),
        assigned:users!support_tickets_assigned_to_fkey(id, username, name, image),
        messages:support_messages(count)
      `)
      .order("updated_at", { ascending: false });

    // Si no es admin, solo ver sus propios tickets
    if (!isAdmin && session?.user?.id) {
      query = query.eq("user_id", session.user.id);
    } else if (!isAdmin && !session?.user?.id) {
      return NextResponse.json({ tickets: [] });
    }

    // Filtrar por status
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: tickets, error } = await query;

    if (error) {
      console.error("Error fetching tickets:", error);
      return NextResponse.json({ error: "Error fetching tickets" }, { status: 500 });
    }

    // Obtener conteo de mensajes no leídos por ticket
    const ticketsWithUnread = await Promise.all(
      (tickets || []).map(async (ticket) => {
        const { count } = await supabase()
      .from("support_messages")
          .select("*", { count: "exact", head: true })
          .eq("ticket_id", ticket.id)
          .eq("is_read", false)
          .neq("sender_type", isAdmin ? "agent" : "user");

        return {
          ...ticket,
          unread_count: count || 0,
        };
      })
    );

    return NextResponse.json({ tickets: ticketsWithUnread });
  } catch (error) {
    console.error("Support tickets error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST - Crear nuevo ticket
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const { subject, message, guestEmail, guestName } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    // Crear ticket
    const ticketData: Record<string, unknown> = {
      subject,
      status: "open",
      priority: "normal",
    };

    if (session?.user?.id) {
      ticketData.user_id = session.user.id;
    } else if (guestEmail) {
      ticketData.guest_email = guestEmail;
      ticketData.guest_name = guestName || "Invitado";
    } else {
      return NextResponse.json(
        { error: "User must be logged in or provide email" },
        { status: 400 }
      );
    }

    const { data: ticket, error: ticketError } = await supabase()
      .from("support_tickets")
      .insert(ticketData)
      .select()
      .single();

    if (ticketError) {
      console.error("Error creating ticket:", ticketError);
      return NextResponse.json({ error: "Error creating ticket" }, { status: 500 });
    }

    // Crear primer mensaje
    const { error: messageError } = await supabase()
      .from("support_messages")
      .insert({
        ticket_id: ticket.id,
        sender_id: session?.user?.id || null,
        sender_type: session?.user?.id ? "user" : "guest",
        content: message,
      });

    if (messageError) {
      console.error("Error creating message:", messageError);
    }

    // Mensaje automático del sistema
    await supabase().from("support_messages").insert({
      ticket_id: ticket.id,
      sender_type: "system",
      content: "Gracias por contactarnos. Un agente de soporte te responderá pronto.",
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Create ticket error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}