// src/lib/actions/auth.actions.ts

"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// Tipo para respuestas
type ActionResponse = {
  success: boolean;
  message: string;
  error?: string;
  userId?: string;
};

// Login con credenciales
export async function loginWithCredentials(
  email: string,
  password: string,
  callbackUrl?: string
): Promise<ActionResponse> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || "/dashboard",
    });

    return { success: true, message: "Login exitoso" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            message: "Credenciales inválidas",
            error: "invalid_credentials",
          };
        default:
          return {
            success: false,
            message: "Error al iniciar sesión",
            error: "unknown_error",
          };
      }
    }
    throw error; // Re-throw para redirect
  }
}

// Login con Google
export async function loginWithGoogle(callbackUrl?: string) {
  await signIn("google", { redirectTo: callbackUrl || "/dashboard" });
}

// Login con Discord
export async function loginWithDiscord(callbackUrl?: string) {
  await signIn("discord", { redirectTo: callbackUrl || "/dashboard" });
}

// Logout
export async function logout() {
  await signOut({ redirectTo: "/" });
}

// Registro de usuario REAL en Supabase
export async function registerUser(data: {
  email: string;
  password: string;
  username: string;
  name: string;
}): Promise<ActionResponse> {
  try {
    const supabase = createServerSupabaseClient();

    // Validaciones
    if (!data.email || !data.password || !data.username || !data.name) {
      return {
        success: false,
        message: "Todos los campos son requeridos",
        error: "missing_fields",
      };
    }

    if (data.password.length < 6) {
      return {
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
        error: "weak_password",
      };
    }

    if (data.username.length < 3) {
      return {
        success: false,
        message: "El nombre de usuario debe tener al menos 3 caracteres",
        error: "short_username",
      };
    }

    // Verificar si el email ya existe
    const { data: existingEmail } = await supabase
      .from("users")
      .select("id")
      .eq("email", data.email.toLowerCase())
      .single();

    if (existingEmail) {
      return {
        success: false,
        message: "Este email ya está registrado",
        error: "email_exists",
      };
    }

    // Verificar si el username ya existe
    const { data: existingUsername } = await supabase
      .from("users")
      .select("id")
      .eq("username", data.username.toLowerCase())
      .single();

    if (existingUsername) {
      return {
        success: false,
        message: "Este nombre de usuario ya está en uso",
        error: "username_exists",
      };
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Crear usuario en Supabase
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        display_name: data.name,
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
      } as never)
      .select()
      .single();

    if (userError || !newUser) {
      console.error("Error creating user:", userError);
      return {
        success: false,
        message: "Error al crear el usuario",
        error: "db_error",
      };
    }

    // Guardar contraseña hasheada en user_auth
    const { error: authError } = await supabase
      .from("user_auth")
      .insert({
        user_id: newUser.id,
        password_hash: hashedPassword,
      } as never);

    if (authError) {
      console.error("Error saving password:", authError);
      // Eliminar el usuario si no se pudo guardar la contraseña
      await supabase.from("users").delete().eq("id", newUser.id);
      return {
        success: false,
        message: "Error al guardar las credenciales",
        error: "auth_error",
      };
    }

    // 🔔 Crear notificación de bienvenida
    await createWelcomeNotification(newUser.id, data.username);

    console.log("Usuario registrado exitosamente:", newUser.email);

    // Auto-login después del registro
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: "/dashboard",
    });

    return { 
      success: true, 
      message: "Registro exitoso", 
      userId: newUser.id 
    };
  } catch (error) {
    console.error("Register error:", error);
    if (error instanceof AuthError) {
      return {
        success: false,
        message: "Error al iniciar sesión automáticamente",
        error: "auth_error",
      };
    }
    throw error; // Re-throw para redirect después del auto-login
  }
}

// Verificar si un email ya existe
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    return !!data;
  } catch {
    return false;
  }
}

// Verificar si un username ya existe
export async function checkUsernameExists(username: string): Promise<boolean> {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.toLowerCase())
      .single();

    return !!data;
  } catch {
    return false;
  }
}

// ============================================
// FUNCIONES DE NOTIFICACIÓN (Server-side)
// ============================================

// Crear notificación de bienvenida
async function createWelcomeNotification(userId: string, username: string) {
  try {
    const supabase = createServerSupabaseClient();
    
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "welcome",
      title: "¡Bienvenido a Apocaliptyx! 🎉",
      message: `Hola @${username}, has recibido 1,000 AP Coins de regalo. ¡Comienza a predecir el futuro!`,
      link_url: "/dashboard",
      is_read: false,
    } as never);
    
    console.log("Notificación de bienvenida creada para:", username);
  } catch (error) {
    console.error("Error creando notificación de bienvenida:", error);
  }
}

// Crear notificación genérica (para usar en otras partes del servidor)
export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  imageUrl?: string;
}) {
  try {
    const supabase = createServerSupabaseClient();
    
    await supabase.from("notifications").insert({
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link_url: data.linkUrl || null,
      image_url: data.imageUrl || null,
      is_read: false,
    } as never);
    
    return { success: true };
  } catch (error) {
    console.error("Error creando notificación:", error);
    return { success: false, error };
  }
}