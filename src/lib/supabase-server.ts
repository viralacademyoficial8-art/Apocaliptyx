// src/lib/supabase-server.ts

import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para uso en el servidor (Server Actions, API Routes)
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan las variables de entorno de Supabase");
  }

  return createClient(supabaseUrl, supabaseKey);
}