// src/app/api/help/view/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    // Incrementar vistas
    const { error } = await supabase.rpc('increment_help_article_views', {
      article_slug: slug
    });

    if (error) {
      console.error('View increment error:', error);
      return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Help view error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}