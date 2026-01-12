// src/services/duplicateDetection.service.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface SimilarScenario {
  id: string;
  title: string;
  description: string;
  similarity: number;
  status: string;
  created_at: string;
  current_price?: number;
  holder_username?: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  exactMatch: boolean;
  similarScenarios: SimilarScenario[];
  contentHash: string;
}

class DuplicateDetectionService {
  
  // Generar hash simple del contenido
  generateContentHash(title: string, description: string): string {
    const content = `${title.toLowerCase().trim()}|${description.toLowerCase().trim()}`;
    // Simple hash usando reduce
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  // Normalizar texto para comparación
  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
      .replace(/\s+/g, ' ') // Múltiples espacios a uno
      .trim();
  }

  // Calcular similitud entre dos strings (algoritmo de Jaccard)
  calculateSimilarity(str1: string, str2: string): number {
    const set1 = new Set(this.normalizeText(str1).split(' '));
    const set2 = new Set(this.normalizeText(str2).split(' '));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  // Calcular similitud de Levenshtein (distancia de edición)
  levenshteinSimilarity(str1: string, str2: string): number {
    const s1 = this.normalizeText(str1);
    const s2 = this.normalizeText(str2);
    
    if (s1 === s2) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;

    const matrix: number[][] = [];

    for (let i = 0; i <= s1.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[s1.length][s2.length];
    const maxLength = Math.max(s1.length, s2.length);
    return 1 - distance / maxLength;
  }

  // Verificar si un escenario es duplicado antes de crear
  async checkForDuplicates(
    title: string, 
    description: string,
    excludeId?: string
  ): Promise<DuplicateCheckResult> {
    const contentHash = this.generateContentHash(title, description);
    const normalizedTitle = this.normalizeText(title);
    
    // 1. Buscar coincidencia exacta por hash
    let exactMatchQuery = supabase
      .from('scenarios')
      .select('id, title, description, status, created_at')
      .eq('content_hash', contentHash);
    
    if (excludeId) {
      exactMatchQuery = exactMatchQuery.neq('id', excludeId);
    }
    
    const { data: exactMatches } = await exactMatchQuery;

    if (exactMatches && exactMatches.length > 0) {
      return {
        isDuplicate: true,
        exactMatch: true,
        similarScenarios: exactMatches.map(s => ({
          ...s,
          similarity: 100,
        })),
        contentHash,
      };
    }

    // 2. Buscar escenarios similares por título
    let similarQuery = supabase
      .from('scenarios')
      .select(`
        id, title, description, status, created_at, current_price,
        holder:users!scenarios_current_holder_id_fkey(username)
      `)
      .neq('status', 'CANCELLED');
    
    if (excludeId) {
      similarQuery = similarQuery.neq('id', excludeId);
    }

    const { data: allScenarios } = await similarQuery;

    if (!allScenarios) {
      return {
        isDuplicate: false,
        exactMatch: false,
        similarScenarios: [],
        contentHash,
      };
    }

    // 3. Calcular similitud para cada escenario
    const similarScenarios: SimilarScenario[] = [];

    for (const scenario of allScenarios) {
      // Similitud del título (peso 70%)
      const titleSimilarity = Math.max(
        this.calculateSimilarity(title, scenario.title),
        this.levenshteinSimilarity(title, scenario.title)
      );

      // Similitud de la descripción (peso 30%)
      const descSimilarity = Math.max(
        this.calculateSimilarity(description, scenario.description || ''),
        this.levenshteinSimilarity(description, scenario.description || '')
      );

      // Similitud combinada
      const combinedSimilarity = (titleSimilarity * 0.7) + (descSimilarity * 0.3);
      const similarityPercent = Math.round(combinedSimilarity * 100);

      // Solo incluir si la similitud es > 50%
      if (similarityPercent > 50) {
        // Extraer username del holder (puede venir como array o objeto)
        const holderData = scenario.holder as any;
        const holderUsername = Array.isArray(holderData)
          ? holderData[0]?.username
          : holderData?.username;

        similarScenarios.push({
          id: scenario.id,
          title: scenario.title,
          description: scenario.description,
          similarity: similarityPercent,
          status: scenario.status,
          created_at: scenario.created_at,
          current_price: scenario.current_price || 11, // Precio por defecto
          holder_username: holderUsername || 'creador',
        });
      }
    }

    // Ordenar por similitud descendente
    similarScenarios.sort((a, b) => b.similarity - a.similarity);

    // Tomar los top 5
    const topSimilar = similarScenarios.slice(0, 5);

    // Considerar duplicado si hay alguno con similitud >= 70%
    // Umbral reducido para ser más estrictos y forzar compra de escenarios existentes
    const isDuplicate = topSimilar.some(s => s.similarity >= 70);

    return {
      isDuplicate,
      exactMatch: false,
      similarScenarios: topSimilar,
      contentHash,
    };
  }

  // Actualizar el hash de un escenario
  async updateContentHash(scenarioId: string, title: string, description: string): Promise<void> {
    const contentHash = this.generateContentHash(title, description);
    
    await supabase
      .from('scenarios')
      .update({ 
        content_hash: contentHash,
        duplicate_checked: true,
      })
      .eq('id', scenarioId);
  }

  // Marcar un escenario como duplicado
  async markAsDuplicate(scenarioId: string, originalId: string): Promise<void> {
    await supabase
      .from('scenarios')
      .update({ 
        duplicate_of: originalId,
        status: 'CANCELLED',
      })
      .eq('id', scenarioId);
  }

  // Obtener sugerencias de escenarios similares mientras el usuario escribe
  async getSuggestions(partialTitle: string): Promise<SimilarScenario[]> {
    if (partialTitle.length < 5) return [];

    const { data: scenarios } = await supabase
      .from('scenarios')
      .select('id, title, description, status, created_at')
      .neq('status', 'CANCELLED')
      .limit(50);

    if (!scenarios) return [];

    const suggestions: SimilarScenario[] = [];

    for (const scenario of scenarios) {
      const similarity = this.levenshteinSimilarity(partialTitle, scenario.title);
      const similarityPercent = Math.round(similarity * 100);

      if (similarityPercent > 40) {
        suggestions.push({
          id: scenario.id,
          title: scenario.title,
          description: scenario.description,
          similarity: similarityPercent,
          status: scenario.status,
          created_at: scenario.created_at,
        });
      }
    }

    return suggestions
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  // Actualizar hashes de todos los escenarios existentes (para migración)
  async updateAllHashes(): Promise<number> {
    const { data: scenarios } = await supabase
      .from('scenarios')
      .select('id, title, description')
      .is('content_hash', null);

    if (!scenarios) return 0;

    let updated = 0;
    for (const scenario of scenarios) {
      await this.updateContentHash(scenario.id, scenario.title, scenario.description || '');
      updated++;
    }

    return updated;
  }
}

export const duplicateDetectionService = new DuplicateDetectionService();