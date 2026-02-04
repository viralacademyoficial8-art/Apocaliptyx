// =====================================================
// GOOGLE CUSTOM SEARCH SERVICE
// Servicio para buscar noticias en tiempo real
// =====================================================

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
  publishedDate?: string;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  totalResults: number;
  error?: string;
}

const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

export const googleSearchService = {
  // ============================================
  // BÚSQUEDA PRINCIPAL
  // ============================================

  async search(
    query: string,
    options?: {
      dateRestrict?: string; // d1 = last day, w1 = last week, m1 = last month
      siteRestrict?: string[]; // Buscar solo en estos dominios
      numResults?: number;
    }
  ): Promise<SearchResponse> {
    if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
      console.error('Google Search API credentials not configured');
      return {
        success: false,
        query,
        results: [],
        totalResults: 0,
        error: 'Google Search API not configured',
      };
    }

    try {
      const numResults = options?.numResults || 10;

      // Construir query con restricciones de sitio si las hay
      let searchQuery = query;
      if (options?.siteRestrict && options.siteRestrict.length > 0) {
        const siteQuery = options.siteRestrict.map(site => `site:${site}`).join(' OR ');
        searchQuery = `${query} (${siteQuery})`;
      }

      const params = new URLSearchParams({
        key: GOOGLE_API_KEY,
        cx: GOOGLE_SEARCH_ENGINE_ID,
        q: searchQuery,
        num: numResults.toString(),
        sort: 'date', // Ordenar por fecha más reciente
      });

      // Agregar restricción de fecha si se especifica
      if (options?.dateRestrict) {
        params.append('dateRestrict', options.dateRestrict);
      }

      const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Google Search API error');
      }

      const results: SearchResult[] = (data.items || []).map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        source: new URL(item.link).hostname.replace('www.', ''),
        publishedDate: item.pagemap?.metatags?.[0]?.['article:published_time'] ||
                       item.pagemap?.metatags?.[0]?.['og:updated_time'] ||
                       undefined,
      }));

      return {
        success: true,
        query: searchQuery,
        results,
        totalResults: parseInt(data.searchInformation?.totalResults || '0'),
      };
    } catch (error) {
      console.error('Google Search error:', error);
      return {
        success: false,
        query,
        results: [],
        totalResults: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // ============================================
  // BÚSQUEDA DE NOTICIAS PARA ESCENARIO
  // ============================================

  async searchForScenario(
    scenarioTitle: string,
    verificationCriteria: string | null,
    trustedSources: string[]
  ): Promise<SearchResponse> {
    // Construir query inteligente
    const query = verificationCriteria
      ? `${scenarioTitle} ${verificationCriteria}`
      : scenarioTitle;

    // Buscar en fuentes confiables, últimos 7 días
    return this.search(query, {
      dateRestrict: 'w1', // Última semana
      siteRestrict: trustedSources.length > 0 ? trustedSources : undefined,
      numResults: 10,
    });
  },

  // ============================================
  // BÚSQUEDA DE DATOS ESPECÍFICOS (ej: precios)
  // ============================================

  async searchSpecificData(
    dataType: 'crypto_price' | 'stock_price' | 'sports_result' | 'election_result' | 'general',
    query: string
  ): Promise<SearchResponse> {
    // Adaptar fuentes según el tipo de dato
    const sourcesMap: Record<string, string[]> = {
      crypto_price: ['coindesk.com', 'cointelegraph.com', 'coinmarketcap.com', 'bloomberg.com'],
      stock_price: ['bloomberg.com', 'reuters.com', 'wsj.com', 'ft.com', 'yahoo.com'],
      sports_result: ['espn.com', 'bbc.com/sport', 'sports.yahoo.com', 'reuters.com'],
      election_result: ['reuters.com', 'apnews.com', 'bbc.com', 'nytimes.com'],
      general: ['reuters.com', 'apnews.com', 'bbc.com', 'bloomberg.com'],
    };

    return this.search(query, {
      dateRestrict: 'd3', // Últimos 3 días para datos específicos
      siteRestrict: sourcesMap[dataType],
      numResults: 5,
    });
  },

  // ============================================
  // VERIFICAR CONFIGURACIÓN
  // ============================================

  isConfigured(): boolean {
    return !!(GOOGLE_API_KEY && GOOGLE_SEARCH_ENGINE_ID);
  },
};
