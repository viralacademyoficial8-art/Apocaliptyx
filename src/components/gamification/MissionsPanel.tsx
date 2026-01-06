'use client';

import { useState } from 'react';
import { Target, Clock, Gift, CheckCircle, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Mission {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  progress: number;
  target: number;
  rewards: {
    apCoins?: number;
    xp?: number;
  };
  isCompleted: boolean;
  isClaimed: boolean;
  expiresAt?: string;
}

interface MissionsPanelProps {
  dailyMissions: Mission[];
  weeklyMissions: Mission[];
  onClaimReward: (missionId: string) => void;
}

const difficultyColors = {
  easy: 'text-green-400 bg-green-500/20',
  medium: 'text-yellow-400 bg-yellow-500/20',
  hard: 'text-orange-400 bg-orange-500/20',
  extreme: 'text-red-400 bg-red-500/20',
};

const difficultyLabels = {
  easy: 'Fácil',
  medium: 'Media',
  hard: 'Difícil',
  extreme: 'Extrema',
};

export function MissionsPanel({
  dailyMissions,
  weeklyMissions,
  onClaimReward,
}: MissionsPanelProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  const missions = activeTab === 'daily' ? dailyMissions : weeklyMissions;
  const completedCount = missions.filter((m) => m.isCompleted).length;

  const renderMission = (mission: Mission) => {
    const progress = (mission.progress / mission.target) * 100;

    return (
      <div
        key={mission.id}
        className={`bg-gray-900/50 rounded-lg p-4 border transition-colors ${
          mission.isCompleted
            ? 'border-green-500/50 bg-green-500/5'
            : 'border-gray-700'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">{mission.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">{mission.nameEs}</h4>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  difficultyColors[mission.difficulty]
                }`}
              >
                {difficultyLabels[mission.difficulty]}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-3">{mission.descriptionEs}</p>

            {/* Progress */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Progreso</span>
                <span className="text-gray-300">
                  {mission.progress} / {mission.target}
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            {/* Rewards */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                {mission.rewards.apCoins && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <span>🪙</span>
                    {mission.rewards.apCoins} AP
                  </span>
                )}
                {mission.rewards.xp && (
                  <span className="flex items-center gap-1 text-purple-400">
                    <span>✨</span>
                    {mission.rewards.xp} XP
                  </span>
                )}
              </div>

              {mission.isCompleted && !mission.isClaimed ? (
                <Button
                  size="sm"
                  onClick={() => onClaimReward(mission.id)}
                  className="bg-green-600 hover:bg-green-700 text-xs"
                >
                  <Gift className="w-3 h-3 mr-1" />
                  Reclamar
                </Button>
              ) : mission.isClaimed ? (
                <span className="flex items-center gap-1 text-green-400 text-xs">
                  <CheckCircle className="w-4 h-4" />
                  Reclamado
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Misiones
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <CheckCircle className="w-4 h-4 text-green-400" />
            {completedCount}/{missions.length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'daily'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Diarias
          </div>
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'weekly'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Semanales
          </div>
        </button>
      </div>

      {/* Missions List */}
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {missions.length > 0 ? (
          missions.map(renderMission)
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay misiones disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}

