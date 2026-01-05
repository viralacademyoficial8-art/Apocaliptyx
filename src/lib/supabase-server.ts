// src/lib/supabase-server.ts

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Cached clients para evitar crear multiples instancias
let _anonClient: SupabaseClient | null = null;
let _serviceClient: SupabaseClient | null = null;

// Cliente de Supabase para uso en el servidor (Server Actions, API Routes)
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan las variables de entorno de Supabase");
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Cliente lazy-loaded con anon key (para build time safety)
export function getSupabaseClient(): SupabaseClient {
  if (!_anonClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    _anonClient = createClient(supabaseUrl, supabaseKey);
  }
  return _anonClient;
}

// Cliente lazy-loaded con service role key (para operaciones admin)
export function getSupabaseAdmin(): SupabaseClient {
  if (!_serviceClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    _serviceClient = createClient(supabaseUrl, serviceKey);
  }
  return _serviceClient;
}
