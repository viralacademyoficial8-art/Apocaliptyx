// src/app/api/help/popular/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: articles, error } = await supabase
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