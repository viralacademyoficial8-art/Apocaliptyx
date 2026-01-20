// Client-side Supabase utilities with lazy initialization
// This prevents build errors when environment variables aren't available during static generation

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Get a Supabase client for client-side use.
 * Uses lazy initialization to prevent build-time errors.
 * Returns null during SSR/build when env vars aren't available.
 */
export function getSupabaseBrowser(): SupabaseClient {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During SSR/build, env vars might not be available
  // Return a placeholder that will be replaced on client hydration
  if (!supabaseUrl || !supabaseAnonKey) {
    // Create a mock client that returns empty data
    // This prevents errors during static generation
    // The real client will be created on the client side
    if (!isBrowser) {
      // Return a minimal mock for SSR that won't throw
      return createMockSupabaseClient();
    }
    // If we're in browser and still no env vars, that's a real error
    console.error('Missing Supabase environment variables');
    return createMockSupabaseClient();
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

/**
 * Creates a mock Supabase client for SSR/build time
 * All methods return empty results to prevent errors
 */
function createMockSupabaseClient(): SupabaseClient {
  const mockQueryBuilder = {
    select: () => mockQueryBuilder,
    insert: () => mockQueryBuilder,
    update: () => mockQueryBuilder,
    delete: () => mockQueryBuilder,
    eq: () => mockQueryBuilder,
    neq: () => mockQueryBuilder,
    gt: () => mockQueryBuilder,
    gte: () => mockQueryBuilder,
    lt: () => mockQueryBuilder,
    lte: () => mockQueryBuilder,
    like: () => mockQueryBuilder,
    ilike: () => mockQueryBuilder,
    is: () => mockQueryBuilder,
    in: () => mockQueryBuilder,
    contains: () => mockQueryBuilder,
    containedBy: () => mockQueryBuilder,
    range: () => mockQueryBuilder,
    textSearch: () => mockQueryBuilder,
    filter: () => mockQueryBuilder,
    not: () => mockQueryBuilder,
    or: () => mockQueryBuilder,
    and: () => mockQueryBuilder,
    order: () => mockQueryBuilder,
    limit: () => mockQueryBuilder,
    offset: () => mockQueryBuilder,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: (value: { data: null; error: null }) => void) => {
      resolve({ data: null, error: null });
      return Promise.resolve({ data: null, error: null });
    },
  };

  const mockClient = {
    from: () => mockQueryBuilder,
    rpc: () => Promise.resolve({ data: null, error: null }),
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {},
      unsubscribe: () => {},
    }),
    removeChannel: () => Promise.resolve(),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        download: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        remove: () => Promise.resolve({ data: null, error: null }),
        list: () => Promise.resolve({ data: [], error: null }),
      }),
    },
  } as unknown as SupabaseClient;

  return mockClient;
}
