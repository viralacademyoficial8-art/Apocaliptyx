export const dynamic = 'force-dynamic';

// src/app/api/auth/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, name } = await request.json();

    // Validaciones
    if (!email || !password || !username || !name) {
      return NextResponse.json(
        { success: false, message: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, message: "El nombre de usuario debe tener al menos 3 caracteres" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const usernameLower = username.toLowerCase().trim();

    // Verificar si el email ya existe en nuestra tabla users
    const { data: existingEmail } = await getSupabaseClient()
      .from("users")
      .select("id")
      .eq("email", emailLower)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "Este email ya está registrado" },
        { status: 400 }
      );
    }

    // Verificar si el username ya existe
    const { data: existingUsername } = await getSupabaseClient()
      .from("users")
      .select("id")
      .eq("username", usernameLower)
      .single();

    if (existingUsername) {
      return NextResponse.json(
        { success: false, message: "Este nombre de usuario ya está en uso" },
        { status: 400 }
      );
    }

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await getSupabaseAdmin().auth.admin.createUser({
      email: emailLower,
      password: password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        username: usernameLower,
        display_name: name,
      },
    });

    if (authError || !authData.user) {
      console.error("Error creating auth user:", authError);
      return NextResponse.json(
        { success: false, message: authError?.message || "Error al crear el usuario" },
        { status: 500 }
      );
    }

    // 2. Crear perfil en nuestra tabla users con el mismo ID
    const { data: newUser, error: userError } = await getSupabaseClient()
      .from("users")
      .insert({
        id: authData.user.id, // Usar el mismo ID de auth.users
        email: emailLower,
        username: usernameLower,
        display_name: name,
        avatar_url: null,
        bio: null,
        role: "USER",
        ap_coins: 1000, // Bonus de bienvenida
        level: 1,
        experience: 0,
        is_verified: false,
        is_premium: false,
        is_banned: false,
        total_predictions: 0,
        correct_predictions: 0,
        total_earnings: 0,
      })
      .select()
      .single();

    if (userError || !newUser) {
      console.error("Error creating user profile:", userError);
      // Si falla crear el perfil, eliminar el usuario de auth
      await getSupabaseAdmin().auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { success: false, message: "Error al crear el perfil de usuario" },
        { status: 500 }
      );
    }

    // 3. Crear notificación de bienvenida
    await getSupabaseClient().from("notifications").insert({
      user_id: newUser.id,
      type: "welcome",
      title: "¡Bienvenido a Apocaliptyx! 🎉",
      message: `Hola @${usernameLower}, has recibido 1,000 AP Coins de regalo. ¡Comienza a predecir el futuro!`,
      link_url: "/dashboard",
      is_read: false,
    });

    console.log("Usuario registrado exitosamente:", newUser.email);

    return NextResponse.json({
      success: true,
      message: "Registro exitoso",
      userId: newUser.id,
    });

  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}