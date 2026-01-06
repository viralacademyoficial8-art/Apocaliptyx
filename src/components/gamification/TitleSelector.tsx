'use client';

import { useState } from 'react';
import { Crown, Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Title {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  isUnlocked: boolean;
  isActive: boolean;
}

interface TitleSelectorProps {
  titles: Title[];
  activeTitle?: Title | null;
  onSelectTitle: (titleId: string | null) => void;
}

const rarityBorders = {
  common: 'border-gray-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-500',
  mythic: 'border-pink-500',
};

const rarityLabels = {
  common: 'Común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario',
  mythic: 'Mítico',
};

export function TitleSelector({
  titles,
  activeTitle,
  onSelectTitle,
}: TitleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const unlockedTitles = titles.filter((t) => t.isUnlocked);
  const lockedTitles = titles.filter((t) => !t.isUnlocked);

  const handleSelect = (titleId: string | null) => {
    onSelectTitle(titleId);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors">
          {activeTitle ? (
            <>
              <span>{activeTitle.icon}</span>
              <span className="text-sm font-medium" style={{ color: activeTitle.color }}>
                {activeTitle.nameEs}
              </span>
            </>
          ) : (
            <>
              <Crown className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">Sin título</span>
            </>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            Seleccionar título
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* No title option */}
          <button
            onClick={() => handleSelect(null)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
              !activeTitle
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <span className="text-gray-400">Sin título</span>
            {!activeTitle && <Check className="w-5 h-5 text-purple-400" />}
          </button>

          {/* Unlocked titles */}
          {unlockedTitles.length > 0 && (
            <div>
              <h4 className="text-sm text-gray-400 mb-2">
                Títulos desbloqueados ({unlockedTitles.length})
              </h4>
              <div className="space-y-2">
                {unlockedTitles.map((title) => (
                  <button
                    key={title.id}
                    onClick={() => handleSelect(title.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                      title.isActive
                        ? `${rarityBorders[title.rarity]} bg-opacity-10`
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    style={{
                      backgroundColor: title.isActive ? `${title.color}10` : undefined,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{title.icon}</span>
                      <div className="text-left">
                        <p className="font-medium" style={{ color: title.color }}>
                          {title.nameEs}
                        </p>
                        <p className="text-xs text-gray-400">{title.descriptionEs}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          rarityBorders[title.rarity]
                        } border`}
                      >
                        {rarityLabels[title.rarity]}
                      </span>
                      {title.isActive && <Check className="w-5 h-5 text-purple-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Locked titles */}
          {lockedTitles.length > 0 && (
            <div>
              <h4 className="text-sm text-gray-400 mb-2">
                Títulos bloqueados ({lockedTitles.length})
              </h4>
              <div className="space-y-2">
                {lockedTitles.map((title) => (
                  <div
                    key={title.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-700 opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="w-6 h-6 text-gray-500" />
                      <div className="text-left">
                        <p className="font-medium text-gray-400">{title.nameEs}</p>
                        <p className="text-xs text-gray-500">{title.descriptionEs}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        rarityBorders[title.rarity]
                      } border opacity-50`}
                    >
                      {rarityLabels[title.rarity]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
