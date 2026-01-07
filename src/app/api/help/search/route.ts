export const dynamic = 'force-dynamic';

// src/app/api/help/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ articles: [] });
    }

    // Buscar en título, descripción y keywords
    const { data: articles, error } = await getSupabaseAdmin()
      .from('help_articles')
      .select('slug, title, description, category, views')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,keywords.cs.{${query}}`)
      .order('views', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ articles: [] });
    }

    return NextResponse.json({ articles: articles || [] });
  } catch (error) {
    console.error('Help search error:', error);
    return NextResponse.json({ articles: [] });
  }
}