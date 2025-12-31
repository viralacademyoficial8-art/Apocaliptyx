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

// Registro de usuario
export async function registerUser(data: {
  email: string;
  password: string;
  username: string;
  name: string;
}): Promise<ActionResponse> {
  try {
    // Validaciones
    if (!data.email || !data.password || !data.username) {
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

    // TODO: Verificar si el email o username ya existen en la DB

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // TODO: Crear usuario en la DB
    // Por ahora solo simulamos el registro
    console.log("Usuario registrado:", {
      ...data,
      password: hashedPassword,
    });

    // Generar un ID temporal para el usuario (en producción vendrá de la DB)
    const newUserId = `user_${Date.now()}`;

    // 🔔 Crear notificación de bienvenida
    await createWelcomeNotification(newUserId, data.username);

    // Auto-login después del registro
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: "/dashboard",
    });

    return { success: true, message: "Registro exitoso", userId: newUserId };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message: "Error al registrar usuario",
        error: "auth_error",
      };
    }
    throw error;
  }
}

// Verificar si un email ya existe
export async function checkEmailExists(email: string): Promise<boolean> {
  // TODO: Implementar con DB
  const mockEmails = ["admin@apocaliptics.com", "user@test.com"];
  return mockEmails.includes(email);
}

// Verificar si un username ya existe
export async function checkUsernameExists(username: string): Promise<boolean> {
  // TODO: Implementar con DB
  const mockUsernames = ["admin", "testuser"];
  return mockUsernames.includes(username.toLowerCase());
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
      title: "¡Bienvenido a Apocaliptics! 🎉",
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