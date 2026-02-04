// =====================================================
// GEMINI AI SERVICE
// Servicio para verificación de escenarios con IA
// =====================================================

import { SearchResult } from './google-search.service';

export interface VerificationResult {
  fulfilled: boolean;
  confidence: number; // 0.0 a 1.0
  analysis: string;
  evidenceUrls: string[];
  reasoning: string;
  sources_checked: number;
  sources_confirming: number;
}

export interface GeminiResponse {
  success: boolean;
  result?: VerificationResult;
  rawResponse?: string;
  error?: string;
  executionTimeMs: number;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash'; // Modelo rápido y económico

export const geminiService = {
  // ============================================
  // VERIFICAR ESCENARIO
  // ============================================

  async verifyScenario(
    scenarioTitle: string,
    scenarioDescription: string,
    verificationCriteria: string | null,
    resolutionDate: string,
    searchResults: SearchResult[]
  ): Promise<GeminiResponse> {
    const startTime = Date.now();

    if (!GEMINI_API_KEY) {
      return {
        success: false,
        error: 'Gemini API key not configured',
        executionTimeMs: Date.now() - startTime,
      };
    }

    try {
      // Formatear resultados de búsqueda para el prompt
      const newsContext = searchResults
        .map((r, i) => `
[Noticia ${i + 1}]
Título: ${r.title}
Fuente: ${r.source}
URL: ${r.link}
Resumen: ${r.snippet}
${r.publishedDate ? `Fecha: ${r.publishedDate}` : ''}
---`)
        .join('\n');

      // Prompt optimizado para verificación
      const prompt = `Actúa como un verificador de hechos imparcial y riguroso para un juego de predicciones llamado "Apocaliptyx".

## Tu Tarea
Debes determinar si el siguiente escenario/predicción se CUMPLIÓ o NO basándote ÚNICAMENTE en las noticias proporcionadas.

## Escenario a Verificar
**Título:** ${scenarioTitle}
**Descripción:** ${scenarioDescription}
**Fecha límite:** ${resolutionDate}
${verificationCriteria ? `**Criterio de verificación:** ${verificationCriteria}` : ''}

## Noticias Encontradas (últimos 7 días)
${newsContext || 'No se encontraron noticias relevantes.'}

## Instrucciones
1. Analiza cada noticia y determina si es relevante para el escenario
2. Verifica si el evento descrito en el escenario OCURRIÓ ANTES de la fecha límite
3. Cuenta cuántas fuentes confirman o niegan el evento
4. Asigna un nivel de confianza basado en la cantidad y calidad de las fuentes

## Reglas Importantes
- Si NO hay noticias relevantes, el escenario NO se cumplió
- Necesitas al menos 2 fuentes confiables para confirmar que SÍ se cumplió
- Si hay información contradictoria, el escenario NO se cumplió (beneficio de la duda)
- Solo considera eventos que CLARAMENTE ocurrieron, no rumores o especulaciones

## Formato de Respuesta
Responde ÚNICAMENTE con un JSON válido (sin markdown, sin \`\`\`):

{
  "fulfilled": true/false,
  "confidence": 0.0-1.0,
  "analysis": "Resumen breve del análisis (máximo 200 caracteres)",
  "reasoning": "Explicación detallada del razonamiento",
  "evidenceUrls": ["url1", "url2"],
  "sources_checked": número,
  "sources_confirming": número
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.1, // Muy bajo para respuestas consistentes
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Gemini API error');
      }

      // Extraer texto de la respuesta
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Parsear JSON de la respuesta
      const result = this.parseVerificationResponse(rawText);

      return {
        success: true,
        result,
        rawResponse: rawText,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Gemini verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: Date.now() - startTime,
      };
    }
  },

  // ============================================
  // PARSEAR RESPUESTA DE GEMINI
  // ============================================

  parseVerificationResponse(rawText: string): VerificationResult {
    try {
      // Limpiar el texto por si viene con markdown
      let cleanText = rawText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleanText);

      return {
        fulfilled: Boolean(parsed.fulfilled),
        confidence: Math.min(1, Math.max(0, parseFloat(parsed.confidence) || 0)),
        analysis: String(parsed.analysis || 'No analysis provided'),
        reasoning: String(parsed.reasoning || 'No reasoning provided'),
        evidenceUrls: Array.isArray(parsed.evidenceUrls) ? parsed.evidenceUrls : [],
        sources_checked: parseInt(parsed.sources_checked) || 0,
        sources_confirming: parseInt(parsed.sources_confirming) || 0,
      };
    } catch (error) {
      console.error('Failed to parse Gemini response:', rawText);
      // Respuesta por defecto si falla el parsing
      return {
        fulfilled: false,
        confidence: 0,
        analysis: 'Error parsing AI response',
        reasoning: rawText,
        evidenceUrls: [],
        sources_checked: 0,
        sources_confirming: 0,
      };
    }
  },

  // ============================================
  // GENERAR MENSAJE DE NOTIFICACIÓN
  // ============================================

  async generateNotificationMessage(
    scenarioTitle: string,
    fulfilled: boolean,
    payoutAmount: number
  ): Promise<string> {
    if (!GEMINI_API_KEY) {
      // Mensaje por defecto si no hay API
      return fulfilled
        ? `¡Apocalipsis cumplido! "${scenarioTitle}" se hizo realidad. Ganaste ${payoutAmount} AP Coins.`
        : `El apocalipsis "${scenarioTitle}" no se cumplió esta vez.`;
    }

    try {
      const prompt = `Genera un mensaje corto y emocionante (máximo 100 caracteres) para notificar a un usuario de un juego de predicciones apocalípticas.

Escenario: "${scenarioTitle}"
¿Se cumplió?: ${fulfilled ? 'SÍ' : 'NO'}
${fulfilled ? `Cantidad ganada: ${payoutAmount} AP Coins` : ''}

El tono debe ser dramático pero divertido, usando el tema apocalíptico del juego.
Responde SOLO con el mensaje, sin comillas ni explicaciones.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 100 },
          }),
        }
      );

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        (fulfilled
          ? `¡El apocalipsis se cumplió! Ganaste ${payoutAmount} AP.`
          : `El apocalipsis no llegó... esta vez.`);
    } catch {
      return fulfilled
        ? `¡Apocalipsis cumplido! Ganaste ${payoutAmount} AP Coins.`
        : `El escenario no se cumplió.`;
    }
  },

  // ============================================
  // VERIFICAR CONFIGURACIÓN
  // ============================================

  isConfigured(): boolean {
    return !!GEMINI_API_KEY;
  },
};
