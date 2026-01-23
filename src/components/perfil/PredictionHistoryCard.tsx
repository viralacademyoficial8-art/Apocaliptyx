// src/components/perfil/PredictionHistoryCard.tsx

'use client';

import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { PredictionHistory } from '@/stores/profileStore';
import Link from 'next/link';

interface PredictionHistoryCardProps {
  prediction: PredictionHistory;
}

const resultConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  WON: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Ganada' },
  LOST: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Perdida' },
  PENDING: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Pendiente' },
  CANCELLED: { icon: MinusCircle, color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Cancelada' },
};

const categoryColors: Record<string, string> = {
  ECONOMIA: 'text-green-400 bg-green-500/20',
  TECNOLOGIA: 'text-blue-400 bg-blue-500/20',
  DEPORTES: 'text-orange-400 bg-orange-500/20',
  POLITICA: 'text-red-400 bg-red-500/20',
  CIENCIA: 'text-purple-400 bg-purple-500/20',
  ENTRETENIMIENTO: 'text-pink-400 bg-pink-500/20',
  OTROS: 'text-gray-400 bg-gray-500/20',
};

export function PredictionHistoryCard({ prediction }: PredictionHistoryCardProps) {
  const result = resultConfig[prediction.result];
  const ResultIcon = result.icon;
  const categoryColor = categoryColors[prediction.scenarioCategory] || categoryColors.OTROS;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Category */}
          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${categoryColor} mb-2`}>
            {prediction.scenarioCategory}
          </span>

          {/* Title */}
          <Link
            href={`/escenario/${prediction.scenarioId}`}
            className="block text-white font-medium hover:text-purple-400 transition-colors line-clamp-2 mb-2"
          >
            {prediction.scenarioTitle}
          </Link>

          {/* Prediction direction */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gray-400 text-sm">Predicción:</span>
            <span className={`flex items-center gap-1 ${
              prediction.prediction === 'UP' ? 'text-green-400' : 'text-red-400'
            }`}>
              {prediction.prediction === 'UP' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {prediction.prediction === 'UP' ? 'Sucederá' : 'No Sucederá'}
            </span>
          </div>

          {/* Amount & Date */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">
              Apostado: <span className="text-yellow-400 font-medium">{prediction.amount.toLocaleString()} AP</span>
            </span>
            <span className="text-gray-500">
              {new Date(prediction.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Result */}
        <div className="flex flex-col items-end">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${result.bg}`}>
            <ResultIcon className={`w-4 h-4 ${result.color}`} />
            <span className={`text-sm font-medium ${result.color}`}>{result.label}</span>
          </div>
          
          {prediction.result !== 'PENDING' && prediction.result !== 'CANCELLED' && (
            <span className={`mt-2 text-lg font-bold ${
              prediction.profit >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {prediction.profit >= 0 ? '+' : ''}{prediction.profit.toLocaleString()} AP
            </span>
          )}
        </div>
      </div>
    </div>
  );
}