// src/lib/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export function createClient() {
  // Use fallback empty strings during build time to prevent errors
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}

// Singleton para uso en componentes
let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createClient();
  }
  return client;
}