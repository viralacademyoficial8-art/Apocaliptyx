// src/app/api/support/tickets/[ticketId]/messages/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Obtener mensajes de un ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await auth();
    const { ticketId } = await params;

    // Verificar acceso al ticket
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("user_id")
      .eq("id", ticketId)
      .single();

    if (!ticket) {
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

    // Obtener mensajes
    const { data: messages, error } = await supabase
      .from("support_messages")
      .select(`
        *,
        sender:users!support_messages_sender_id_fkey(id, username, name, image)
      `)
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json({ error: "Error fetching messages" }, { status: 500 });
    }

    // Marcar mensajes como leídos
    const senderTypeToMark = isAdmin ? ["user", "guest"] : ["agent", "system"];
    await supabase
      .from("support_messages")
      .update({ is_read: true })
      .eq("ticket_id", ticketId)
      .in("sender_type", senderTypeToMark);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST - Enviar mensaje
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await auth();
    const { ticketId } = await params;
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Verificar acceso al ticket
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("user_id, status")
      .eq("id", ticketId)
      .single();

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.status === "closed") {
      return NextResponse.json({ error: "Ticket is closed" }, { status: 400 });
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

    // Crear mensaje
    const { data: message, error } = await supabase
      .from("support_messages")
      .insert({
        ticket_id: ticketId,
        sender_id: session?.user?.id || null,
        sender_type: isAdmin ? "agent" : (session?.user?.id ? "user" : "guest"),
        content: content.trim(),
      })
      .select(`
        *,
        sender:users!support_messages_sender_id_fkey(id, username, name, image)
      `)
      .single();

    if (error) {
      console.error("Error creating message:", error);
      return NextResponse.json({ error: "Error sending message" }, { status: 500 });
    }

    // Actualizar ticket
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (isAdmin && ticket.status === "open") {
      updateData.status = "in_progress";
      updateData.assigned_to = session?.user?.id;
    }

    await supabase
      .from("support_tickets")
      .update(updateData)
      .eq("id", ticketId);

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}