// =====================================================
// API: Oracle Status
// Devuelve el estado de los servicios del oráculo
// =====================================================

import { NextResponse } from 'next/server';
import { googleSearchService } from '@/services/google-search.service';
import { geminiService } from '@/services/gemini.service';

export async function GET() {
  try {
    const googleSearch = googleSearchService.isConfigured();
    const gemini = geminiService.isConfigured();

    return NextResponse.json({
      googleSearch,
      gemini,
      allConfigured: googleSearch && gemini,
    });
  } catch (error) {
    console.error('Error checking oracle status:', error);
    return NextResponse.json({
      googleSearch: false,
      gemini: false,
      allConfigured: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
