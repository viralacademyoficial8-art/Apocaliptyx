export const dynamic = 'force-dynamic';

// src/app/api/help/popular/route.ts

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  try {
    const { data: articles, error } = await getSupabaseAdmin()
      .from('help_articles')
      .select('slug, title, views')
      .order('views', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Popular articles error:', error);
      return NextResponse.json({ articles: [] });
    }

    return NextResponse.json({ articles: articles || [] });
  } catch (error) {
    console.error('Help popular error:', error);
    return NextResponse.json({ articles: [] });
  }
}