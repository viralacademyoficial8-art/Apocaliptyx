export const dynamic = 'force-dynamic';

// src/app/api/auth/reset-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin, getSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token y contrasena son requeridos" },
        { status: 400 }
      );
    }

    // Validar requisitos de contrasena
    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contrasena debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "La contrasena debe contener al menos una mayuscula" },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: "La contrasena debe contener al menos una minuscula" },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "La contrasena debe contener al menos un numero" },
        { status: 400 }
      );
    }

    // Buscar el token en la base de datos
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Token invalido o expirado" },
        { status: 400 }
      );
    }

    // Verificar si el token ha expirado
    if (resetToken.expires < new Date()) {
      // Eliminar token expirado
      await prisma.passwordResetToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { error: "El enlace ha expirado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const { data: user, error: userError } = await getSupabaseClient()
      .from("users")
      .select("id")
      .eq("email", resetToken.email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar la contrasena en Supabase Auth
    const { error: updateError } = await getSupabaseAdmin().auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (updateError) {
      console.error("Error actualizando contrasena en Supabase:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar la contrasena" },
        { status: 500 }
      );
    }

    // Eliminar el token usado
    await prisma.passwordResetToken.delete({
      where: { token },
    });

    // Eliminar todos los tokens de este email (por seguridad)
    await prisma.passwordResetToken.deleteMany({
      where: { email: resetToken.email },
    });

    console.log("Contrasena restablecida exitosamente para:", resetToken.email);

    return NextResponse.json({
      success: true,
      message: "Contrasena actualizada exitosamente",
    });

  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
