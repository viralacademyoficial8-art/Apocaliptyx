// src/app/api/auth/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    // Verificar si el email ya existe
    const { data: existingEmail } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "Este email ya está registrado" },
        { status: 400 }
      );
    }

    // Verificar si el username ya existe
    const { data: existingUsername } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.toLowerCase())
      .single();

    if (existingUsername) {
      return NextResponse.json(
        { success: false, message: "Este nombre de usuario ya está en uso" },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario en Supabase
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        display_name: name,
        avatar_url: null,
        bio: null,
        role: "USER",
        ap_coins: 1000, // Bonus de bienvenida
        level: 1,
        xp: 0,
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
      console.error("Error creating user:", userError);
      return NextResponse.json(
        { success: false, message: "Error al crear el usuario" },
        { status: 500 }
      );
    }

    // Guardar contraseña hasheada en user_auth
    const { error: authError } = await supabase
      .from("user_auth")
      .insert({
        user_id: newUser.id,
        password_hash: hashedPassword,
      });

    if (authError) {
      console.error("Error saving password:", authError);
      // Eliminar el usuario si no se pudo guardar la contraseña
      await supabase.from("users").delete().eq("id", newUser.id);
      return NextResponse.json(
        { success: false, message: "Error al guardar las credenciales" },
        { status: 500 }
      );
    }

    // 🔔 Crear notificación de bienvenida
    await supabase.from("notifications").insert({
      user_id: newUser.id,
      type: "welcome",
      title: "¡Bienvenido a Apocaliptics! 🎉",
      message: `Hola @${username}, has recibido 1,000 AP Coins de regalo. ¡Comienza a predecir el futuro!`,
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