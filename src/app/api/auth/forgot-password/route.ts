export const dynamic = 'force-dynamic';

// src/app/api/auth/forgot-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSupabaseClient } from "@/lib/supabase-server";
import { sendResetPasswordEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "El correo electronico es requerido" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Buscar usuario por email en Supabase
    const { data: user, error: userError } = await getSupabaseClient()
      .from("users")
      .select("id, username, email")
      .eq("email", emailLower)
      .single();

    // Si no existe el usuario, respondemos exitosamente por seguridad
    // (no revelar si el email existe o no)
    if (userError || !user) {
      console.log("Usuario no encontrado para email:", emailLower);
      // Respondemos igual para evitar enumeracion de usuarios
      return NextResponse.json({
        success: true,
        message: "Si el correo existe, recibiras un enlace de recuperacion",
      });
    }

    // Eliminar tokens anteriores para este email
    await prisma.passwordResetToken.deleteMany({
      where: { email: emailLower },
    });

    // Generar nuevo token seguro
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token en la base de datos
    await prisma.passwordResetToken.create({
      data: {
        email: emailLower,
        token,
        expires,
      },
    });

    // Construir el enlace de restablecimiento
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/restablecer-password?token=${token}`;

    // Enviar email
    try {
      await sendResetPasswordEmail(emailLower, user.username || "Usuario", resetLink);
      console.log("Email de recuperacion enviado a:", emailLower);
    } catch (emailError) {
      console.error("Error enviando email:", emailError);
      // No fallamos la operacion, pero logueamos el error
    }

    return NextResponse.json({
      success: true,
      message: "Si el correo existe, recibiras un enlace de recuperacion",
    });

  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
